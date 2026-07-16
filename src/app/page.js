"use client";
import React, { useState } from "react";
import { CartProvider } from "@/Context/CartContext";
import { AuthProvider, useAuth } from "@/Context/AuthContext";
import Header from "@/Utils/Header";
import HandeRouter from "@/Utils/HandeRouter";
import Login from "@/Components/Login";

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

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'radial-gradient(circle at 20% 20%, #1b1436 0%, #0a0a18 45%, #05050c 100%)',
          color: '#f2f1fb',
        }}
      >
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