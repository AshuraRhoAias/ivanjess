'use client'
import React, { useState, useEffect } from 'react';
import '@/Styles/Admin.css';
import { Cards } from '@/Utils/Cards';
import { productsAPI } from '@/Utils/ProductsData';

function Admin() {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [productoEditando, setProductoEditando] = useState(null);
    const [productos, setProductos] = useState([]);
    const [cameraMode, setCameraMode] = useState(false);
    const [stream, setStream] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState({
        name: '',
        venta: '',
        compra: '',
        stk: 0,
        img: ''
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const data = await productsAPI.getAll();
            setProductos(data);
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    };

    const abrirModal = (producto = null) => {
        if (producto) {
            setProductoEditando(producto);
            setNuevoProducto(producto);
        } else {
            setProductoEditando(null);
            setNuevoProducto({
                name: '',
                venta: '',
                compra: '',
                stk: '',
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
            [name]: name === 'name' || name === 'img' ? value : parseFloat(value) || ''
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

    // ✅ Subir imagen al servidor
    const subirImagen = async (base64Image) => {
        try {
            setUploadingImage(true);
            const response = await productsAPI.uploadImage(base64Image);
            return response.encryptedPath; // Ruta cifrada desde el servidor
        } catch (error) {
            console.error('Error al subir imagen:', error);
            alert('Error al subir la imagen');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const tomarFoto = async () => {
        const video = document.getElementById('video-camera');
        const canvas = document.getElementById('canvas-foto');

        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            const imagenBase64 = canvas.toDataURL('image/jpeg', 0.8);
            
            // ✅ Subir imagen al servidor
            const encryptedPath = await subirImagen(imagenBase64);
            
            if (encryptedPath) {
                setNuevoProducto({
                    ...nuevoProducto,
                    img: encryptedPath // Guardar ruta cifrada
                });
            }

            setCameraMode(false);
            detenerCamara();
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                // ✅ Subir imagen al servidor
                const encryptedPath = await subirImagen(reader.result);
                
                if (encryptedPath) {
                    setNuevoProducto({
                        ...nuevoProducto,
                        img: encryptedPath // Guardar ruta cifrada
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const guardarProducto = async () => {
        try {
            // Validaciones
            if (!nuevoProducto.name.trim()) {
                alert('El nombre del producto es requerido');
                return;
            }
            if (!nuevoProducto.venta || nuevoProducto.venta <= 0) {
                alert('El precio de venta debe ser mayor a 0');
                return;
            }
            if (!nuevoProducto.compra || nuevoProducto.compra <= 0) {
                alert('El precio de compra debe ser mayor a 0');
                return;
            }

            if (productoEditando) {
                // Editar
                await productsAPI.update(productoEditando.idname, nuevoProducto);
            } else {
                // Crear nuevo
                await productsAPI.create(nuevoProducto);
            }
            
            cerrarModal();
            cargarProductos(); // Recargar productos
        } catch (error) {
            alert('Error al guardar producto: ' + error.message);
        }
    };

    const eliminarProducto = async (idname) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await productsAPI.delete(idname);
                cargarProductos();
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
                                        placeholder="0.00"
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
                                        placeholder="0.00"
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
                                            disabled={uploadingImage}
                                        >
                                            📷 Tomar Foto
                                        </button>
                                        <label className={`btn-opcion-imagen ${uploadingImage ? 'disabled' : ''}`}>
                                            🖼️ Seleccionar Archivo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                style={{ display: 'none' }}
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    </div>
                                )}

                                {uploadingImage && (
                                    <div className="uploading-message">
                                        <p>⏳ Subiendo imagen...</p>
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
                                            <button 
                                                onClick={tomarFoto} 
                                                className="btn-tomar-foto"
                                                disabled={uploadingImage}
                                            >
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
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/image/${nuevoProducto.img}`}
                                            alt="Preview"
                                            style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
                                        />
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
                                        placeholder="https://... o deja vacío para subir archivo"
                                        className="url-input"
                                    />
                                )}
                            </div>

                            <canvas id="canvas-foto" style={{ display: 'none' }}></canvas>
                        </div>

                        <div className="modal-footer">
                            <button 
                                onClick={guardarProducto} 
                                className="btn-crear"
                                disabled={uploadingImage}
                            >
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