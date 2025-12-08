import React from "react";
import '@/Styles/header.css';
import { useCart } from "@/Context/CartContext";

export default function Header({ route, setRoute, onLogout }) {
    const { getTotalItems } = useCart();
    const totalItems = getTotalItems();

    return (
        <header>
            <section>
                <h1>Sistema de ventas</h1>
                <p>Gestión completa de carrito, procesamiento y reportes</p>
            </section>

            <nav>
                <BtnNav url="home" text="Home" setRoute={setRoute} currentRoute={route} />
                <BtnNav
                    url="carrito"
                    text={`Carrito ${totalItems > 0 ? `(${totalItems})` : ''}`}
                    setRoute={setRoute}
                    currentRoute={route}
                />
                <BtnNav url="confirmar" text="Confirmar" setRoute={setRoute} currentRoute={route} />
                <BtnNav url="historial" text="Historial" setRoute={setRoute} currentRoute={route} />
                <BtnNav url="admin" text="Admin" setRoute={setRoute} currentRoute={route} />
                <BtnNav url="finanzas" text="Finanzas" setRoute={setRoute} currentRoute={route} />

                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="btn-logout"
                        style={{ background: '#dc3545', color: 'white' }}
                    >
                        🚪 Salir
                    </button>
                )}
            </nav>
        </header>
    );
}

export function BtnNav({ url, text, setRoute, currentRoute }) {
    const isActive = currentRoute === url;

    return (
        <button
            onClick={() => setRoute(url)}
            className={isActive ? 'active' : ''}
        >
            {text}
        </button>
    );
}