import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingProduct = prevCart.find(item => item.idname === product.idname);

            if (existingProduct) {
                // Si el producto ya existe, incrementar cantidad
                return prevCart.map(item =>
                    item.idname === product.idname
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Si es nuevo, agregarlo con cantidad 1
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (idname) => {
        setCart(prevCart => prevCart.filter(item => item.idname !== idname));
    };

    const updateQuantity = (idname, quantity) => {
        if (quantity <= 0) {
            removeFromCart(idname);
        } else {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.idname === idname
                        ? { ...item, quantity }
                        : item
                )
            );
        }
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotal = () => {
        return cart.reduce((total, item) => total + (item.venta * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotal,
            getTotalItems
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de CartProvider');
    }
    return context;
}