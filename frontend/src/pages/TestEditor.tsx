import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Question {
    text: string;
    type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'CODE';
    content: any;
}

export default function TestEditor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get(`/v1/tests/${id}`)
            .then(res => {
                setTitle(res.data.title);
                setDescription(res.data.description);
                setQuestions(res.data.questions || []);
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, [id]);

    const addQuestion = (type: Question['type']) => {
        const newQuestion: Question = {
            text: '',
            type: type,
            content: type === 'CODE' ? { language: 'python', timeLimit: 5 } : { options: [''] }
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestionText = (index: number, text: string) => {
        const updated = [...questions];
        updated[index].text = text;
        setQuestions(updated);
    };

    const addOption = (qIndex: number) => {
        const updated = [...questions];
        if (!updated[qIndex].content.options) updated[qIndex].content.options = [];
        updated[qIndex].content.options.push('');
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].content.options[oIndex] = value;
        setQuestions(updated);
    };

    const handleSave = async () => {
        try {
            await api.put(`/v1/tests/${id}`, { title, description, questions });
            alert('Тест успешно сохранен!');
            navigate('/dashboard');
        } catch (error) {
            alert('Ошибка при сохранении теста');
        }
    };

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
            <header style={{ backgroundColor: 'var(--miit-dark)', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', marginRight: '1rem' }}>← Назад</button>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Конструктор теста</h1>
                </div>
                <button onClick={handleSave} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    💾 Сохранить тест
                </button>
            </header>

            <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название теста" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', fontSize: '1.2rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание теста" rows={3} style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>

                {questions.map((q, qIndex) => (
                    <div key={qIndex} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: `4px solid var(--miit-blue)` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <select value={q.type} onChange={(e) => {
                                const updated = [...questions];
                                updated[qIndex].type = e.target.value as any;
                                setQuestions(updated);
                            }}>
                                <option value="SINGLE_CHOICE">Один ответ</option>
                                <option value="MULTIPLE_CHOICE">Несколько ответов</option>
                                <option value="TEXT">Развернутый ответ</option>
                                <option value="CODE">Задача на код</option>
                            </select>
                            <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Удалить</button>
                        </div>
                        <textarea value={q.text} onChange={e => updateQuestionText(qIndex, e.target.value)} placeholder="Текст вопроса..." rows={2} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }} />

                        {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (
                            <div>
                                {q.content.options?.map((opt: string, oIndex: number) => (
                                    <input key={oIndex} value={opt} onChange={e => updateOption(qIndex, oIndex, e.target.value)} placeholder={`Вариант ${oIndex + 1}`} style={{ display: 'block', marginBottom: '0.5rem', padding: '0.5rem' }} />
                                ))}
                                <button onClick={() => addOption(qIndex)}>+ Вариант</button>
                            </div>
                        )}
                    </div>
                ))}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={() => addQuestion('SINGLE_CHOICE')} style={{ flex: 1, padding: '1rem', backgroundColor: 'white', border: '2px dashed #ccc', borderRadius: '8px', cursor: 'pointer' }}>+ Теория</button>
                    <button onClick={() => addQuestion('CODE')} style={{ flex: 1, padding: '1rem', backgroundColor: 'white', border: '2px dashed var(--miit-blue)', borderRadius: '8px', cursor: 'pointer' }}>+ Код</button>
                </div>
            </main>
        </div>
    );
}