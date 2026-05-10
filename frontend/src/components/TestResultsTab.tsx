import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiBarChart2 } from 'react-icons/fi';

interface TestResultsTabProps {
    testId: string;
}

export default function TestResultsTab({ testId }: TestResultsTabProps) {
    const navigate = useNavigate();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/v1/results/test/${testId}`)
            .then(res => setResults(res.data))
            .catch(e => console.error("Ошибка загрузки результатов", e))
            .finally(() => setLoading(false));
    }, [testId]);

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>Загрузка результатов...</div>;

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            {results.length > 0 ? (
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
            ) : (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#999' }}>
                    <FiBarChart2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Работ пока не поступало</p>
                </div>
            )}
        </div>
    );
}