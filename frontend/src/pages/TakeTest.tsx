import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import StudentQuestionBlock from '../components/StudentQuestionBlock';

export default function TakeTest() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState<any>(null);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getQuestionId = (q: any, index: number) => q.id || `q-fallback-${index}`;

    useEffect(() => {
        api.get(`/v1/tests/${id}`).then(res => {
            setTest(res.data);

            const initial: any = {};
            res.data.questions.forEach((q: any, idx: number) => {
                const safeId = getQuestionId(q, idx);
                initial[safeId] = q.type === 'MULTIPLE_CHOICE' ? [] : '';
            });
            setAnswers(initial);
        }).catch(err => {
            console.error("Ошибка загрузки теста:", err);
            alert("Не удалось загрузить тест");
        });
    }, [id]);

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async () => {
        if (!window.confirm("Вы уверены, что хотите сдать работу? После отправки изменить ответы будет невозможно.")) return;

        setIsSubmitting(true);
        try {
            const subRes = await api.post(`/v1/tests/${id}/submit-final`);
            const newSubmissionId = subRes.data.id; // Получаем ID созданной записи

            for (let i = 0; i < test.questions.length; i++) {
                const q = test.questions[i];
                const safeId = getQuestionId(q, i);
                const currentAns = answers[safeId];

                const payload = {
                    submissionId: newSubmissionId,
                    questionId: q.id,
                    code: Array.isArray(currentAns) ? JSON.stringify(currentAns) : String(currentAns),
                    language: q.type === 'CODE' ? (q.content?.language || 'python') : 'text'
                };

                await api.post('/v1/execution/test', payload);
            }

            alert('Тест успешно завершен и отправлен на проверку!');
            navigate('/dashboard');
        } catch (e) {
            console.error("Ошибка при отправке теста:", e);
            alert('Произошла ошибка при сохранении результатов. Пожалуйста, обратитесь к преподавателю.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!test) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: '#666'
            }}>
                Загрузка материалов теста...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', paddingBottom: '80px' }}>
            {/* Шапка с названием и кнопкой сдачи */}
            <header style={{
                backgroundColor: '#101820',
                color: 'white',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: '#0055A4', fontWeight: 'bold', textTransform: 'uppercase' }}>Тестирование</div>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>{test.title}</h1>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                        backgroundColor: isSubmitting ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '0.7rem 1.5rem',
                        borderRadius: '6px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        transition: 'background 0.2s'
                    }}
                >
                    {isSubmitting ? 'Отправка результатов...' : 'Завершить тест'}
                </button>
            </header>

            {/* Список вопросов */}
            <main style={{ padding: '2rem 1rem', maxWidth: '850px', margin: '0 auto' }}>
                {test.questions.map((q: any, idx: number) => {
                    const safeId = getQuestionId(q, idx);
                    return (
                        <StudentQuestionBlock
                            key={`question-block-${safeId}`}
                            q={q}
                            index={idx}
                            currentAnswer={answers[safeId]}
                            onAnswerChange={(val) => handleAnswerChange(safeId, val)}
                        />
                    );
                })}
            </main>

        </div>
    );
}