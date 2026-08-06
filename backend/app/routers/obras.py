from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Obra, Usuario
from app.dependencies.auth import get_current_user
from app.schemas import (
    ObraCreate,
    ObraResponse,
    ObraUpdate,
    TrabajoResponse
)
from app.services.corte_service import mapear_trabajo_a_response

router = APIRouter(
    prefix="/api/obras",
    tags=["Obras"]
)

# 1. CREAR UNA OBRA
@router.post("/", response_model=ObraResponse, status_code=status.HTTP_201_CREATED)
async def crear_obra(
    payload: ObraCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    nueva_obra = Obra(
        id_usuario=current_user.id,
        nombre=payload.nombre,
        nombre_cliente=payload.nombre_cliente,
        descripcion=payload.descripcion
    )
    db.add(nueva_obra)
    await db.commit()
    await db.refresh(nueva_obra)
    
    return nueva_obra


# 2. OBTENER TODAS LAS OBRAS DEL USUARIO (LISTA)
@router.get("/", response_model=List[ObraResponse])
async def listar_obras(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Obra).where(Obra.id_usuario == current_user.id)
    result = await db.execute(stmt)
    obras = result.scalars().all()
    
    return obras


# 3. OBTENER UNA OBRA ESPECÍFICA CON SUS TRABAJOS
@router.get("/{id_obra}", response_model=ObraResponse)
async def obtener_obra(
    id_obra: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Traemos la obra y usamos selectinload para traer también sus trabajos
    stmt = select(Obra).where(Obra.id == id_obra, Obra.id_usuario == current_user.id).options(selectinload(Obra.trabajos))
    result = await db.execute(stmt)
    obra = result.scalar_one_or_none()

    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
        
    return obra


# 4. MODIFICAR UNA OBRA
@router.put("/{id_obra}", response_model=ObraResponse)
async def modificar_obra(
    id_obra: str,
    payload: ObraUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Obra).where(Obra.id == id_obra, Obra.id_usuario == current_user.id)
    result = await db.execute(stmt)
    obra = result.scalar_one_or_none()

    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")

    if payload.nombre is not None:
        obra.nombre = payload.nombre
    if payload.nombre_cliente is not None:
        obra.nombre_cliente = payload.nombre_cliente
    # En tu schema agregaste descripcion (si decidiste dejarla)
    if hasattr(payload, 'descripcion') and payload.descripcion is not None:
        obra.descripcion = payload.descripcion

    await db.commit()
    await db.refresh(obra)
    return obra


# 5. ELIMINAR UNA OBRA
@router.delete("/{id_obra}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_obra(
    id_obra: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Obra).where(Obra.id == id_obra, Obra.id_usuario == current_user.id)
    result = await db.execute(stmt)
    obra = result.scalar_one_or_none()

    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")

    await db.delete(obra)
    await db.commit()
    return None
