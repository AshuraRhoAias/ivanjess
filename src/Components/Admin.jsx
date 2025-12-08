import React, { useState } from 'react';
import '@/Styles/Admin.css';
import { Cards } from '@/Utils/Cards';
import { productsAPI } from '@/Utils/ProductsData';

function Admin() {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [productoEditando, setProductoEditando] = useState(null);
    const [cameraMode, setCameraMode] = useState(false);
    const [stream, setStream] = useState(null);
    const [nuevoProducto, setNuevoProducto] = useState({
        name: '',
        venta: 0,
        compra: 0,
        stk: 0,
        img: ''
    });



    const abrirModal = (producto = null) => {
        if (producto) {
            setProductoEditando(producto);
            setNuevoProducto(producto);
        } else {
            setProductoEditando(null);
            setNuevoProducto({
                name: '',
                venta: 0,
                compra: 0,
                stk: 0,
                img: ''
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setProductoEditando(null);
        setCameraMode(false);
        detenerCamara();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoProducto({
            ...nuevoProducto,
            [name]: name === 'name' || name === 'img' ? value : parseFloat(value) || 0
        });
    };

    const iniciarCamara = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setCameraMode(true);

            setTimeout(() => {
                const video = document.getElementById('video-camera');
                if (video) {
                    video.srcObject = mediaStream;
                }
            }, 100);
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            alert('No se pudo acceder a la cámara');
        }
    };

    const detenerCamara = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const tomarFoto = () => {
        const video = document.getElementById('video-camera');
        const canvas = document.getElementById('canvas-foto');

        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            const imagenBase64 = canvas.toDataURL('image/jpeg');
            setNuevoProducto({
                ...nuevoProducto,
                img: imagenBase64
            });

            setCameraMode(false);
            detenerCamara();
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNuevoProducto({
                    ...nuevoProducto,
                    img: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        cargarProductos;
    }, []);

    const cargarProductos = async () => {
        try {
            const data = await productsAPI.getAll();
            setProductos(data);
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    };

    const guardarProducto = async () => {
        try {
            if (productoEditando) {
                // Editar
                await productsAPI.update(productoEditando.idname, nuevoProducto);
                setProductos(productos.map(p =>
                    p.idname === productoEditando.idname ? { ...nuevoProducto, idname: p.idname } : p
                ));
            } else {
                // Crear nuevo
                const productoCreado = await productsAPI.create(nuevoProducto);
                setProductos([...productos, productoCreado]);
            }
            cerrarModal();
        } catch (error) {
            alert('Error al guardar producto: ' + error.message);
        }
    };

    const eliminarProducto = async (idname) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await productsAPI.delete(idname);
                setProductos(productos.filter(p => p.idname !== idname));
            } catch (error) {
                alert('Error al eliminar producto: ' + error.message);
            }
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <button onClick={() => abrirModal()} className="btn-agregar">
                    + Agregar Nuevo Producto
                </button>
            </div>

            <div className="cards">
                {productos.map(producto => (
                    <Cards
                        key={producto.idname}
                        product={producto}
                        showAdminButtons={true}
                        onEdit={abrirModal}
                        onDelete={eliminarProducto}
                    />
                ))}
            </div>

            {/* Modal */}
            {modalAbierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={cerrarModal} className="btn-cerrar">×</button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-subtitle">Completa los detalles del producto</p>

                            <div className="form-group">
                                <label>Nombre del Producto</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={nuevoProducto.name}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Laptop HP"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Precio Venta</label>
                                    <input
                                        type="number"
                                        name="venta"
                                        value={nuevoProducto.venta}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Costo</label>
                                    <input
                                        type="number"
                                        name="compra"
                                        value={nuevoProducto.compra}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Stock</label>
                                <input
                                    type="number"
                                    name="stk"
                                    value={nuevoProducto.stk}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Imagen del Producto</label>

                                {!cameraMode && !nuevoProducto.img && (
                                    <div className="imagen-opciones">
                                        <button
                                            onClick={iniciarCamara}
                                            className="btn-opcion-imagen"
                                        >
                                            📷 Tomar Foto
                                        </button>
                                        <label className="btn-opcion-imagen">
                                            🖼️ Seleccionar Archivo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </div>
                                )}

                                {cameraMode && (
                                    <div className="camera-container">
                                        <video
                                            id="video-camera"
                                            autoPlay
                                            playsInline
                                            className="video-preview"
                                        ></video>
                                        <div className="camera-controles">
                                            <button onClick={tomarFoto} className="btn-tomar-foto">
                                                📸 Capturar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCameraMode(false);
                                                    detenerCamara();
                                                }}
                                                className="btn-cancelar-camara"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {nuevoProducto.img && !cameraMode && (
                                    <div className="imagen-preview">
                                        <img src={nuevoProducto.img} alt="Preview" />
                                        <button
                                            onClick={() => setNuevoProducto({ ...nuevoProducto, img: '' })}
                                            className="btn-quitar-imagen"
                                        >
                                            ✕ Quitar imagen
                                        </button>
                                    </div>
                                )}

                                {!cameraMode && !nuevoProducto.img && (
                                    <input
                                        type="text"
                                        name="img"
                                        value={nuevoProducto.img}
                                        onChange={handleInputChange}
                                        placeholder="https://..."
                                        className="url-input"
                                    />
                                )}
                            </div>

                            <canvas id="canvas-foto" style={{ display: 'none' }}></canvas>
                        </div>

                        <div className="modal-footer">
                            <button onClick={guardarProducto} className="btn-crear">
                                {productoEditando ? 'Guardar Cambios' : 'Crear Producto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;