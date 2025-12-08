/**
 * Configuración centralizada de la API
 * Cambiar API_BASE_URL según tu servidor
 */

export const API_BASE_URL = 'http://localhost:4000';

export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CHECK_AUTH: '/api/auth/me',

    // Productos
    PRODUCTS: '/api/products',
    PRODUCT_BY_ID: (id) => `/api/products/${id}`,
    UPLOAD_IMAGE: '/api/products/upload-image',
    GET_IMAGE: (encryptedPath) => `/api/products/image/${encryptedPath}`,

    // Ventas
    SALES: '/api/sales',
    SALES_HISTORY: '/api/sales/history',

    // Finanzas
    FINANCES: '/api/finances',
    FINANCES_REPORT: '/api/finances/report',
};

/**
 * Cliente HTTP con cookies automáticas
 */
export const apiClient = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // ✅ Envía cookies automáticamente
            ...options,
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));

                // Si es 401, disparar evento de sesión expirada
                if (response.status === 401) {
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                }

                throw new Error(error.message || 'Error en la petición');
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error en petición:', error);
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    },

    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },
};