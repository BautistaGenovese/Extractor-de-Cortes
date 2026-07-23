from fastapi import Request, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
import base64

from app.database import get_db
from app.models import Usuario

security = HTTPBearer()

def get_clerk_jwks_url():
    pk = os.getenv("VITE_CLERK_PUBLISHABLE_KEY")
    if not pk:
        raise ValueError("Falta VITE_CLERK_PUBLISHABLE_KEY en .env")
    
    try:
        # pk_test_XXXX -> XXXX
        b64_part = pk.split("_")[2]
        # Añadir padding si es necesario
        b64_part += "=" * ((4 - len(b64_part) % 4) % 4)
        decoded = base64.b64decode(b64_part).decode('utf-8')
        domain = decoded.rstrip('$')
        return f"https://{domain}/.well-known/jwks.json"
    except Exception as e:
        print("Error decodificando la Publishable Key de Clerk:", e)
        # Fallback genérico por si falla, aunque el ideal es decodificar
        return "https://api.clerk.com/v1/jwks" 

jwks_client = None

def get_jwks_client():
    global jwks_client
    if jwks_client is None:
        url = get_clerk_jwks_url()
        jwks_client = PyJWKClient(url)
    return jwks_client


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    token = credentials.credentials
    try:
        # Obtener el cliente JWK
        client = get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(token)
        
        # Validar el token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}, # No validamos audience por simplicidad
            leeway=300 # Tolerancia de 5 minutos para desfase horario
        )
        
        clerk_id = payload.get("sub")
        if not clerk_id:
            raise HTTPException(status_code=401, detail="Token inválido: falta 'sub'")

        # Buscar usuario en DB
        stmt = select(Usuario).where(Usuario.id == clerk_id)
        result = await db.execute(stmt)
        usuario = result.scalars().first()

        # Lazy Creation: Si no existe, lo creamos
        if not usuario:
            # Puedes extraer más info si la incluyes en los claims del token
            nuevo_usuario = Usuario(
                id=clerk_id,
                nombre="Usuario " + clerk_id[:4], # Nombre temporal
                email=None, 
                creditos_restantes=10 # Créditos iniciales
            )
            db.add(nuevo_usuario)
            await db.commit()
            await db.refresh(nuevo_usuario)
            usuario = nuevo_usuario
            
        return usuario

    except jwt.ExpiredSignatureError:
        print("Error auth: El token ha expirado.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El token ha expirado.")
    except jwt.InvalidTokenError as e:
        print(f"Error auth token inválido: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token inválido: {str(e)}")
    except Exception as e:
        print(f"Error auth general: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"No autorizado: {str(e)}")
