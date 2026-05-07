import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Test {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
}

export default function Dashboard() {
    const [tests, setTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await api.get('/v1/tests');
                setTests(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке тестов:', error);
                localStorage.removeItem('isAuthenticated');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTests();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    // Функция создания нового теста
    const createTest = async () => {
        try {
            const res = await api.post('/v1/tests/create');
            navigate(`/edit-test/${res.data.id}`);
        } catch (error) {
            console.error('Ошибка создания теста:', error);
            alert('Не удалось создать тест');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
            {/* Верхняя панель (Header) */}
            <header style={{
                backgroundColor: 'var(--miit-dark)',
                color: 'white',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>РУТ (МИИТ) | Панель преподавателя</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: '1px solid white',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'var(--miit-dark)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'white'; }}
                >
                    Выйти
                </button>
            </header>

            {/* Основной контент */}
            <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--miit-dark)', margin: 0 }}>Мои тесты</h2>

                    <div>
                        <button
                            onClick={() => navigate('/import-students')}
                            style={{
                                backgroundColor: 'white',
                                color: 'var(--miit-dark)',
                                border: '1px solid var(--miit-dark)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginRight: '1rem',
                                fontWeight: 500
                            }}
                        >
                            📄 Импорт студентов (PDF)
                        </button>
                        <button
                            onClick={createTest} // Теперь вызывает функцию создания
                            style={{
                                backgroundColor: 'var(--miit-blue)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            + Создать тест
                        </button>
                    </div>
                </div>

                {/* Список тестов */}
                {isLoading ? (
                    <p>Загрузка тестов...</p>
                ) : tests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #ccc' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>У вас пока нет созданных тестов.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {tests.map((test) => (
                            <div key={test.id} style={{
                                backgroundColor: 'white',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                borderTop: `4px solid ${test.isPublished ? '#28a745' : 'var(--text-muted)'}`
                            }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--miit-dark)' }}>{test.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{test.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: test.isPublished ? '#e6f4ea' : '#f8f9fa',
                                        color: test.isPublished ? '#1e8e3e' : '#6c757d',
                                        borderRadius: '4px'
                                    }}>
                                        {test.isPublished ? 'Опубликован' : 'Черновик'}
                                    </span>
                                    <button
                                        onClick={() => navigate(`/edit-test/${test.id}`)}
                                        style={{ background: 'none', border: 'none', color: 'var(--miit-blue)', cursor: 'pointer', fontWeight: 500 }}
                                    >
                                        Редактировать
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}