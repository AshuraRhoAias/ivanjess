import React from "react";
import '@/Styles/Carrito.css';
import { useCart } from "@/Context/CartContext";
import { BtnNav } from "@/Utils/Header";
import Image from "next/image";

export default function Carrito({ route, setRoute }) {
    const { cart, updateQuantity, removeFromCart, clearCart, getTotal, getTotalItems } = useCart();

    if (cart.length === 0) {
        return (
            <div className="carrito-vacio">
                <h2>Carrito vacío</h2>
                <p>Agrega productos desde la sección de productos</p>
            </div>
        );
    }

    return (
        <div className="carrito-container">
            {cart.map(item => (
                <div key={item.idname} className="carrito-item">
                    <Image src={item.img} alt={item.name} />

                    <div className="item-info">
                        <h3>{item.name}</h3>
                        <p>${item.venta.toFixed(2)} c/u</p>
                        <p className="disponibles">{item.stk} disponibles</p>
                    </div>

                    <div className="item-controls">
                        <div className="quantity-controls">
                            <button
                                onClick={() => updateQuantity(item.idname, item.quantity - 1)}
                                className="btn-quantity"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.idname, parseInt(e.target.value) || 0)}
                                className="quantity-input"
                                min="1"
                                max={item.stk}
                            />
                            <button
                                onClick={() => updateQuantity(item.idname, item.quantity + 1)}
                                className="btn-quantity"
                                disabled={item.quantity >= item.stk}
                            >
                                +
                            </button>
                        </div>

                        <div className="item-total">
                            <h2>${(item.venta * item.quantity).toFixed(2)}</h2>
                        </div>

                        <button
                            onClick={() => removeFromCart(item.idname)}
                            className="btn-remove"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            ))}

            <div className="resumen-carrito">
                <h2>Resumen del Carrito</h2>

                <div className="resumen-detalles">
                    <div className="resumen-linea">
                        <span>Productos:</span>
                        <span>{getTotalItems()}</span>
                    </div>

                    <div className="resumen-linea">
                        <span>Subtotal:</span>
                        <span>${getTotal().toFixed(2)}</span>
                    </div>

                    <div className="resumen-total">
                        <span>Total:</span>
                        <span>${getTotal().toFixed(2)}</span>
                    </div>
                </div>

                <div className="carrito-actions">
                    <button onClick={clearCart} className="btn-vaciar">
                        Vaciar carrito
                    </button>
                </div>
            </div>
        </div>
    );
}