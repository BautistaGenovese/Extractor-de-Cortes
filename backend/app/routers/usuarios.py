from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.database import get_db
from app.models import Usuario, Trabajo
from app.schemas import UsuarioCreate, UsuarioResponse, TrabajoResponse
from app.services.corte_service import mapear_trabajo_a_response

router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"]
)

@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def crear_usuario(
    usuario_in: UsuarioCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Crea un nuevo usuario en la base de datos.
    """
    # Verificar si el teléfono ya está registrado (si se envió)
    if usuario_in.telefono:
        result = await db.execute(select(Usuario).where(Usuario.telefono == usuario_in.telefono))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de teléfono ya está registrado."
            )

    nuevo_usuario = Usuario(
        nombre=usuario_in.nombre,
        telefono=usuario_in.telefono,
        email=usuario_in.email
    )

    db.add(nuevo_usuario)
    await db.commit()
    await db.refresh(nuevo_usuario)

    return nuevo_usuario


@router.get("/{id_usuario}", response_model=UsuarioResponse)
async def obtener_usuario(id_usuario: str, db: AsyncSession = Depends(get_db)):
    """Obtiene los datos de perfil y créditos de un usuario."""
    stmt = select(Usuario).where(Usuario.id == id_usuario)
    res = await db.execute(stmt)
    usuario = res.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return usuario


@router.get("/{id_usuario}/trabajos", response_model=List[TrabajoResponse])
async def listar_trabajos_usuario(id_usuario: str, db: AsyncSession = Depends(get_db)):
    """Lista todos los trabajos procesados por un usuario específico."""
    stmt = (
        select(Trabajo)
        .where(Trabajo.id_usuario == id_usuario)
        .options(selectinload(Trabajo.cortes))
        .order_by(Trabajo.fecha.desc())
    )
    result = await db.execute(stmt)
    trabajos = result.scalars().all()

    return [mapear_trabajo_a_response(t) for t in trabajos]
