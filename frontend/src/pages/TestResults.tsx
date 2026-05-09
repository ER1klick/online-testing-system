import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiUser, FiBarChart2, FiArrowLeft } from 'react-icons/fi';

export default function TestResults() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState<any[]>([]);
    const [testInfo, setTestInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [testRes, resultsRes] = await Promise.all([
                    api.get(`/v1/tests/${testId}`),
                    api.get(`/v1/results/test/${testId}`)
                ]);
                setTestInfo(testRes.data);
                setResults(resultsRes.data);
            } catch (e) {
                console.error("Ошибка загрузки результатов", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [testId]);

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Загрузка результатов...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                <button
                    onClick={() => navigate(-1)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#0055A4', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}
                >
                    <FiArrowLeft /> Назад к тестам
                </button>

                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0, color: '#101820', fontSize: '1.8rem' }}>Результаты: {testInfo?.title}</h1>
                    <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>Всего сдано работ: <strong>{results.length}</strong></p>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#101820', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '15px' }}>Табельный №</th>
                                <th style={{ padding: '15px' }}>ФИО студента</th>
                                <th style={{ padding: '15px' }}>Группа</th>
                                <th style={{ padding: '15px' }}>Баллы</th>
                                <th style={{ padding: '15px' }}>Дата сдачи</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((res) => (
                                <tr key={res.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontFamily: 'monospace', fontWeight: 'bold' }}>{res.studentCardNumber || '—'}</td>
                                    <td style={{ padding: '15px' }}>{res.studentName}</td>
                                    <td style={{ padding: '15px' }}>{res.groupName}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            backgroundColor: '#eef2ff',
                                            color: '#0055A4',
                                            fontWeight: 'bold'
                                        }}>
                                            {res.score} / {res.maxScore}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', color: '#666', fontSize: '0.9rem' }}>
                                        {new Date(res.submittedAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => navigate(`/submission/${res.id}`)}
                                            style={{
                                                backgroundColor: '#0055A4',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Детали
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {results.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#999' }}>
                            <FiBarChart2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Работ пока не поступало</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}