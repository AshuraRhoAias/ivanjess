
import React, { useState, useEffect } from "react";
import '@/Styles/Card.css';
import { useCart } from "@/Context/CartContext";
import { productsAPI, productsDataLocal } from "@/Utils/ProductsData";
import { Cards } from "@/Utils/Cards";

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const data = await productsAPI.getAll();
            setProductos(data);
        } catch (error) {
            console.error('Error cargando productos:', error);
            setProductos(productsDataLocal); // Fallback
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = productos.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando productos...</div>;
    }

    return (
        <div className="Home">
            <input
                className="search"
                placeholder="🔍 Buscar por nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="cards">
                {filteredProducts.map(product => (
                    <Cards
                        key={product.idname}
                        product={product}
                        onAddToCart={addToCart}
                    />
                ))}
            </div>
        </div>
    );
}