"use client";

import React, { useState } from "react";
import { useAuth } from "@/Context/AuthContext";
import LoginScene from "@/Components/LoginScene";
import "@/Styles/Login.css";

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(username, password);
        } catch (err) {
            setError(err.message || "Usuario o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <LoginScene />
            <div className="login-vignette" />

            <div className="formulario">
                <form onSubmit={handleSubmit} className="login-card">
                    <div className="login-card-glow" />

                    <section className="titles">
                        <div className="login-badge">
                            <span className="login-badge-dot" />
                            Sistema de ventas
                        </div>
                        <h1>Bienvenido de vuelta</h1>
                        <p>Inicia sesión para continuar</p>
                    </section>

                    <section className="datos">
                        {error && (
                            <div className="error-message" role="alert">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="input-field">
                            <label htmlFor="username">Usuario</label>
                            <div className="input-shell">
                                <span className="input-icon">👤</span>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Introduce tu usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={loading}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="input-field">
                            <label htmlFor="password">Contraseña</label>
                            <div className="input-shell">
                                <span className="input-icon">🔒</span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Introduce tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="input-toggle"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                    aria-label={
                                        showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                                    }
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            <span className="btn-login-shine" />
                            {loading ? (
                                <>
                                    <span className="spinner" /> Iniciando sesión...
                                </>
                            ) : (
                                "Ingresar"
                            )}
                        </button>
                    </section>
                </form>
            </div>
        </div>
    );
}
