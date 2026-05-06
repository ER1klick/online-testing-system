import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/v1/auth/login', { email, password });
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/dashboard');
        } catch (err) {
            setError('Неверный email или пароль');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#F4F6F9', // Светлый фон
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            <form onSubmit={handleLogin} style={{
                padding: '2.5rem',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(16, 24, 32, 0.1)',
                width: '100%',
                maxWidth: '400px',
                borderTop: '5px solid #101820'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#101820', margin: 0, fontSize: '1.5rem' }}>РУТ (МИИТ)</h2>
                    <p style={{ color: '#6C757D', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                        Система онлайн-тестирования
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        marginBottom: '1.5rem',
                        backgroundColor: '#FDECEA',
                        color: '#E3000F',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#101820', fontWeight: 500, fontSize: '0.9rem' }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin2@test.com"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #CED4DA',
                            borderRadius: '4px',
                            boxSizing: 'border-box',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#101820', fontWeight: 500, fontSize: '0.9rem' }}>
                        Пароль
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #CED4DA',
                            borderRadius: '4px',
                            boxSizing: 'border-box',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '0.85rem',
                        backgroundColor: '#0055A4', // Корпоративный синий
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#101820'} // При наведении становится фирменным темным
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0055A4'}
                >
                    {isLoading ? 'Вход...' : 'Войти в систему'}
                </button>
            </form>
        </div>
    );
}