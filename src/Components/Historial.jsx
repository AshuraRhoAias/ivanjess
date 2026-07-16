'use client'
import React, { useState, useEffect } from 'react';
import '@/Styles/Historial.css';
import { supabase } from '@/Utils/supabaseClient';

function Historial() {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vendedoresUnicos, setVendedoresUnicos] = useState([]);
    const [filtros, setFiltros] = useState({
        metodoPago: 'Todos',
        vendedor: 'Todos',
        fechaInicio: '',
        fechaFin: ''
    });

    useEffect(() => {
        cargarVentas();
    }, []);

    const cargarVentas = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .order('fecha', { ascending: false });

            if (error) throw new Error(error.message);

            // Normaliza metodo_pago (columna) -> metodoPago (usado en toda la UI)
            const ventasFormateadas = data.map(venta => ({
                ...venta,
                metodoPago: venta.metodo_pago,
                productos: typeof venta.productos === 'string'
                    ? JSON.parse(venta.productos)
                    : venta.productos
            }));

            setVentas(ventasFormateadas);

            // Extraer vendedores únicos
            const vendedores = [...new Set(ventasFormateadas.map(v => v.vendedor))];
            setVendedoresUnicos(vendedores);

        } catch (error) {
            console.error('Error al cargar ventas:', error);
            alert('Error al cargar el historial de ventas');
        } finally {
            setLoading(false);
        }
    };

    // Cálculos de estadísticas con filtros
    const ventasFiltradas = ventas.filter(venta => {
        const cumpleMetodo = filtros.metodoPago === 'Todos' || venta.metodoPago === filtros.metodoPago;
        const cumpleVendedor = filtros.vendedor === 'Todos' || venta.vendedor === filtros.vendedor;

        let cumpleFecha = true;
        if (filtros.fechaInicio) {
            cumpleFecha = cumpleFecha && new Date(venta.fecha) >= new Date(filtros.fechaInicio);
        }
        if (filtros.fechaFin) {
            cumpleFecha = cumpleFecha && new Date(venta.fecha) <= new Date(filtros.fechaFin);
        }

        return cumpleMetodo && cumpleVendedor && cumpleFecha;
    });

    const totalVentas = ventasFiltradas.length;
    const ingresosTotales = ventasFiltradas.reduce((sum, venta) => sum + parseFloat(venta.total), 0);
    const ventaPromedio = totalVentas > 0 ? ingresosTotales / totalVentas : 0;

    // Datos para gráfica de métodos de pago
    const metodosPago = ventasFiltradas.reduce((acc, venta) => {
        acc[venta.metodoPago] = (acc[venta.metodoPago] || 0) + parseFloat(venta.total);
        return acc;
    }, {});

    // Datos para gráfica de ingresos por día
    const ingresosPorDia = ventasFiltradas.reduce((acc, venta) => {
        const fecha = new Date(venta.fecha).toLocaleDateString('es-MX');
        acc[fecha] = (acc[fecha] || 0) + parseFloat(venta.total);
        return acc;
    }, {});

    const exportarReporte = () => {
        const reporte = ventasFiltradas.map(venta => ({
            ID: venta.id,
            Fecha: new Date(venta.fecha).toLocaleString('es-MX'),
            Vendedor: venta.vendedor,
            'Método de Pago': venta.metodoPago,
            Total: `$${parseFloat(venta.total).toFixed(2)}`,
            Productos: venta.productos?.map(p =>
                `${p.nombre} x${p.cantidad} ($${p.precio})`
            ).join(', ') || ''
        }));

        // Convertir a CSV
        const headers = Object.keys(reporte[0] || {});
        const csv = [
            headers.join(','),
            ...reporte.map(row =>
                headers.map(header => {
                    const value = row[header] || '';
                    return `"${value}"`;
                }).join(',')
            )
        ].join('\n');

        // Descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historial-ventas-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const limpiarFiltros = () => {
        setFiltros({
            metodoPago: 'Todos',
            vendedor: 'Todos',
            fechaInicio: '',
            fechaFin: ''
        });
    };

    const getNombreMetodo = (metodo) => {
        const nombres = {
            'efectivo': '💵 Efectivo',
            'tarjeta': '💳 Tarjeta',
            'transferencia': '🏦 Transferencia',
            'cash': '💵 Efectivo',
            'card': '💳 Tarjeta',
            'transfer': '🏦 Transferencia'
        };
        return nombres[metodo] || metodo;
    };

    if (loading) {
        return (
            <div className="historial-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>Cargando historial...</h2>
                </div>
            </div>
        );
    }

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
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>

                    <div className="filtro-item">
                        <label>Vendedor</label>
                        <select
                            value={filtros.vendedor}
                            onChange={(e) => setFiltros({ ...filtros, vendedor: e.target.value })}
                        >
                            <option value="Todos">Todos</option>
                            {vendedoresUnicos.map(vendedor => (
                                <option key={vendedor} value={vendedor}>
                                    {vendedor}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-item">
                        <label>Fecha Inicio</label>
                        <input
                            type="date"
                            value={filtros.fechaInicio}
                            onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                        />
                    </div>

                    <div className="filtro-item">
                        <label>Fecha Fin</label>
                        <input
                            type="date"
                            value={filtros.fechaFin}
                            onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                        />
                    </div>
                </div>

                <div className="filtros-acciones">
                    <button onClick={limpiarFiltros} className="btn-limpiar-filtros">
                        🔄 Limpiar Filtros
                    </button>
                    <button onClick={cargarVentas} className="btn-recargar">
                        ↻ Recargar
                    </button>
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
                    <div className="stat-label">en ventas</div>
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
                        {Object.keys(ingresosPorDia).length > 0 ? (
                            <div className="bar-chart">
                                {Object.entries(ingresosPorDia).map(([fecha, monto]) => (
                                    <div key={fecha} className="bar-wrapper">
                                        <div
                                            className="bar"
                                            style={{
                                                height: `${(monto / Math.max(...Object.values(ingresosPorDia))) * 100}%`
                                            }}
                                        >
                                            <span className="bar-value">${monto.toFixed(0)}</span>
                                        </div>
                                        <span className="bar-label">{fecha}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', padding: '20px' }}>
                                No hay datos para mostrar
                            </p>
                        )}
                    </div>
                </div>

                <div className="grafica-card">
                    <h3>Métodos de Pago</h3>
                    <div className="chart-container">
                        {Object.keys(metodosPago).length > 0 ? (
                            <div className="metodos-lista">
                                {Object.entries(metodosPago).map(([metodo, total]) => (
                                    <div key={metodo} className="metodo-item">
                                        <span className="metodo-nombre">
                                            {getNombreMetodo(metodo)}
                                        </span>
                                        <span className="metodo-monto">
                                            ${total.toFixed(2)}
                                        </span>
                                        <div className="metodo-barra">
                                            <div
                                                className="metodo-barra-fill"
                                                style={{
                                                    width: `${(total / ingresosTotales) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', padding: '20px' }}>
                                No hay datos para mostrar
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Historial Detallado */}
            <div className="historial-detallado">
                <h3>Historial Detallado</h3>
                <p className="ventas-count">{totalVentas} ventas</p>

                {ventasFiltradas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>No hay ventas que coincidan con los filtros seleccionados</p>
                    </div>
                ) : (
                    <div className="ventas-lista">
                        {ventasFiltradas.map(venta => (
                            <div key={venta.id} className="venta-item">
                                <div className="venta-header">
                                    <div className="venta-info">
                                        <h4>#{venta.id}</h4>
                                        <span className="venta-badge">{venta.vendedor}</span>
                                        <span className={`metodo-badge ${venta.metodoPago}`}>
                                            {getNombreMetodo(venta.metodoPago)}
                                        </span>
                                    </div>
                                    <div className="venta-total">${parseFloat(venta.total).toFixed(2)}</div>
                                </div>

                                <div className="venta-fecha">
                                    {new Date(venta.fecha).toLocaleString('es-MX')}
                                </div>

                                <div className="venta-productos">
                                    <strong>Productos:</strong>
                                    <ul>
                                        {venta.productos?.map((prod, idx) => (
                                            <li key={idx}>
                                                {prod.nombre} × {prod.cantidad} - ${parseFloat(prod.precio).toFixed(2)}
                                                {' '}(Total: ${(parseFloat(prod.precio) * prod.cantidad).toFixed(2)})
                                            </li>
                                        )) || <li>Sin productos</li>}
                                    </ul>
                                </div>

                                {venta.notas && (
                                    <div className="venta-notas">
                                        <strong>Notas:</strong> {venta.notas}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Botón Exportar */}
            <div className="exportar-section">
                <button
                    onClick={exportarReporte}
                    className="btn-exportar"
                    disabled={ventasFiltradas.length === 0}
                >
                    <span>📥</span> Exportar Reporte CSV
                </button>
            </div>
        </div>
    );
}

export default Historial;