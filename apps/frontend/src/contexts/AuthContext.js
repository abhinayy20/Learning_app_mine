import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();
const USER_API_BASE = process.env.REACT_APP_USER_API || 'http://localhost:3002';

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, profileData = {}) {
        // Create Firebase auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Register user profile in backend
        try {
            const response = await fetch(`${USER_API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    ...profileData
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to create profile');
            }

            // Store user data and token
            if (data.data && data.data.token) {
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('userData', JSON.stringify(data.data.user));
            }

            return userCredential;
        } catch (error) {
            // If backend registration fails, delete the Firebase user
            if (userCredential.user) {
                await userCredential.user.delete();
            }
            throw error;
        }
    }

    async function login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Login to backend to get token and user data
        try {
            const response = await fetch(`${USER_API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success && data.data) {
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('userData', JSON.stringify(data.data.user));
            }
        } catch (error) {
            console.error('Backend login failed:', error);
        }

        return userCredential;
    }

    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        return signOut(auth);
    }

    function getUserData() {
        try {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        getUserData,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
