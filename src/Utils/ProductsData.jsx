import { apiClient, API_ENDPOINTS } from './ApiConfig';

/**
 * Productos de ejemplo (fallback si no hay conexión)
 */
export const productsDataLocal = [
    {
        idname: 1,
        name: 'Laptop HP',
        venta: 899.99,
        compra: 650.00,
        stk: 3,
        img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
    },
    {
        idname: 2,
        name: 'Mouse Inalámbrico',
        venta: 29.99,
        compra: 15.00,
        stk: 48,
        img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
    },
    {
        idname: 3,
        name: 'Teclado Mecánico',
        venta: 149.99,
        compra: 85.00,
        stk: 20,
        img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'
    },
    {
        idname: 4,
        name: 'Monitor 27"',
        venta: 349.99,
        compra: 220.00,
        stk: 8,
        img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500'
    },
    {
        idname: 5,
        name: 'Headphones Pro',
        venta: 199.99,
        compra: 100.00,
        stk: 15,
        img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    },
    {
        idname: 6,
        name: 'USB-C Hub',
        venta: 79.99,
        compra: 40.00,
        stk: 30,
        img: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500'
    }
];

/**
 * Funciones para interactuar con la API
 */
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
};

// Mantener exportación por compatibilidad
export const productsData = productsDataLocal;