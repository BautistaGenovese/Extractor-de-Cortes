from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models
from app.routers import trabajos, usuarios

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Extractor de Cortes - Carpintería",
    lifespan=lifespan
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Configuración de CORS para permitir peticiones desde React/Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # En producción se cambia por el dominio del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas
app.include_router(trabajos.router)
app.include_router(usuarios.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "API del Extractor de Cortes lista y escuchando"}
