import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async() => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(response.data);
            } catch (err) {
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);

    return { user, loading };
}