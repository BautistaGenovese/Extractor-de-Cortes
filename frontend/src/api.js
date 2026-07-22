import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Servicio para interactuar con la API
export const apiService = {
    // 1. Obtener perfil del usuario (créditos)
    getUsuario: async (idUsuario) => {
        const res = await api.get(`/usuarios/${idUsuario}`);
        return res.data;
    },

    // 2. Analizar fotos de cortes (Paso 1: Solo lectura, NO descuenta crédito)
    analizarFotos: async (idUsuario, archivosFotos) => {
        const formData = new FormData();
        formData.append('id_usuario', idUsuario);

        // Adjuntamos cada foto al FormData
        archivosFotos.forEach((file) => {
            formData.append('fotos', file);
        });

        const res = await api.post('/trabajos/analizar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data; // Devuelve { cortes: [...] }
    },

    // 3. Guardar el trabajo confirmado (Paso 2: Persiste en DB y resta 1 crédito)
    guardarTrabajo: async (idUsuario, nombreTrabajo, cortes) => {
        const payload = {
            id_usuario: idUsuario,
            nombre_trabajo: nombreTrabajo,
            cortes: cortes,
        };
        const res = await api.post('/trabajos/guardar', payload);
        return res.data;
    },

    // 4. Listar historial de trabajos del usuario
    getTrabajosUsuario: async (idUsuario) => {
        const res = await api.get(`/usuarios/${idUsuario}/trabajos`);
        return res.data;
    },

    // 5. Descargar archivo .txt
    getExportarTxtUrl: (idTrabajo) => {
        return `${API_BASE_URL}/trabajos/${idTrabajo}/exportar-txt`;
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

};
