import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    # Identificador único e inmutable (UUID)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(30), unique=True, index=True, nullable=True)  # Modificable
    email = Column(String(150), unique=True, index=True, nullable=True)
    creditos_restantes = Column(Integer, default=20)  # Control de cuota
    fecha_registro = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relación: Un usuario tiene muchos trabajos
    trabajos = relationship("Trabajo", back_populates="usuario", cascade="all, delete-orphan")


class Trabajo(Base):
    __tablename__ = "trabajos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(String, ForeignKey("usuarios.id"), nullable=False)
    nombre = Column(String(150), nullable=False)
    fecha = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relaciones
    usuario = relationship("Usuario", back_populates="trabajos")
    cortes = relationship("Corte", back_populates="trabajo", cascade="all, delete-orphan", lazy="selectin")


class Corte(Base):
    __tablename__ = "cortes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_trabajo = Column(Integer, ForeignKey("trabajos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    largo_mm = Column(Integer, nullable=False)
    ancho_mm = Column(Integer, nullable=False)
    descripcion = Column(String(200), nullable=True)
    puede_rotar = Column(Boolean, default=True)
    tapacanto_largo = Column(Integer, default=0)  # 0: sin, 1: simple, 2: doble, etc.
    tapacanto_ancho = Column(Integer, default=0)

    # Relación
    trabajo = relationship("Trabajo", back_populates="cortes")
