import React, { useState, useEffect } from 'react';
import '@/Styles/Historial.css';

function Historial() {
    // Inicializa con datos de ejemplo directamente
    const [ventas, setVentas] = useState([
        {
            id: 'SALE-1764627402098',
            fecha: '1/12/2025, 16:16:42',
            metodoPago: 'cash',
            vendedor: 'pepe',
            productos: [
                { nombre: 'Laptop HP x2', precio: 1799.88, cantidad: 1 },
                { nombre: 'Mouse Inalámbrico x1', precio: 29.99, cantidad: 1 }
            ],
            total: 1829.97
        }
    ]);

    const [filtros, setFiltros] = useState({
        metodoPago: 'Todos',
        vendedor: 'Todos'
    });

    // Si necesitas cargar datos desde una API, usa este useEffect
    useEffect(() => {
        // Función para cargar ventas
        const cargarVentas = async () => {
            try {
                // const response = await fetch('/api/ventas');
                // const data = await response.json();
                // setVentas(data);
            } catch (error) {
                console.error('Error al cargar ventas:', error);
            }
        };

        // Descomenta cuando tengas API real
        // cargarVentas();
    }, []);

    // Cálculos de estadísticas
    const ventasFiltradas = ventas.filter(venta => {
        const cumpleMetodo = filtros.metodoPago === 'Todos' || venta.metodoPago === filtros.metodoPago;
        const cumpleVendedor = filtros.vendedor === 'Todos' || venta.vendedor === filtros.vendedor;
        return cumpleMetodo && cumpleVendedor;
    });

    const totalVentas = ventasFiltradas.length;
    const ingresosTotales = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);
    const ventaPromedio = totalVentas > 0 ? ingresosTotales / totalVentas : 0;

    // Datos para gráfica de métodos de pago
    const metodosPago = ventasFiltradas.reduce((acc, venta) => {
        acc[venta.metodoPago] = (acc[venta.metodoPago] || 0) + venta.total;
        return acc;
    }, {});

    // Datos para gráfica de ingresos por día
    const ingresosPorDia = ventasFiltradas.reduce((acc, venta) => {
        const fecha = new Date(venta.fecha).toLocaleDateString();
        acc[fecha] = (acc[fecha] || 0) + venta.total;
        return acc;
    }, {});

    const exportarReporte = () => {
        // Función para exportar reporte
        console.log('Exportando reporte...');
    };

    return (
        <div className="historial-container">
            {/* Filtros */}
            <div className="filtros-section">
                <div className="filtros-header">
                    <span className="filtro-icon">🔽</span>
                    <h3>Filtros</h3>
                </div>

                <div className="filtros-grid">
                    <div className="filtro-item">
                        <label>Método de Pago</label>
                        <select
                            value={filtros.metodoPago}
                            onChange={(e) => setFiltros({ ...filtros, metodoPago: e.target.value })}
                        >
                            <option value="Todos">Todos</option>
                            <option value="cash">Efectivo</option>
                            <option value="card">Tarjeta</option>
                            <option value="transfer">Transferencia</option>
                        </select>
                    </div>

                    <div className="filtro-item">
                        <label>Vendedor</label>
                        <select
                            value={filtros.vendedor}
                            onChange={(e) => setFiltros({ ...filtros, vendedor: e.target.value })}
                        >
                            <option value="Todos">Todos</option>
                            <option value="pepe">Pepe</option>
                            <option value="juan">Juan</option>
                            <option value="maria">María</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h4>Total de Ventas</h4>
                    <div className="stat-value">{totalVentas}</div>
                    <div className="stat-label">transacciones</div>
                </div>

                <div className="stat-card">
                    <h4>Ingresos Totales</h4>
                    <div className="stat-value">${ingresosTotales.toFixed(2)}</div>
                    <div className="stat-label">en transacción</div>
                </div>

                <div className="stat-card">
                    <h4>Venta Promedio</h4>
                    <div className="stat-value">${ventaPromedio.toFixed(2)}</div>
                    <div className="stat-label">por transacción</div>
                </div>
            </div>

            {/* Gráficas */}
            <div className="graficas-grid">
                <div className="grafica-card">
                    <h3>Ingresos por Día</h3>
                    <div className="chart-container">
                        <div className="bar-chart">
                            {Object.entries(ingresosPorDia).map(([fecha, monto]) => (
                                <div key={fecha} className="bar-wrapper">
                                    <div
                                        className="bar"
                                        style={{ height: `${(monto / Math.max(...Object.values(ingresosPorDia))) * 100}%` }}
                                    ></div>
                                    <span className="bar-label">{fecha}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grafica-card">
                    <h3>Métodos de Pago</h3>
                    <div className="chart-container">
                        <div className="pie-chart">
                            <svg viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r="80" fill="#8B7FD9" />
                            </svg>
                            <div className="pie-label">
                                Efectivo: ${metodosPago.cash?.toFixed(2) || '0.00'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historial Detallado */}
            <div className="historial-detallado">
                <h3>Historial Detallado</h3>
                <p className="ventas-count">{totalVentas} ventas</p>

                <div className="ventas-lista">
                    {ventasFiltradas.map(venta => (
                        <div key={venta.id} className="venta-item">
                            <div className="venta-header">
                                <div className="venta-info">
                                    <h4>{venta.id}</h4>
                                    <span className="venta-badge">{venta.vendedor}</span>
                                    <span className={`metodo-badge ${venta.metodoPago}`}>
                                        {venta.metodoPago === 'cash' ? '💵 cash' : venta.metodoPago}
                                    </span>
                                </div>
                                <div className="venta-total">${venta.total.toFixed(2)}</div>
                            </div>

                            <div className="venta-fecha">{venta.fecha}</div>

                            <div className="venta-productos">
                                <strong>Productos:</strong>
                                <ul>
                                    {venta.productos.map((prod, idx) => (
                                        <li key={idx}>
                                            {prod.nombre} - ${prod.precio.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botón Exportar */}
            <div className="exportar-section">
                <button onClick={exportarReporte} className="btn-exportar">
                    <span>📥</span> Exportar Reporte
                </button>
            </div>
        </div>
    );
}

export default Historial;