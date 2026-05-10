import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiArrowLeft, FiCheck, FiX, FiCode } from 'react-icons/fi';
import Editor from '@monaco-editor/react';

export default function SubmissionDetail() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/v1/results/submission/${submissionId}`)
        .then(res => {
            setData(res.data);
            setLoading(false);
        });
    }, [submissionId]);

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Загрузка деталей...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#0055A4', cursor: 'pointer', marginBottom: '1rem' }}>
                    <FiArrowLeft /> Назад к списку
                </button>

                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>{data.studentName}</h2>
                    <p style={{ color: '#666' }}>Группа: {data.groupName} | Итоговый балл: <strong>{data.score}</strong></p>
                </div>

                {data.answers.map((ans: any, idx: number) => (
                    <div key={idx} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: `5px solid ${ans.isCorrect ? '#28a745' : '#dc3545'}` }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Вопрос {idx + 1}: {ans.questionText}</div>

                        <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Ответ студента:</div>

                            {ans.type === 'CODE' ? (
                                <Editor
                                    height="200px"
                                    defaultLanguage={ans.language}
                                    theme="vs-dark"
                                    value={ans.content}
                                    options={{ readOnly: true, minimap: { enabled: false } }}
                                />
                            ) : (
                                <div style={{ fontSize: '1.1rem' }}>{ans.content}</div>
                            )}
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: ans.isCorrect ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                            {ans.isCorrect ? <><FiCheck /> Верно</> : <><FiX /> Неверно</>}
                            <span style={{ color: '#666', fontWeight: 'normal', marginLeft: 'auto' }}>Балл: {ans.points}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}