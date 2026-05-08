import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
    FiTrash2, FiSave, FiArrowLeft, FiCode, FiBookOpen,
    FiPlus, FiCheckCircle, FiCircle, FiMove, FiFolderPlus,
    FiCalendar, FiList, FiBarChart2, FiUpload, FiUser
} from 'react-icons/fi';
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

interface StudentPreview {
    id: string;
    fullName: string;
    email: string;
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

    const [activeTab, setActiveTab] = useState<'edit' | 'assign' | 'results'>('edit');
    const [isLoading, setIsLoading] = useState(true);

    // Данные теста
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sections, setSections] = useState<Section[]>([{ title: 'Раздел 1', questions: [] }]);

    // Данные для назначения
    const[previewStudents, setPreviewStudents] = useState<StudentPreview[]>([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        api.get(`/v1/tests/${id}`).then(res => {
            setTitle(res.data.title);
            setDescription(res.data.description);
            const grouped = (res.data.questions ||[]).reduce((acc: any, q: any) => {
                const sTitle = q.sectionTitle || 'Раздел 1';
                if (!acc[sTitle]) acc[sTitle] = [];
                acc[sTitle].push(q);
                return acc;
            }, {});
            const sectionsArray = Object.keys(grouped).map(t => ({ title: t, questions: grouped[t] }));
            setSections(sectionsArray.length > 0 ? sectionsArray :[{ title: 'Раздел 1', questions: [] }]);
        }).finally(() => setIsLoading(false));
    }, [id]);

    // --- Функции управления вопросами ---
    const addSection = () => setSections([...sections, { title: `Раздел ${sections.length + 1}`, questions: [] }]);

    const addQuestion = (sIndex: number, type: Question['type']) => {
        const updated = [...sections];
        updated[sIndex].questions.push({ text: '', type: type, content: type === 'CODE' ? { language: 'python', timeLimit: 5 } : { options: [''], correct:[] } });
        setSections(updated);
    };

    const updateQuestionType = (sIndex: number, qIndex: number, type: string) => {
        const updated = [...sections];
        updated[sIndex].questions[qIndex].type = type as any;
        updated[sIndex].questions[qIndex].content = type === 'CODE' ? { language: 'python', timeLimit: 5 } : { options: [''], correct:[] };
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
        if (!q.content.correct) q.content.correct =[];
        if (q.type === 'SINGLE_CHOICE') q.content.correct = [oIndex];
        else {
            if (q.content.correct.includes(oIndex)) q.content.correct = q.content.correct.filter((i: number) => i !== oIndex);
            else q.content.correct.push(oIndex);
        }
        setSections(updated);
    };

    // --- Drag and Drop ---
    const onDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const activeData = active.id.split('-');
        const overData = over.id.split('-');
        const sIndex = parseInt(activeData[1]);
        const oldIndex = parseInt(activeData[2]);
        const newIndex = parseInt(overData[2]);
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

    // --- Сохранение и Назначение ---
    const handleSave = async () => {
        const allQuestions = sections.flatMap(s => s.questions.map(q => ({ ...q, sectionTitle: s.title })));
        try {
            await api.put(`/v1/tests/${id}`, { title, description, questions: allQuestions });
            alert('Тест успешно сохранен!');
        } catch (error) { alert('Ошибка при сохранении'); }
    };

    const handlePdfUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsLoading(true);
            const res = await api.post('/v1/import/pdf', formData);
            const importedStudents = res.data;

            setPreviewStudents(prev => {
                const existingIds = prev.map(s => s.id);
                const newStudents = importedStudents.filter((s: any) => !existingIds.includes(s.id));
                return[...prev, ...newStudents];
            });

            alert(`Успешно добавлено ${importedStudents.length} студентов в список рассылки.`);
        } catch (e) {
            alert('Ошибка импорта PDF');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (previewStudents.length === 0) return alert('Список студентов пуст!');
        if (!startTime || !endTime) return alert('Укажите время проведения!');

        try {
            await api.post(`/v1/tests/${id}/assign`, {
                studentIds: previewStudents.map(s => s.id),
                startTime,
                endTime
            });
            alert('Тест успешно назначен!');
            setActiveTab('edit');
        } catch (error) { alert('Ошибка при назначении'); }
    };

    // --- Вложенный компонент вопроса ---
    function SortableQuestion({ q, qIndex, sIndex }: { q: Question, qIndex: number, sIndex: number }) {
        const { attributes, listeners, setNodeRef, transform } = useSortable({ id: `q-${sIndex}-${qIndex}` });
        const style = { transform: CSS.Transform.toString(transform) };
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
                <textarea value={q.text} onChange={e => updateQuestionText(sIndex, qIndex, e.target.value)} placeholder="Текст вопроса..." rows={2} style={{ width: '100%', padding: '0.5rem', border: 'none', borderBottom: '1px solid #eee', fontSize: '1.1rem', outline: 'none' }} />

                {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (
                    <div style={{ marginTop: '1rem' }}>
                        {(q.content?.options ||[]).map((opt: string, oIndex: number) => (
                            <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                <button onClick={() => toggleCorrect(sIndex, qIndex, oIndex)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: (q.content?.correct ||[]).includes(oIndex) ? '#28a745' : '#ccc' }}>
                                    {(q.content?.correct ||[]).includes(oIndex) ? <FiCheckCircle size={20}/> : <FiCircle size={20}/>}
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
                    <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{title || 'Редактор теста'}</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setActiveTab('edit')} style={{ background: activeTab === 'edit' ? '#0055A4' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><FiList /> Редактор</button>
                    <button onClick={() => setActiveTab('assign')} style={{ background: activeTab === 'assign' ? '#0055A4' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><FiCalendar /> Назначить</button>
                    <button onClick={() => setActiveTab('results')} style={{ background: activeTab === 'results' ? '#0055A4' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><FiBarChart2 /> Результаты</button>
                </div>
                <button onClick={handleSave} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiSave size={18}/> Сохранить
                </button>
            </header>

            <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

                {/* ВКЛАДКА: РЕДАКТИРОВАНИЕ */}
                {activeTab === 'edit' && (
                    <>
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
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => addQuestion(sIndex, 'SINGLE_CHOICE')} style={{ padding: '0.5rem 1rem', backgroundColor: '#fff', border: '1px solid #0055A4', borderRadius: '4px', cursor: 'pointer', color: '#0055A4' }}><FiBookOpen size={14}/> Теория</button>
                                        <button onClick={() => addQuestion(sIndex, 'CODE')} style={{ padding: '0.5rem 1rem', backgroundColor: '#0055A4', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}><FiCode size={14}/> Код</button>
                                    </div>
                                </div>
                            ))}
                        </DndContext>
                        <button onClick={addSection} style={{ width: '100%', padding: '1rem', backgroundColor: '#e9ecef', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}><FiFolderPlus size={18}/> Добавить раздел</button>
                    </>
                )}

                {/* ВКЛАДКА: НАЗНАЧИТЬ */}
                {activeTab === 'assign' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        <div>
                            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                                <h3 style={{ marginTop: 0 }}><FiUpload /> Добавить студентов из PDF</h3>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Загрузите ведомость. Студенты будут автоматически добавлены в список справа.</p>
                                <input type="file" accept=".pdf" onChange={(e) => e.target.files && handlePdfUpload(e.target.files[0])} style={{ width: '100%' }} />
                            </div>

                            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <h3><FiCalendar /> Время проведения</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #dee2e6', borderRadius: '6px' }} />
                                    <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #dee2e6', borderRadius: '6px' }} />
                                </div>
                                <button onClick={handleAssign} style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', backgroundColor: '#0055A4', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Назначить тест ({previewStudents.length} чел.)
                                </button>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', maxHeight: '80vh', overflowY: 'auto' }}>
                            <h3 style={{ marginTop: 0 }}>Список участников</h3>
                            {previewStudents.length === 0 ? <p style={{ color: '#999' }}>Загрузите PDF, чтобы добавить студентов</p> : (
                                <div style={{ fontSize: '0.9rem' }}>
                                    {previewStudents.map((s, i) => (
                                        <div key={i} style={{ padding: '0.75rem 0', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FiUser size={16} color="#0055A4" />
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#101820' }}>{s.fullName}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Зачетка: {s.email.split('@')[0]}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ВКЛАДКА: РЕЗУЛЬТАТЫ */}
                {activeTab === 'results' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                        <FiBarChart2 size={48} color="#ccc" />
                        <h2 style={{ color: '#101820' }}>Результаты появятся здесь после сдачи</h2>
                    </div>
                )}
            </main>
        </div>
    );
}