from typing import Annotated, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from PIL import Image
import io

from app.database import get_db
from app.models import Trabajo
from app.schemas import (
    TrabajoResponse, 
    ListaCortesIA, 
    TrabajoGuardarRequest, 
    TrabajoUpdate
)
from app.services.gemini_service import analizar_hojas_de_corte
from app.services.corte_service import (
    verificar_creditos_usuario,
    guardar_trabajo_confirmado,
    actualizar_trabajo_existente,
    mapear_trabajo_a_response
)
from app.services.export_service import generar_contenido_txt

router = APIRouter(
    prefix="/api/trabajos",
    tags=["Trabajos"]
)

# 1. PASO 1 DE LA CREACIÓN: Analiza las fotos y devuelve el borrador
@router.post("/analizar", response_model=ListaCortesIA)
async def analizar_fotos_trabajo(
    id_usuario: Annotated[str, Form()],
    fotos: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    if len(fotos) < 1 or len(fotos) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes subir entre 1 y 4 imágenes."
        )

    # Verifica si tiene crédito disponible antes de consumir Gemini
    await verificar_creditos_usuario(db=db, id_usuario=id_usuario)

    imagenes_pil: list[Image.Image] = []
    for foto in fotos:
        try:
            contenido = await foto.read()
            imagen = Image.open(io.BytesIO(contenido))
            imagenes_pil.append(imagen)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El archivo {foto.filename} no es una imagen válida."
            )

    # Llama a Gemini y devuelve los datos preliminares al Frontend
    datos_ia = await analizar_hojas_de_corte(imagenes_pil)
    return datos_ia


# 2. PASO 2 DE LA CREACIÓN: El usuario aprueba/edita la tabla en React y toca "Guardar"
@router.post("/guardar", response_model=TrabajoResponse, status_code=status.HTTP_201_CREATED)
async def guardar_trabajo(
    payload: TrabajoGuardarRequest,
    db: AsyncSession = Depends(get_db)
):
    usuario = await verificar_creditos_usuario(db=db, id_usuario=payload.id_usuario)

    nuevo_trabajo = await guardar_trabajo_confirmado(
        db=db,
        usuario=usuario,
        nombre_trabajo=payload.nombre_trabajo,
        cortes_data=payload.cortes
    )

    return mapear_trabajo_a_response(nuevo_trabajo)


# 3. OBTENER UN TRABAJO POR ID
@router.get("/{id_trabajo}", response_model=TrabajoResponse)
async def obtener_trabajo(id_trabajo: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Trabajo).where(Trabajo.id == id_trabajo).options(selectinload(Trabajo.cortes))
    result = await db.execute(stmt)
    trabajo = result.scalar_one_or_none()

    if not trabajo:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")

    return mapear_trabajo_a_response(trabajo)


# 4. MODIFICAR UN TRABAJO EXISTENTE (Cambiar medidas/cantidades desde el historial)
@router.put("/{id_trabajo}", response_model=TrabajoResponse)
async def modificar_trabajo(
    id_trabajo: int,
    payload: TrabajoUpdate,
    db: AsyncSession = Depends(get_db)
):
    trabajo_actualizado = await actualizar_trabajo_existente(
        db=db,
        id_trabajo=id_trabajo,
        nombre_trabajo=payload.nombre,
        cortes_data=payload.cortes
    )
    return mapear_trabajo_a_response(trabajo_actualizado)


# 5. EXPORTAR A TXT
@router.get("/{id_trabajo}/exportar-txt")
async def exportar_trabajo_txt(id_trabajo: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Trabajo).where(Trabajo.id == id_trabajo).options(selectinload(Trabajo.cortes))
    result = await db.execute(stmt)
    trabajo = result.scalar_one_or_none()

    if not trabajo:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")

    contenido = generar_contenido_txt(trabajo)
    nombre_archivo = f"trabajo_{trabajo.id}_{trabajo.nombre.replace(' ', '_')}.txt"

    return PlainTextResponse(
        content=contenido,
        headers={"Content-Disposition": f"attachment; filename={nombre_archivo}"}
    )


# 6. ELIMINAR TRABAJO
@router.delete("/{id_trabajo}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_trabajo(id_trabajo: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Trabajo).where(Trabajo.id == id_trabajo).options(selectinload(Trabajo.cortes))
    result = await db.execute(stmt)
    trabajo = result.scalar_one_or_none()

    if not trabajo:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")

    # Borra el trabajo y sus cortes asociados
    await db.delete(trabajo)
    await db.commit()
    return None
