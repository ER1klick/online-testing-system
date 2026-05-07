import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiTrash2, FiSave, FiArrowLeft, FiCode, FiBookOpen, FiPlus, FiCheckCircle, FiCircle, FiMove, FiFolderPlus } from 'react-icons/fi';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Question {
    text: string;
    type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'CODE';
    content: any;
}

interface Section {
    title: string;
    questions: Question[];
}

const TYPE_LABELS = {
    SINGLE_CHOICE: 'Один ответ',
    MULTIPLE_CHOICE: 'Несколько ответов',
    TEXT: 'Развернутый ответ',
    CODE: 'Задача на код'
};

export default function TestEditor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sections, setSections] = useState<Section[]>([{ title: 'Раздел 1', questions: [] }]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get(`/v1/tests/${id}`).then(res => {
            setTitle(res.data.title);
            setDescription(res.data.description);
            setSections([{ title: 'Раздел 1', questions: res.data.questions || [] }]);
        }).finally(() => setIsLoading(false));
    }, [id]);

    // --- Логика управления ---
    const addSection = () => setSections([...sections, { title: `Раздел ${sections.length + 1}`, questions: [] }]);

    const addQuestion = (sIndex: number, type: Question['type']) => {
        const updated = [...sections];
        updated[sIndex].questions.push({ text: '', type: type, content: type === 'CODE' ? { language: 'python', timeLimit: 5 } : { options: [''], correct: [] } });
        setSections(updated);
    };

    const updateQuestionType = (sIndex: number, qIndex: number, type: string) => {
        const updated = [...sections];
        updated[sIndex].questions[qIndex].type = type as any;
        updated[sIndex].questions[qIndex].content = type === 'CODE' ? { language: 'python', timeLimit: 5 } : { options: [''], correct: [] };
        setSections(updated);
    };

    const updateQuestionText = (sIndex: number, qIndex: number, text: string) => {
        const updated = [...sections];
        updated[sIndex].questions[qIndex].text = text;
        setSections(updated);
    };

    const addOption = (sIndex: number, qIndex: number) => {
        const updated = [...sections];
        if (!updated[sIndex].questions[qIndex].content.options) updated[sIndex].questions[qIndex].content.options = [];
        updated[sIndex].questions[qIndex].content.options.push('');
        setSections(updated);
    };

    const updateOption = (sIndex: number, qIndex: number, oIndex: number, value: string) => {
        const updated = [...sections];
        updated[sIndex].questions[qIndex].content.options[oIndex] = value;
        setSections(updated);
    };

    const toggleCorrect = (sIndex: number, qIndex: number, oIndex: number) => {
        const updated = [...sections];
        const q = updated[sIndex].questions[qIndex];
        if (!q.content.correct) q.content.correct = [];
        if (q.type === 'SINGLE_CHOICE') q.content.correct = [oIndex];
        else {
            if (q.content.correct.includes(oIndex)) q.content.correct = q.content.correct.filter((i: number) => i !== oIndex);
            else q.content.correct.push(oIndex);
        }
        setSections(updated);
    };

    const onDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const sIndex = parseInt(active.id.split('-')[1]);
        const oldIndex = parseInt(active.id.split('-')[2]);
        const newIndex = parseInt(over.id.split('-')[2]);
        const updated = [...sections];
        updated[sIndex].questions = arrayMove(updated[sIndex].questions, oldIndex, newIndex);
        setSections(updated);
    };

    const onDragOver = (event: any) => {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id.split('-');
        const overId = over.id.split('-');
        const activeSIndex = parseInt(activeId[1]);
        const overSIndex = overId[0] === 's' ? parseInt(overId[1]) : parseInt(overId[1]);

        if (activeSIndex !== overSIndex) {
            const updated = [...sections];
            const activeQuestion = updated[activeSIndex].questions.splice(parseInt(activeId[2]), 1)[0];
            updated[overSIndex].questions.push(activeQuestion);
            setSections(updated);
        }
    };

    const handleSave = async () => {
        const allQuestions = sections.flatMap(s => s.questions);
        try {
            await api.put(`/v1/tests/${id}`, { title, description, questions: allQuestions });
            alert('Тест успешно сохранен!');
            navigate('/dashboard');
        } catch (error) { alert('Ошибка при сохранении теста'); }
    };

    // --- Вложенный компонент вопроса ---
    function SortableQuestion({ q, qIndex, sIndex }: { q: Question, qIndex: number, sIndex: number }) {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `q-${sIndex}-${qIndex}` });
        const style = { transform: CSS.Transform.toString(transform), transition };

        if (!q) return null;

        return (
            <div ref={setNodeRef} style={{ ...style, backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #0055A4', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div {...attributes} {...listeners} style={{ cursor: 'grab' }}><FiMove size={18} color="#666" /></div>
                        <select value={q.type} onChange={(e) => updateQuestionType(sIndex, qIndex, e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#0055A4' }}>
                            {Object.entries(TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </div>
                    <button onClick={() => { const up = [...sections]; up[sIndex].questions.splice(qIndex, 1); setSections(up); }} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18}/></button>
                </div>
                <textarea value={q.text || ''} onChange={e => updateQuestionText(sIndex, qIndex, e.target.value)} placeholder="Текст вопроса..." rows={2} style={{ width: '100%', padding: '0.5rem', border: 'none', borderBottom: '1px solid #eee', fontSize: '1.1rem', outline: 'none' }} />

                {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (
                    <div style={{ marginTop: '1rem' }}>
                        {(q.content?.options || []).map((opt: string, oIndex: number) => (
                            <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                <button onClick={() => toggleCorrect(sIndex, qIndex, oIndex)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: (q.content?.correct || []).includes(oIndex) ? '#28a745' : '#ccc' }}>
                                    {(q.content?.correct || []).includes(oIndex) ? <FiCheckCircle size={20}/> : <FiCircle size={20}/>}
                                </button>
                                <input value={opt} onChange={e => updateOption(sIndex, qIndex, oIndex, e.target.value)} placeholder={`Вариант ${oIndex + 1}`} style={{ padding: '0.4rem', width: '80%', border: '1px solid #eee', borderRadius: '4px' }} />
                            </div>
                        ))}
                        <button onClick={() => addOption(sIndex, qIndex)} style={{ background: 'none', border: 'none', color: '#0055A4', cursor: 'pointer', fontSize: '0.8rem' }}><FiPlus size={14}/> Вариант</button>
                    </div>
                )}
            </div>
        );
    }

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: '50px' }}>
            <header style={{ backgroundColor: '#101820', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer' }}><FiArrowLeft size={20}/></button>
                    <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Редактор теста</h1>
                </div>
                <button onClick={handleSave} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiSave size={18}/> Сохранить
                </button>
            </header>

            <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem', borderTop: '10px solid #0055A4' }}>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название теста" style={{ width: '100%', padding: '0.5rem 0', marginBottom: '1rem', fontSize: '2rem', border: 'none', borderBottom: '1px solid #eee', outline: 'none' }} />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание теста" rows={2} style={{ width: '100%', padding: '0.5rem 0', fontSize: '1rem', border: 'none', outline: 'none' }} />
                </div>

                <DndContext collisionDetection={closestCenter} onDragOver={onDragOver} onDragEnd={onDragEnd}>
                    {sections.map((section, sIndex) => (
                        <div key={sIndex} style={{ marginBottom: '3rem' }}>
                            <input value={section.title} onChange={e => { const up = [...sections]; up[sIndex].title = e.target.value; setSections(up); }} style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', border: 'none', background: 'transparent', color: '#495057' }} />
                            <SortableContext items={section.questions.map((_, i) => `q-${sIndex}-${i}`)} strategy={verticalListSortingStrategy}>
                                {section.questions.map((q, qIndex) => (
                                    <SortableQuestion key={`q-${sIndex}-${qIndex}`} q={q} qIndex={qIndex} sIndex={sIndex} />
                                ))}
                            </SortableContext>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={() => addQuestion(sIndex, 'SINGLE_CHOICE')} style={{ padding: '0.5rem 1rem', backgroundColor: '#fff', border: '1px solid #0055A4', borderRadius: '4px', cursor: 'pointer', color: '#0055A4' }}><FiBookOpen size={14}/> Теория</button>
                                <button onClick={() => addQuestion(sIndex, 'CODE')} style={{ padding: '0.5rem 1rem', backgroundColor: '#0055A4', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}><FiCode size={14}/> Код</button>
                            </div>
                        </div>
                    ))}
                </DndContext>
                <button onClick={addSection} style={{ width: '100%', padding: '1rem', backgroundColor: '#e9ecef', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}><FiFolderPlus size={18}/> Добавить раздел</button>
            </main>
        </div>
    );
}