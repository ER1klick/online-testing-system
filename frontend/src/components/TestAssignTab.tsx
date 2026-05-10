import { useState } from 'react';
import { api } from '../services/api';
import { FiUpload, FiCalendar, FiUser } from 'react-icons/fi';

interface TestAssignTabProps {
    testId: string;
    onAssigned: () => void;
}

export default function TestAssignTab({ testId, onAssigned }: TestAssignTabProps) {
    const [previewStudents, setPreviewStudents] = useState<any[]>([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
            await api.post(`/v1/tests/${testId}/assign`, {
                studentIds: previewStudents.map(s => s.id),
                startTime,
                endTime
            });
            alert('Тест успешно назначен!');
            onAssigned();
        } catch (error) {
            alert('Ошибка при назначении');
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            <div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginTop: 0 }}><FiUpload /> Добавить студентов из PDF</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Загрузите ведомость. Студенты будут автоматически добавлены в список справа.</p>
                    <input type="file" accept=".pdf" onChange={(e) => e.target.files && handlePdfUpload(e.target.files[0])} style={{ width: '100%' }} disabled={isLoading} />
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
    );
}