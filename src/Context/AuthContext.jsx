import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/Utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setIsAuthenticated(!!session);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = async (username, password) => {
        const { data: profile, error: lookupError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', username.trim())
            .maybeSingle();

        if (lookupError || !profile) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: profile.email,
            password,
        });

        if (error) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}
