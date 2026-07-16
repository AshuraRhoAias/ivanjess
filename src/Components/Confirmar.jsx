import React, { useState } from 'react';
import { useCart } from "@/Context/CartContext";
import '@/Styles/Confirmar.css';
import { apiClient, API_ENDPOINTS } from '@/Utils/ApiConfig';

function Confirmar() {
    const { cart, getTotal, getTotalItems, clearCart } = useCart();
    const [vendedor, setVendedor] = useState('');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [notas, setNotas] = useState('');

    const handleConfirmar = async () => {
        if (!vendedor.trim()) {
            alert('Por favor ingresa el nombre del vendedor');
            return;
        }

        const venta = {
            productos: cart,
            vendedor,
            metodoPago,
            notas,
            total: getTotal(),
            fecha: new Date().toISOString()
        };

        try {
            await apiClient.post(API_ENDPOINTS.SALES, venta);

            alert('¡Venta confirmada exitosamente!');
            clearCart();
            setVendedor('');
            setNotas('');
        } catch (error) {
            alert('Error al confirmar venta: ' + error.message);
        }
    };

    const handleCancelar = () => {
        if (confirm('¿Estás seguro de cancelar esta venta?')) {
            clearCart();
            setVendedor('');
            setNotas('');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="confirmar-vacio">
                <h2>No hay productos para confirmar</h2>
                <p>Agrega productos al carrito para poder confirmar una venta</p>
            </div>
        );
    }

    return (
        <div className="confirmar-container">
            <div className="resumen-venta">
                <h2>Resumen de Venta</h2>
                <p className="subtitle">Revisa los detalles antes de confirmar</p>

                <div className="productos-list">
                    {cart.map(item => (
                        <div key={item.idname} className="producto-item">
                            <div className="producto-info">
                                <h3>{item.name}</h3>
                                <p>{item.quantity} × ${item.venta.toFixed(2)}</p>
                            </div>
                            <div className="producto-total">
                                <h3>${(item.venta * item.quantity).toFixed(2)}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="totales-section">
                    <div className="total-linea">
                        <span>Productos:</span>
                        <span>{getTotalItems()}</span>
                    </div>
                    <div className="total-linea total-final">
                        <span>Total:</span>
                        <span>${getTotal().toFixed(2)}</span>
                    </div>
                </div>

                <p className="fecha-venta">{new Date().toLocaleString('es-MX')}</p>
            </div>

            <div className="detalles-pago">
                <h2>Detalles de Pago</h2>

                <div className="form-group">
                    <label>Nombre del Vendedor</label>
                    <input
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        value={vendedor}
                        onChange={(e) => setVendedor(e.target.value)}
                        className="input-vendedor"
                    />
                </div>

                <div className="form-group">
                    <label>Método de Pago</label>
                    <div className="metodos-pago">
                        <label className={`metodo-opcion ${metodoPago === 'efectivo' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="metodoPago"
                                value="efectivo"
                                checked={metodoPago === 'efectivo'}
                                onChange={(e) => setMetodoPago(e.target.value)}
                            />
                            <span>💵 Efectivo</span>
                        </label>

                        <label className={`metodo-opcion ${metodoPago === 'tarjeta' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="metodoPago"
                                value="tarjeta"
                                checked={metodoPago === 'tarjeta'}
                                onChange={(e) => setMetodoPago(e.target.value)}
                            />
                            <span>💳 Tarjeta</span>
                        </label>

                        <label className={`metodo-opcion ${metodoPago === 'transferencia' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="metodoPago"
                                value="transferencia"
                                checked={metodoPago === 'transferencia'}
                                onChange={(e) => setMetodoPago(e.target.value)}
                            />
                            <span>🏦 Transferencia</span>
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label>Notas (Opcional)</label>
                    <textarea
                        placeholder="Cliente VIP, descuento especial, etc."
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        className="input-notas"
                        rows="4"
                    />
                </div>

                <div className="botones-accion">
                    <button onClick={handleCancelar} className="btn-cancelar">
                        Cancelar
                    </button>
                    <button onClick={handleConfirmar} className="btn-confirmar-venta">
                        Confirmar Venta
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Confirmar;