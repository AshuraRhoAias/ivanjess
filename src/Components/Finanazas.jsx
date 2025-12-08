import React, { useState, useRef } from 'react';
import '@/Styles/finanzas.css';

function Finanzas() {
    // Función helper para inicializar ventas e ingresos
    const inicializarVentasEIngresos = () => {
        const ventasGuardadas = localStorage.getItem('ventasDelDia');
        if (ventasGuardadas) {
            const ventas = JSON.parse(ventasGuardadas);

            // Calcular ingresos por método de pago
            const totales = {
                efectivo: 0,
                transferencia: 0,
                tarjeta: 0,
                otros: 0
            };

            ventas.forEach(venta => {
                const metodoPago = venta.metodoPago?.toLowerCase() || 'otros';
                const total = parseFloat(venta.total) || 0;

                if (totales.hasOwnProperty(metodoPago)) {
                    totales[metodoPago] += total;
                } else {
                    totales.otros += total;
                }
            });

            return { ventas, ingresos: totales };
        }

        return {
            ventas: [],
            ingresos: { efectivo: 0, transferencia: 0, tarjeta: 0, otros: 0 }
        };
    };

    // Función helper para inicializar historial
    const inicializarHistorial = () => {
        const historial = localStorage.getItem('historialFinanzas');
        return historial ? JSON.parse(historial) : [];
    };

    // Inicializar estados con datos de localStorage
    const datosIniciales = inicializarVentasEIngresos();

    // Estados para ingresos - inicializados con datos de localStorage
    const [ingresos, setIngresos] = useState(datosIniciales.ingresos);

    // Estados para gastos
    const [gastos, setGastos] = useState([]);
    const [nuevoGasto, setNuevoGasto] = useState({
        producto: '',
        precio: '',
        foto: null
    });

    // Estados para caja
    const [inicioCaja, setInicioCaja] = useState(0);
    const [cierreCaja, setCierreCaja] = useState(0);

    // Estados para ventas del día - inicializados con datos de localStorage
    const [ventasDelDia, setVentasDelDia] = useState(datosIniciales.ventas);

    // Estados para historial - inicializados con datos de localStorage
    const [historialDias, setHistorialDias] = useState(inicializarHistorial);

    // Estados para reportes mensuales
    const [mostrarReportes, setMostrarReportes] = useState(false);
    const [mesSeleccionado, setMesSeleccionado] = useState('');
    const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
    const [reporteMensual, setReporteMensual] = useState(null);

    // Referencias
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Función para calcular ingresos por método de pago (para usar en otros lugares)
    const calcularIngresosPorMetodo = (ventas) => {
        const totales = {
            efectivo: 0,
            transferencia: 0,
            tarjeta: 0,
            otros: 0
        };

        ventas.forEach(venta => {
            const metodoPago = venta.metodoPago?.toLowerCase() || 'otros';
            const total = parseFloat(venta.total) || 0;

            if (totales.hasOwnProperty(metodoPago)) {
                totales[metodoPago] += total;
            } else {
                totales.otros += total;
            }
        });

        setIngresos(totales);
    };

    // Función para recargar ventas del día (para usar en botones)
    const cargarDatosDelDia = () => {
        const ventasGuardadas = localStorage.getItem('ventasDelDia');
        if (ventasGuardadas) {
            const ventas = JSON.parse(ventasGuardadas);
            setVentasDelDia(ventas);
            calcularIngresosPorMetodo(ventas);
        }
    };

    // Función para recargar historial (para usar en botones)
    const cargarHistorial = () => {
        const historial = localStorage.getItem('historialFinanzas');
        if (historial) {
            setHistorialDias(JSON.parse(historial));
        }
    };

    // Guardar día completo
    const guardarDiaCompleto = () => {
        const diaCompleto = {
            fecha: new Date().toISOString(),
            fechaLegible: new Date().toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            ingresos: { ...ingresos },
            gastos: [...gastos],
            ventas: [...ventasDelDia],
            inicioCaja,
            cierreCaja,
            totales: {
                ingresos: getTotalIngresos(),
                gastos: getTotalGastos(),
                precioBase: getTotalPrecioBase(),
                ganancia: getTotalGanancia(),
                cajaFinal: getCajaFinal()
            }
        };

        const historial = [...historialDias, diaCompleto];
        setHistorialDias(historial);
        localStorage.setItem('historialFinanzas', JSON.stringify(historial));

        // Limpiar datos del día
        limpiarDia();
        alert('Día guardado correctamente');
    };

    const limpiarDia = () => {
        setIngresos({ efectivo: 0, transferencia: 0, tarjeta: 0, otros: 0 });
        setGastos([]);
        setVentasDelDia([]);
        setInicioCaja(0);
        setCierreCaja(0);
        localStorage.removeItem('ventasDelDia');
    };

    // Manejo de ingresos
    const handleIngresoChange = (tipo, valor) => {
        setIngresos({
            ...ingresos,
            [tipo]: parseFloat(valor) || 0
        });
    };

    const getTotalIngresos = () => {
        return Object.values(ingresos).reduce((sum, val) => sum + val, 0);
    };

    // Manejo de gastos
    const handleGastoChange = (campo, valor) => {
        setNuevoGasto({
            ...nuevoGasto,
            [campo]: valor
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNuevoGasto({
                    ...nuevoGasto,
                    foto: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const agregarGasto = () => {
        if (nuevoGasto.producto && nuevoGasto.precio) {
            setGastos([
                ...gastos,
                {
                    ...nuevoGasto,
                    id: Date.now(),
                    fecha: new Date().toLocaleString()
                }
            ]);
            setNuevoGasto({
                producto: '',
                precio: '',
                foto: null
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
    };

    const eliminarGasto = (id) => {
        setGastos(gastos.filter(gasto => gasto.id !== id));
    };

    const getTotalGastos = () => {
        return gastos.reduce((sum, gasto) => sum + (parseFloat(gasto.precio) || 0), 0);
    };

    // Cálculos de ventas
    const getTotalPrecioBase = () => {
        return ventasDelDia.reduce((sum, venta) => {
            const precioBase = venta.productos?.reduce((total, prod) => {
                return total + ((parseFloat(prod.precioBase) || 0) * (prod.cantidad || 0));
            }, 0) || 0;
            return sum + precioBase;
        }, 0);
    };

    const getTotalGanancia = () => {
        return getTotalIngresos() - getTotalPrecioBase();
    };

    // Cálculo de caja final
    const getCajaFinal = () => {
        return inicioCaja + getTotalIngresos() - getTotalGastos() - cierreCaja;
    };

    // Generar reporte mensual
    const generarReporteMensual = () => {
        if (!mesSeleccionado) {
            alert('Por favor selecciona un mes');
            return;
        }

        const mesNumero = parseInt(mesSeleccionado);
        const diasDelMes = historialDias.filter(dia => {
            const fecha = new Date(dia.fecha);
            return fecha.getMonth() === mesNumero && fecha.getFullYear() === añoSeleccionado;
        });

        if (diasDelMes.length === 0) {
            alert('No hay datos para el mes seleccionado');
            return;
        }

        const reporte = {
            mes: new Date(añoSeleccionado, mesNumero).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
            totalDias: diasDelMes.length,
            ingresos: {
                efectivo: diasDelMes.reduce((sum, dia) => sum + dia.ingresos.efectivo, 0),
                transferencia: diasDelMes.reduce((sum, dia) => sum + dia.ingresos.transferencia, 0),
                tarjeta: diasDelMes.reduce((sum, dia) => sum + dia.ingresos.tarjeta, 0),
                otros: diasDelMes.reduce((sum, dia) => sum + dia.ingresos.otros, 0),
                total: diasDelMes.reduce((sum, dia) => sum + dia.totales.ingresos, 0)
            },
            gastos: {
                total: diasDelMes.reduce((sum, dia) => sum + dia.totales.gastos, 0),
                detalles: diasDelMes.flatMap(dia => dia.gastos)
            },
            ventas: {
                total: diasDelMes.reduce((sum, dia) => sum + dia.ventas.length, 0),
                productos: diasDelMes.flatMap(dia => dia.ventas)
            },
            precioBase: diasDelMes.reduce((sum, dia) => sum + dia.totales.precioBase, 0),
            ganancia: diasDelMes.reduce((sum, dia) => sum + dia.totales.ganancia, 0),
            promedioIngresoDiario: diasDelMes.reduce((sum, dia) => sum + dia.totales.ingresos, 0) / diasDelMes.length,
            promedioGananciaDiaria: diasDelMes.reduce((sum, dia) => sum + dia.totales.ganancia, 0) / diasDelMes.length
        };

        setReporteMensual(reporte);
    };

    const exportarReporte = () => {
        if (!reporteMensual) return;

        const texto = `
REPORTE MENSUAL - ${reporteMensual.mes.toUpperCase()}
======================================================

RESUMEN GENERAL
--------------
Días trabajados: ${reporteMensual.totalDias}
Total ventas: ${reporteMensual.ventas.total}

INGRESOS
--------
Efectivo: $${reporteMensual.ingresos.efectivo.toFixed(2)}
Transferencia: $${reporteMensual.ingresos.transferencia.toFixed(2)}
Tarjeta: $${reporteMensual.ingresos.tarjeta.toFixed(2)}
Otros: $${reporteMensual.ingresos.otros.toFixed(2)}
TOTAL INGRESOS: $${reporteMensual.ingresos.total.toFixed(2)}

COSTOS Y GANANCIAS
------------------
Precio Base Total: $${reporteMensual.precioBase.toFixed(2)}
Gastos del Mes: $${reporteMensual.gastos.total.toFixed(2)}
GANANCIA TOTAL: $${reporteMensual.ganancia.toFixed(2)}

PROMEDIOS DIARIOS
-----------------
Ingreso promedio: $${reporteMensual.promedioIngresoDiario.toFixed(2)}
Ganancia promedio: $${reporteMensual.promedioGananciaDiaria.toFixed(2)}

Generado el: ${new Date().toLocaleString()}
    `;

        const blob = new Blob([texto], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_${reporteMensual.mes.replace(' ', '_')}.txt`;
        a.click();
    };

    const meses = [
        { valor: '0', nombre: 'Enero' },
        { valor: '1', nombre: 'Febrero' },
        { valor: '2', nombre: 'Marzo' },
        { valor: '3', nombre: 'Abril' },
        { valor: '4', nombre: 'Mayo' },
        { valor: '5', nombre: 'Junio' },
        { valor: '6', nombre: 'Julio' },
        { valor: '7', nombre: 'Agosto' },
        { valor: '8', nombre: 'Septiembre' },
        { valor: '9', nombre: 'Octubre' },
        { valor: '10', nombre: 'Noviembre' },
        { valor: '11', nombre: 'Diciembre' }
    ];

    return (
        <div className="finanzas-container">
            <h1>Control de Finanzas del Día</h1>

            {/* Botones de acción principal */}
            <div className="acciones-principales">
                <button className="btn-guardar-dia" onClick={guardarDiaCompleto}>
                    💾 Guardar Día Completo
                </button>
                <button
                    className="btn-reportes"
                    onClick={() => setMostrarReportes(!mostrarReportes)}
                >
                    📊 {mostrarReportes ? 'Ocultar' : 'Ver'} Reportes Mensuales
                </button>
            </div>

            {/* Sección de Reportes Mensuales */}
            {mostrarReportes && (
                <section className="reportes-section">
                    <h2>📈 Reportes Mensuales</h2>

                    <div className="selector-mes">
                        <div className="input-group">
                            <label>Año:</label>
                            <input
                                type="number"
                                value={añoSeleccionado}
                                onChange={(e) => setAñoSeleccionado(parseInt(e.target.value))}
                                min="2020"
                                max="2100"
                            />
                        </div>
                        <div className="input-group">
                            <label>Mes:</label>
                            <select
                                value={mesSeleccionado}
                                onChange={(e) => setMesSeleccionado(e.target.value)}
                            >
                                <option value="">Seleccionar mes</option>
                                {meses.map(mes => (
                                    <option key={mes.valor} value={mes.valor}>{mes.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn-generar" onClick={generarReporteMensual}>
                            Generar Reporte
                        </button>
                    </div>

                    {reporteMensual && (
                        <div className="reporte-mensual">
                            <div className="reporte-header">
                                <h3>Reporte de {reporteMensual.mes}</h3>
                                <button className="btn-exportar" onClick={exportarReporte}>
                                    📄 Exportar Reporte
                                </button>
                            </div>

                            <div className="reporte-grid">
                                <div className="reporte-card">
                                    <h4>📅 Resumen General</h4>
                                    <p>Días trabajados: <strong>{reporteMensual.totalDias}</strong></p>
                                    <p>Total de ventas: <strong>{reporteMensual.ventas.total}</strong></p>
                                </div>

                                <div className="reporte-card">
                                    <h4>💰 Ingresos por Método</h4>
                                    <p>Efectivo: <strong>${reporteMensual.ingresos.efectivo.toFixed(2)}</strong></p>
                                    <p>Transferencia: <strong>${reporteMensual.ingresos.transferencia.toFixed(2)}</strong></p>
                                    <p>Tarjeta: <strong>${reporteMensual.ingresos.tarjeta.toFixed(2)}</strong></p>
                                    <p>Otros: <strong>${reporteMensual.ingresos.otros.toFixed(2)}</strong></p>
                                    <p className="total-line">TOTAL: <strong>${reporteMensual.ingresos.total.toFixed(2)}</strong></p>
                                </div>

                                <div className="reporte-card">
                                    <h4>📊 Costos y Ganancias</h4>
                                    <p>Precio Base: <strong>${reporteMensual.precioBase.toFixed(2)}</strong></p>
                                    <p>Gastos: <strong className="negativo">-${reporteMensual.gastos.total.toFixed(2)}</strong></p>
                                    <p className="total-line ganancia">GANANCIA: <strong>${reporteMensual.ganancia.toFixed(2)}</strong></p>
                                </div>

                                <div className="reporte-card">
                                    <h4>📈 Promedios Diarios</h4>
                                    <p>Ingreso promedio: <strong>${reporteMensual.promedioIngresoDiario.toFixed(2)}</strong></p>
                                    <p>Ganancia promedio: <strong>${reporteMensual.promedioGananciaDiaria.toFixed(2)}</strong></p>
                                </div>
                            </div>

                            <div className="productos-mas-vendidos">
                                <h4>🏆 Productos Vendidos en el Mes</h4>
                                <div className="tabla-productos">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Usuario</th>
                                                <th>Método</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reporteMensual.ventas.productos.map((venta, idx) => (
                                                venta.productos?.map((prod, pIdx) => (
                                                    <tr key={`${idx}-${pIdx}`}>
                                                        <td>{prod.nombre}</td>
                                                        <td>{prod.cantidad}</td>
                                                        <td>{venta.usuario || 'N/A'}</td>
                                                        <td>{venta.metodoPago || 'N/A'}</td>
                                                        <td>${(prod.precio * prod.cantidad).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Sección de Caja Inicial */}
            <section className="caja-section">
                <h2>💰 Control de Caja</h2>
                <div className="caja-inputs">
                    <div className="input-group">
                        <label>Inicio de Caja:</label>
                        <input
                            type="number"
                            value={inicioCaja}
                            onChange={(e) => setInicioCaja(parseFloat(e.target.value) || 0)}
                            placeholder="$0.00"
                        />
                    </div>
                    <div className="input-group">
                        <label>Dinero que se retira:</label>
                        <input
                            type="number"
                            value={cierreCaja}
                            onChange={(e) => setCierreCaja(parseFloat(e.target.value) || 0)}
                            placeholder="$0.00"
                        />
                    </div>
                </div>
            </section>

            {/* Sección de Ventas del Día */}
            <section className="ventas-section">
                <h2>🛒 Ventas del Día</h2>

                {ventasDelDia.length === 0 ? (
                    <p className="no-datos">No hay ventas registradas hoy</p>
                ) : (
                    <div className="tabla-ventas-container">
                        <table className="tabla-ventas">
                            <thead>
                                <tr>
                                    <th>Hora</th>
                                    <th>Usuario</th>
                                    <th>Productos</th>
                                    <th>Método de Pago</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventasDelDia.map((venta, index) => (
                                    <tr key={index}>
                                        <td>{new Date(venta.fecha).toLocaleTimeString()}</td>
                                        <td>{venta.usuario || 'N/A'}</td>
                                        <td>
                                            <div className="productos-lista">
                                                {venta.productos?.map((prod, idx) => (
                                                    <div key={idx} className="producto-item">
                                                        <span className="producto-nombre">{prod.nombre}</span>
                                                        <span className="producto-cantidad">x{prod.cantidad}</span>
                                                        <span className="producto-precio">${(prod.precio * prod.cantidad).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`metodo-badge ${venta.metodoPago?.toLowerCase()}`}>
                                                {venta.metodoPago || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="venta-total">${parseFloat(venta.total).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Sección de Ingresos */}
            <section className="ingresos-section">
                <h2>📈 Ingresos del Día</h2>
                <div className="ingresos-grid">
                    <div className="ingreso-item">
                        <label>💵 Efectivo:</label>
                        <input
                            type="number"
                            value={ingresos.efectivo}
                            onChange={(e) => handleIngresoChange('efectivo', e.target.value)}
                            placeholder="$0.00"
                        />
                    </div>
                    <div className="ingreso-item">
                        <label>🏦 Transferencia:</label>
                        <input
                            type="number"
                            value={ingresos.transferencia}
                            onChange={(e) => handleIngresoChange('transferencia', e.target.value)}
                            placeholder="$0.00"
                        />
                    </div>
                    <div className="ingreso-item">
                        <label>💳 Tarjeta:</label>
                        <input
                            type="number"
                            value={ingresos.tarjeta}
                            onChange={(e) => handleIngresoChange('tarjeta', e.target.value)}
                            placeholder="$0.00"
                        />
                    </div>
                    <div className="ingreso-item">
                        <label>📱 Otros:</label>
                        <input
                            type="number"
                            value={ingresos.otros}
                            onChange={(e) => handleIngresoChange('otros', e.target.value)}
                            placeholder="$0.00"
                        />
                    </div>
                </div>
                <div className="total-ingresos">
                    <strong>Total Ingresos: ${getTotalIngresos().toFixed(2)}</strong>
                </div>
            </section>

            {/* Sección de Gastos */}
            <section className="gastos-section">
                <h2>📉 Gastos del Día</h2>

                <div className="nuevo-gasto">
                    <h3>Agregar Nuevo Gasto</h3>
                    <div className="gasto-form">
                        <input
                            type="text"
                            placeholder="Producto/Concepto"
                            value={nuevoGasto.producto}
                            onChange={(e) => handleGastoChange('producto', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Precio"
                            value={nuevoGasto.precio}
                            onChange={(e) => handleGastoChange('precio', e.target.value)}
                        />

                        <div className="foto-opciones">
                            <label className="btn-foto">
                                📁 Subir Foto
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            <label className="btn-foto">
                                📷 Tomar Foto
                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {nuevoGasto.foto && (
                            <div className="preview-foto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={nuevoGasto.foto} alt="Preview" />
                                <button
                                    className="btn-eliminar-foto"
                                    onClick={() => setNuevoGasto({ ...nuevoGasto, foto: null })}
                                >
                                    ❌
                                </button>
                            </div>
                        )}

                        <button className="btn-agregar" onClick={agregarGasto}>
                            ➕ Agregar Gasto
                        </button>
                    </div>
                </div>

                <div className="lista-gastos">
                    <h3>Lista de Gastos</h3>
                    {gastos.length === 0 ? (
                        <p className="no-gastos">No hay gastos registrados</p>
                    ) : (
                        <div className="gastos-grid">
                            {gastos.map((gasto) => (
                                <div key={gasto.id} className="gasto-card">
                                    {gasto.foto && (
                                        <div className="gasto-foto">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={gasto.foto} alt={gasto.producto} />
                                        </div>
                                    )}
                                    <div className="gasto-info">
                                        <h4>{gasto.producto}</h4>
                                        <p className="gasto-precio">${parseFloat(gasto.precio).toFixed(2)}</p>
                                        <p className="gasto-fecha">{gasto.fecha}</p>
                                    </div>
                                    <button
                                        className="btn-eliminar"
                                        onClick={() => eliminarGasto(gasto.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="total-gastos">
                        <strong>Total Gastos: ${getTotalGastos().toFixed(2)}</strong>
                    </div>
                </div>
            </section>

            {/* Resumen Final */}
            <section className="resumen-section">
                <h2>📊 Resumen del Día</h2>
                <div className="resumen-grid">
                    <div className="resumen-item">
                        <span>Inicio de Caja:</span>
                        <strong>${inicioCaja.toFixed(2)}</strong>
                    </div>
                    <div className="resumen-item positivo">
                        <span>Total Ingresos:</span>
                        <strong>+${getTotalIngresos().toFixed(2)}</strong>
                    </div>
                    <div className="resumen-item info">
                        <span>Precio Base (Costo):</span>
                        <strong>${getTotalPrecioBase().toFixed(2)}</strong>
                    </div>
                    <div className="resumen-item negativo">
                        <span>Total Gastos:</span>
                        <strong>-${getTotalGastos().toFixed(2)}</strong>
                    </div>
                    <div className="resumen-item">
                        <span>Dinero Retirado:</span>
                        <strong>-${cierreCaja.toFixed(2)}</strong>
                    </div>
                    <div className="resumen-item ganancia-final">
                        <span>GANANCIA DEL DÍA:</span>
                        <strong>${getTotalGanancia().toFixed(2)}</strong>
                    </div>
                    <div className={`resumen-item final ${getCajaFinal() >= 0 ? 'positivo' : 'negativo'}`}>
                        <span>Dinero en Caja:</span>
                        <strong>${getCajaFinal().toFixed(2)}</strong>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Finanzas;