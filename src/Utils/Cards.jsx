export function Cards({ product, onAddToCart, showAdminButtons, onEdit, onDelete }) {
    const { name, idname, stk, img, venta, compra } = product;

    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart(product);
        }
    };

    // ✅ Construir URL completa para la imagen
    const imageUrl = img && !img.startsWith('http')
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${img}`
        : img || 'https://via.placeholder.com/300x200?text=Sin+Imagen';

    return (
        <section className="card">
            <article className="card-header">
                <h3>{name}</h3>
                <p>id: {idname}</p>
            </article>

            <span className="stk">{stk} {showAdminButtons ? 'stock' : 'Stock'}</span>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={name} />

            <article className="card-footer">
                <p>precio</p>
                <p>costo</p>

                <h2>${venta.toFixed(2)}</h2>
                <h4>${compra.toFixed(2)}</h4>
            </article>

            {!showAdminButtons ? (
                <button className="btn-buy" onClick={handleAddToCart}>
                    Añadir al carrito
                </button>
            ) : (
                <div className="admin-card-actions">
                    <button
                        className="btn-editar"
                        onClick={() => onEdit(product)}
                    >
                        ✏️ Editar
                    </button>
                    <button
                        className="btn-eliminar"
                        onClick={() => onDelete(idname)}
                    >
                        🗑️
                    </button>
                </div>
            )}
        </section>
    );
}