from google import genai
from google.genai import types
from PIL import Image
from typing import List
from app.config import settings
from app.schemas import ListaCortesIA

# Inicializamos el cliente de Gemini con la API Key configurada
client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def analizar_hojas_de_corte(imagenes: List[Image.Image]) -> ListaCortesIA:
    """
    Recibe una lista de imágenes (de 1 a 4 hojas) y utiliza Gemini 
    para extraer y estructurar las medidas de los cortes y tapacantos.
    """
    prompt = """
    Sos un asistente experto en carpintería y optimización de cortes. 
    Analizá las imágenes que contienen listas de cortes de placas.
    Extraé la información de manera estrictamente estructurada de todas las hojas.

    Cada imagen tiene varios items con esta estructura:
    CANTIDAD = LARGO x ANCHO (DESCRIPCIÓN)

    Algunas medidas pueden tener números como "potencias", esto es un decimal más, así que tratalos como tal. Por ejemplo: 0.33² será 0.332. Las medidas están en metros y debes de transformarlas a milímetros (m -> mm). 

    Cada medida (Largo o Ancho) puede estar subrayada. Esto significa que de este lado de la placa se coloca tapacantos.

    Presta mucha atención a la cantidad de líneas de subrayado:
    - Sin subrayar: 0
    - Subrayado simple: 1
    - Doble subrayado: 2

    Por ejemplo, si el largo tiene doble subrayado, el valor correspondiente deberá ser "tapacanto_largo": 2.

    En la descripción a veces se incluyes las Comillas de Repetición. 

    Reglas de las Comillas de Repetición:
    - Se colocan directamente debajo del centro de la palabra que se quiere repetir. Esto se hace para ahorrar tiempo en la escritura.
    - Usa un juego de comillas por cada palabra individual, no un solo par para toda la frase.
    - La palabra de arriba debe coincidir exactamente en género (masculino/femenino) y número (singular/plural) con la que estás omitiendo.

    Ejemplo correcto:
    - Camisa color blanca
    -   "      "   negra
    (Significa: "Camisa color negra")

    El parametro de "puede_rotar" siempre es True.

    Los IDs deberán empezar con 1 y ser consecutivos a lo largo de todas las hojas para que la respuesta final quede perfectamente ordenada.
    """

    configuracion = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=ListaCortesIA,
    )

    # Llamada asíncrona usando la versión .aio del cliente
    response = await client.aio.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=[prompt, *imagenes],
        config=configuracion
    )

    # Validamos e instanciamos la respuesta directamente en el Pydantic Schema
    datos_estructurados = ListaCortesIA.model_validate_json(response.text)
    
    return datos_estructurados
