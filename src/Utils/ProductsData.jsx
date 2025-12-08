import { apiClient, API_ENDPOINTS } from './ApiConfig';

export const productsDataLocal = [
    // ... datos locales
];

export const productsAPI = {
    async getAll() {
        try {
            return await apiClient.get(API_ENDPOINTS.PRODUCTS);
        } catch (error) {
            console.warn('⚠️ Usando productos locales por error en API');
            return productsDataLocal;
        }
    },

    async getById(id) {
        return await apiClient.get(API_ENDPOINTS.PRODUCT_BY_ID(id));
    },

    async create(product) {
        return await apiClient.post(API_ENDPOINTS.PRODUCTS, product);
    },

    async update(id, product) {
        return await apiClient.put(API_ENDPOINTS.PRODUCT_BY_ID(id), product);
    },

    async delete(id) {
        return await apiClient.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
    },

    // ✅ NUEVO: Subir imagen
    async uploadImage(base64Image) {
        return await apiClient.post(API_ENDPOINTS.UPLOAD_IMAGE, { image: base64Image });
    }
};

export const productsData = productsDataLocal;