"use client";
import React, { useState } from "react";
import { CartProvider } from "@/Context/CartContext";
import { AuthProvider, useAuth } from "@/Context/AuthContext";
import Header from "@/Utils/Header";
import HandeRouter from "@/Utils/HandeRouter";
import '@/Styles/Login.css';

function AppContent() {
  const [route, setRoute] = useState("home");
  const { logout } = useAuth();

  return (
    <CartProvider>
      <div style={{ padding: '30px' }}>
        <Header route={route} setRoute={setRoute} onLogout={logout} />
        <HandeRouter route={route} />
      </div>
    </CartProvider>
  );
}

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario">
      <form onSubmit={handleSubmit}>
        <section className="titles">
          <h1>Sistema de ventas</h1>
          <p>Iniciar sesión para continuar</p>
        </section>

        <section className="datos">
          {error && <div className="error-message">⚠️ {error}</div>}

          <label>Username:</label>
          <input
            type="text"
            placeholder="Introduce tu Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />

          <label>Password:</label>
          <input
            type="password"
            placeholder="Introduce tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Login'}
          </button>
        </section>
      </form>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
}

export default function Page() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}