import React from "react";
import Home from "@/Components/Home";
import Carrito from "@/Components/Carrito";
import Confirmar from "@/Components/Confirmar";
import Historial from "@/Components/Historial";
import Admin from "@/Components/Admin";
import Finanazas from "@/Components/Finanazas";

export default function HandeRouter({ route, setRoute }) {
    return (
        <div style={{ padding: "20px" }}>
            {route === "home" && <Home />}
            {route === "carrito" && <Carrito onNavigate={setRoute} />}
            {route === "confirmar" && <Confirmar />}
            {route === "historial" && <Historial />}
            {route === "admin" && <Admin />}
            {route === "finanzas" && <Finanazas />}
        </div>
    );
}