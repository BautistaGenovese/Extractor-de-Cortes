# Extractor de Cortes

Extractor de Cortes es una aplicación web diseñada para carpinteros y talleres de mobiliario. Permite digitalizar y estructurar listas de despiece (hojas de corte) a partir de fotos o imágenes utilizando Inteligencia Artificial (Google Gemini), facilitando su edición manual y posterior exportación a formatos estándar de optimización de corte.

---

## Características Principales

*   **Lectura de Hojas de Corte con IA:** Sube hasta 4 fotos simultáneas de despieces escritos a mano o impresos para que la IA extraiga automáticamente cantidades, dimensiones (largo/ancho), descripciones, tapacantos y propiedades de rotación.
*   **Editor Multidispositivo:** Grid interactivo optimizado para PC (vista de tabla) y celulares (vista de tarjetas colapsables con menú de edición rápido).
*   **Validación de Datos en Tiempo Real:** Detección automática de campos faltantes o incorrectos antes de guardar.
*   **Control de Cambios:** Prevención de escrituras innecesarias en la base de datos si no hay modificaciones reales respecto al estado inicial.
*   **Exportación Directa:** Descarga o copia del despiece en formato `.txt` tabulado compatible con optimizadores de corte tradicionales.
*   **Historial y Estadísticas:** Panel central con buscador y métricas clave (material optimizado, total de piezas procesadas y proyectos guardados).

---

## Arquitectura y Stack Tecnológico

*   **Frontend:** React (Vite), CSS/TailwindCSS, Lucide Icons.
*   **Backend:** FastAPI (Python), Uvicorn.
*   **Modelos de IA:** Google Gemini API (para extracción y estructuración de imágenes).
*   **Base de Datos:** PostgreSQL (acceso asíncrono con `asyncpg` y SQLAlchemy).

---

## Requisitos Previos

*   **Python** 3.10 o superior
*   **Node.js** v18 o superior
*   **PostgreSQL** instanciado y configurado

---

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/BautistaGenovese/Extractor-de-Cortes.git
cd "Extractor de Cortes"
```

### 2. Configurar el Backend
1. Dirígete a la carpeta del servidor:
   ```bash
   cd backend
   ```
2. Crea un entorno virtual y actívalo:
   ```bash
   python -m venv .venv
   # En Windows:
   .venv\Scripts\activate
   # En macOS/Linux:
   source .venv/bin/activate
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Configura las variables de entorno creando un archivo `.env` basado en el archivo de plantilla:
   ```bash
   cp .env.example .env
   ```
5. Edita `.env` con las credenciales de tu base de datos PostgreSQL y tu API Key de Google Gemini.
6. Inicia el servidor de desarrollo de FastAPI:
   ```bash
   uvicorn main:app --reload
   ```

### 3. Configurar el Frontend
1. Abre una nueva terminal en la raíz del proyecto y navega a la carpeta cliente:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Node:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```

La aplicación frontend estará disponible en `http://localhost:5173` (o el puerto consecutivo indicado en consola) y se comunicará automáticamente con el backend en `http://localhost:8000`.
