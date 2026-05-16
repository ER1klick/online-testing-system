import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import Editor from '@monaco-editor/react';

export default function SubmissionDetail() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [manualScores, setManualScores] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchData();
    }, [submissionId]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/v1/results/submission/${submissionId}`);
            setData(res.data);
        } catch (e) {
            console.error("Ошибка загрузки деталей:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleScoreUpdate = async (answerId: string) => {
        const score = manualScores[answerId];
        if (score === undefined) return;
        try {
            await api.put(`/v1/results/answers/${answerId}/score`, { score });
            alert('Оценка успешно обновлена!');
            fetchData();
        } catch (e) {
            alert('Ошибка при обновлении оценки');
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Загрузка деталей...</div>;
    if (!data) return <div style={{ padding: '3rem', textAlign: 'center' }}>Данные не найдены</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#0055A4', cursor: 'pointer', marginBottom: '1rem' }}>
                    <FiArrowLeft /> Назад к списку
                </button>

                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: 0 }}>{data.studentName}</h2>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        Группа: {data.groupName} | Итоговый балл: <strong style={{ color: '#0055A4', fontSize: '1.2rem' }}>{data.score}</strong>
                    </p>
                </div>

                {data.answers.map((ans: any, idx: number) => (
                    <div key={idx} style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderLeft: `5px solid ${ans.isCorrect || ans.points > 0 ? '#28a745' : '#dc3545'}`
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                            Вопрос {idx + 1}: {ans.questionText}
                        </div>

                        <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                Ответ студента:
                            </div>

                            {ans.type === 'CODE' ? (
                                <div style={{ border: '1px solid #dee2e6', borderRadius: '6px', overflow: 'hidden' }}>
                                    <Editor
                                        height="250px"
                                        defaultLanguage={ans.language}
                                        theme="vs-dark"
                                        value={ans.content}
                                        options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                                    />
                                </div>
                            ) : ans.type === 'TEXT' ? (
                                <div style={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap', color: '#101820' }}>
                                    {ans.content || <span style={{ color: '#999', fontStyle: 'italic' }}>Нет ответа</span>}
                                </div>
                            ) : (
                                /* РЕНДЕР ДЛЯ SINGLE_CHOICE И MULTIPLE_CHOICE */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {ans.options?.map((opt: string, i: number) => {
                                        let isSelected = false;
                                        if (ans.type === 'SINGLE_CHOICE') {
                                            isSelected = String(ans.content) === String(i);
                                        } else {
                                            try {
                                                const parsed = JSON.parse(ans.content);
                                                isSelected = Array.isArray(parsed) && parsed.includes(i);
                                            } catch (e) {}
                                        }

                                        const isCorrectOption = ans.correct?.includes(i);

                                        let bgColor = 'transparent';
                                        let borderColor = '#dee2e6';
                                        if (isSelected && isCorrectOption) {
                                            bgColor = '#d4edda'; borderColor = '#28a745';
                                        } else if (isSelected && !isCorrectOption) {
                                            bgColor = '#f8d7da'; borderColor = '#dc3545';
                                        } else if (!isSelected && isCorrectOption) {
                                            borderColor = '#28a745';
                                        }

                                        return (
                                            <div key={i} style={{
                                                padding: '10px 12px',
                                                border: `2px solid ${borderColor}`,
                                                borderRadius: '6px',
                                                backgroundColor: bgColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                opacity: (!isSelected && !isCorrectOption) ? 0.6 : 1
                                            }}>
                                                <input
                                                    type={ans.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                                                    checked={isSelected}
                                                    readOnly
                                                    disabled
                                                    style={{ width: '16px', height: '16px' }}
                                                />
                                                <span style={{ fontSize: '1rem', color: '#101820' }}>{opt}</span>

                                                {isSelected && isCorrectOption && <FiCheck color="#28a745" size={20} style={{ marginLeft: 'auto' }} />}
                                                {isSelected && !isCorrectOption && <FiX color="#dc3545" size={20} style={{ marginLeft: 'auto' }} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            {ans.type === 'CODE' || ans.type === 'TEXT' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                                    <span style={{ color: '#666', fontWeight: 'normal' }}>Оценка (макс. {ans.maxPoints}):</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={ans.maxPoints}
                                        step="0.5"
                                        value={manualScores[ans.answerId] !== undefined ? manualScores[ans.answerId] : ans.points}
                                        onChange={e => setManualScores({...manualScores, [ans.answerId]: parseFloat(e.target.value)})}
                                        style={{ width: '70px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #0055A4', fontWeight: 'bold', textAlign: 'center' }}
                                    />
                                    <button
                                        onClick={() => handleScoreUpdate(ans.answerId)}
                                        style={{ backgroundColor: '#0055A4', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#004182'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#0055A4'}
                                    >
                                        Сохранить балл
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {ans.isCorrect ? <><FiCheck color="#28a745" size={20} /> <span style={{color: '#28a745'}}>Верно</span></> : <><FiX color="#dc3545" size={20} /> <span style={{color: '#dc3545'}}>Неверно</span></>}
                                    <span style={{ color: '#666', fontWeight: 'normal', marginLeft: 'auto', fontSize: '1.1rem' }}>
                                        Балл: <strong style={{ color: '#101820' }}>{ans.points}</strong> / {ans.maxPoints}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}