import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiPlay, FiLogOut } from 'react-icons/fi';

export default function StudentDashboard() {
    const [tests, setTests] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/v1/tests/my').then(res => setTests(res.data));
    }, []);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ backgroundColor: '#101820', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.2rem' }}>РУТ (МИИТ) | Личный кабинет студента</h1>
                <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} style={{ background: 'none', border: '1px solid white', color: 'white', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>
                    <FiLogOut /> Выйти
                </button>
            </header>
            <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                <h2>Доступные тесты</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {tests.map(test => (
                        <div key={test.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <h3>{test.title}</h3>
                            <p style={{ color: '#666' }}>{test.description}</p>
                            <button
                                onClick={() => navigate(`/take-test/${test.id}`)}
                                style={{ backgroundColor: '#0055A4', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FiPlay /> Начать выполнение
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}