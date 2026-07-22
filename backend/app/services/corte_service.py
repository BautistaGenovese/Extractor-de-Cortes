from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models import Trabajo, Corte, Usuario
from app.schemas import ListaCortesIA, TrabajoResponse, CorteResponse


async def verificar_creditos_usuario(db: AsyncSession, id_usuario: str) -> Usuario:
    stmt = select(Usuario).where(Usuario.id == id_usuario)
    res = await db.execute(stmt)
    usuario = res.scalar_one_or_none()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no existe."
        )

    if usuario.creditos_restantes <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No tienes créditos suficientes para procesar nuevos trabajos."
        )

    return usuario


async def guardar_trabajo_confirmado(
    db: AsyncSession,
    usuario: Usuario,
    nombre_trabajo: str,
    cortes_data: list
) -> Trabajo:
    # 1. Descontar crédito
    usuario.creditos_restantes -= 1

    # 2. Crear trabajo
    nuevo_trabajo = Trabajo(
        id_usuario=usuario.id,
        nombre=nombre_trabajo
    )
    db.add(nuevo_trabajo)
    await db.flush()

    # 3. Guardar los cortes confirmados/editados por el usuario
    for c in cortes_data:
        nuevo_corte = Corte(
            id_trabajo=nuevo_trabajo.id,
            cantidad=c.cantidad,
            largo_mm=c.largo_mm,
            ancho_mm=c.ancho_mm,
            descripcion=c.descripcion,
            puede_rotar=c.puede_rotar,
            tapacanto_largo=c.tapacanto_largo,
            tapacanto_ancho=c.tapacanto_ancho
        )
        db.add(nuevo_corte)

    await db.commit()

    # 4. Retornar con relaciones precargadas
    stmt = (
        select(Trabajo)
        .where(Trabajo.id == nuevo_trabajo.id)
        .options(selectinload(Trabajo.cortes))
    )
    res = await db.execute(stmt)
    return res.scalar_one()


async def actualizar_trabajo_existente(
    db: AsyncSession,
    id_trabajo: int,
    nombre_trabajo: str,
    cortes_data: list
) -> Trabajo:
    stmt = select(Trabajo).where(Trabajo.id == id_trabajo).options(selectinload(Trabajo.cortes))
    res = await db.execute(stmt)
    trabajo = res.scalar_one_or_none()

    if not trabajo:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")

    if nombre_trabajo:
        trabajo.nombre = nombre_trabajo

    # 1. Eliminar cortes viejos en la BD
    for c_viejo in trabajo.cortes:
        await db.delete(c_viejo)

    await db.flush()

    # 2. Insertar los cortes nuevos/editados
    for c in cortes_data:
        c_dict = c.model_dump() if hasattr(c, 'model_dump') else (c if isinstance(c, dict) else c.__dict__)
        
        nuevo_corte = Corte(
            id_trabajo=trabajo.id,
            cantidad=int(c_dict.get('cantidad', 1)),
            largo_mm=int(c_dict.get('largo_mm', 0)),
            ancho_mm=int(c_dict.get('ancho_mm', 0)),
            descripcion=c_dict.get('descripcion', ''),
            puede_rotar=bool(c_dict.get('puede_rotar', True)),
            tapacanto_largo=int(c_dict.get('tapacanto_largo', 0)),
            tapacanto_ancho=int(c_dict.get('tapacanto_ancho', 0))
        )
        db.add(nuevo_corte)

    await db.commit()

    # 3. Retornar trabajo actualizado
    res_updated = await db.execute(stmt)
    return res_updated.scalar_one()


def mapear_trabajo_a_response(trabajo: Trabajo) -> TrabajoResponse:
    """
    Convierte un objeto Trabajo de SQLAlchemy a un TrabajoResponse de Pydantic
    calculando los lados reales de los tapacantos (arriba, abajo, izq, der).
    """
    cortes_response = []
    
    for c in trabajo.cortes:
        # Lógica de conversión de tapacantos
        if c.tapacanto_largo == 1:
            canto_arr, canto_aba = 1, 0
        elif c.tapacanto_largo == 2:
            canto_arr, canto_aba = 1, 1
        elif c.tapacanto_largo == 3:
            canto_arr, canto_aba = 2, 0
        elif c.tapacanto_largo == 4:
            canto_arr, canto_aba = 2, 2
        else:
            canto_arr, canto_aba = 0, 0

        if c.tapacanto_ancho == 1:
            canto_izq, canto_der = 1, 0
        elif c.tapacanto_ancho == 2:
            canto_izq, canto_der = 1, 1
        elif c.tapacanto_ancho == 3:
            canto_izq, canto_der = 2, 0
        elif c.tapacanto_ancho == 4:
            canto_izq, canto_der = 2, 2
        else:
            canto_izq, canto_der = 0, 0

        cortes_response.append(
            CorteResponse(
                id=c.id,
                id_trabajo=c.id_trabajo,
                cantidad=c.cantidad,
                largo_mm=c.largo_mm,
                ancho_mm=c.ancho_mm,
                descripcion=c.descripcion,
                puede_rotar=c.puede_rotar,
                tapacanto_largo=c.tapacanto_largo,
                tapacanto_ancho=c.tapacanto_ancho,

                canto_arr=canto_arr,
                canto_aba=canto_aba,
                canto_izq=canto_izq,
                canto_der=canto_der
            )
        )

    return TrabajoResponse(
        id=trabajo.id,
        id_usuario=trabajo.id_usuario,
        nombre=trabajo.nombre,
        fecha=trabajo.fecha,
        cortes=cortes_response
    )

