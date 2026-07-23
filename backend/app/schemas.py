from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# 1. SCHEMAS PARA LA IA (GEMINI STRUCTURED OUTPUT)
class AnalisisCorteIA(BaseModel):
    id: int
    cantidad: int
    largo_mm: int
    ancho_mm: int
    descripcion: Optional[str] = None
    puede_rotar: bool = True
    tapacanto_largo: int
    tapacanto_ancho: int

class ListaCortesIA(BaseModel):
    cortes: List[AnalisisCorteIA]


# 2. SCHEMAS DE ENTRADA (REQUESTS DE LA API)
class UsuarioCreate(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    email: Optional[str] = None

class UsuarioSync(BaseModel):
    nombre: str
    email: Optional[str] = None

class CorteCreate(BaseModel):
    cantidad: int
    largo_mm: int
    ancho_mm: int
    descripcion: Optional[str] = None
    puede_rotar: bool = True
    tapacanto_largo: int = 0
    tapacanto_ancho: int = 0

class TrabajoCreate(BaseModel):
    id_usuario: str
    nombre: str

class TrabajoGuardarRequest(BaseModel):
    """Payload para guardar el borrador confirmado desde el Frontend"""
    nombre_trabajo: str = "Trabajo sin nombre"
    cortes: List[CorteCreate]

class TrabajoUpdate(BaseModel):
    """Payload para modificar un trabajo y sus cortes ya existentes"""
    nombre: Optional[str] = None
    cortes: List[CorteCreate]


# 3. SCHEMAS DE SALIDA (RESPONSES DE LA API)
class CorteResponse(BaseModel):
    id: int
    id_trabajo: int
    cantidad: int
    largo_mm: int
    ancho_mm: int
    descripcion: Optional[str] = None
    puede_rotar: bool
    tapacanto_largo: int
    tapacanto_ancho: int
    
    # Calculados para la interfaz o el .txt
    canto_arr: int
    canto_aba: int
    canto_izq: int
    canto_der: int

    model_config = ConfigDict(from_attributes=True)


class TrabajoResponse(BaseModel):
    id: int
    id_usuario: str
    nombre: str
    fecha: datetime
    cortes: List[CorteResponse] = []

    model_config = ConfigDict(from_attributes=True)


class UsuarioResponse(BaseModel):
    id: str
    nombre: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    creditos_restantes: int
    fecha_registro: datetime

    model_config = ConfigDict(from_attributes=True)
