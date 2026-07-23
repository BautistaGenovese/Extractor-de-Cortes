import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

let interceptorId = null;

// Función para inyectar el getter del token desde React
export const setAuthTokenGetter = (getToken) => {
    if (interceptorId !== null) {
        api.interceptors.request.eject(interceptorId);
    }
    interceptorId = api.interceptors.request.use(async (config) => {
        try {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error("Error obteniendo token:", e);
        }
        return config;
    });
};

// Servicio para interactuar con la API
export const apiService = {
    // 0. Sincronizar datos de Clerk a la DB
    syncUsuario: async (datos) => {
        const res = await api.post(`/usuarios/sync`, datos);
        return res.data;
    },

    // 1. Obtener perfil del usuario (créditos)
    getUsuario: async () => {
        const res = await api.get(`/usuarios/me`);
        return res.data;
    },

    // 2. Analizar fotos de cortes (Paso 1: Solo lectura, NO descuenta crédito)
    analizarFotos: async (archivosFotos) => {
        const formData = new FormData();

        // Adjuntamos cada foto al FormData
        archivosFotos.forEach((file) => {
            formData.append('fotos', file);
        });

        const res = await api.post('/trabajos/analizar', formData);
        return res.data; // Devuelve { cortes: [...] }
    },

    // 3. Guardar el trabajo confirmado (Paso 2: Persiste en DB y resta 1 crédito)
    guardarTrabajo: async (nombreTrabajo, cortes) => {
        const payload = {
            nombre_trabajo: nombreTrabajo,
            cortes: cortes,
        };
        const res = await api.post('/trabajos/guardar', payload);
        return res.data;
    },

    // 4. Listar historial de trabajos del usuario
    getTrabajosUsuario: async () => {
        const res = await api.get(`/usuarios/me/trabajos`);
        return res.data;
    },

    // 5. Descargar archivo .txt
    getExportarTxtUrl: (idTrabajo) => {
        return `${API_BASE_URL}/trabajos/${idTrabajo}/exportar-txt`;
    },

    getExportarExcelUrl: (idTrabajo) => {
        return `${API_BASE_URL}/trabajos/${idTrabajo}/exportar-excel`;
    },

    // 6. Actualizar trabajo existente (PUT)
    actualizarTrabajo: async (idTrabajo, nombreTrabajo, cortes) => {
        const payload = {
            nombre: nombreTrabajo,
            cortes: cortes,
        };
        const res = await api.put(`/trabajos/${idTrabajo}`, payload);
        return res.data;
    },

    // 7. Eliminar trabajo (DELETE)
    eliminarTrabajo: async (idTrabajo) => {
        const res = await api.delete(`/trabajos/${idTrabajo}`);
        return res.data;
    },

    // 8. Chequear estado del motor/servidor
    checkStatus: async () => {
        const res = await api.get('/status');
        return res.data;
    },
};
