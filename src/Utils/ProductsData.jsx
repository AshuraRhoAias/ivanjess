import { supabase } from './supabaseClient';

export const productsDataLocal = [];

function assertNoError(error) {
    if (error) throw new Error(error.message);
}

function normalizeProductFields({ name, venta, compra, stk, img }) {
    return {
        name,
        venta: parseFloat(venta) || 0,
        compra: parseFloat(compra) || 0,
        stk: parseInt(stk, 10) || 0,
        img: img || '',
    };
}

export const productsAPI = {
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: true });

        assertNoError(error);
        return data;
    },

    async getById(idname) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('idname', idname)
            .single();

        assertNoError(error);
        return data;
    },

    async create(product) {
        const idname = product.idname || crypto.randomUUID();
        const { data, error } = await supabase
            .from('products')
            .insert({ ...normalizeProductFields(product), idname })
            .select()
            .single();

        assertNoError(error);
        return data;
    },

    async update(idname, product) {
        const { data, error } = await supabase
            .from('products')
            .update(normalizeProductFields(product))
            .eq('idname', idname)
            .select()
            .single();

        assertNoError(error);
        return data;
    },

    async delete(idname) {
        const { error } = await supabase.from('products').delete().eq('idname', idname);
        assertNoError(error);
        return { success: true };
    },

    // Sube una imagen (data URL en base64) al bucket público 'product-images'
    // y devuelve su URL pública lista para usar en <img src>.
    async uploadImage(base64Image) {
        const [, mimeMatch, base64Data] = base64Image.match(/^data:(.+);base64,(.*)$/) || [];
        if (!base64Data) throw new Error('Formato de imagen no válido');

        const extension = (mimeMatch || 'image/jpeg').split('/')[1] || 'jpg';
        const path = `${crypto.randomUUID()}.${extension}`;

        const binary = atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(path, bytes, { contentType: mimeMatch || 'image/jpeg' });

        assertNoError(uploadError);

        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        return { encryptedPath: data.publicUrl };
    },
};

export const productsData = productsDataLocal;
