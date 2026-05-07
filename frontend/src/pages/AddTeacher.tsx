import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUserPlus } from 'react-icons/fi';

export default function AddTeacher() {
    const [fullName, setFullName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !employeeId) return alert('Заполните все поля');

        setIsLoading(true);
        try {
            await api.post('/v1/users/teacher', { fullName, employeeId });
            alert(`Преподаватель успешно добавлен!\nЛогин: ${employeeId}@edu.rut-miit.ru\nПароль: password${employeeId}`);
            navigate('/dashboard');
        } catch (error: any) {
            alert(error.response?.data || 'Ошибка при добавлении преподавателя');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ backgroundColor: '#101820', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', marginRight: '1rem' }}><FiArrowLeft size={20}/></button>
                <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Добавление преподавателя</h1>
            </header>

            <main style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderTop: '5px solid #0055A4' }}>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#101820' }}>ФИО преподавателя</label>
                        <input
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Иванов Иван Иванович"
                            required
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #dee2e6', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#101820' }}>Табельный номер</label>
                        <input
                            value={employeeId}
                            onChange={e => setEmployeeId(e.target.value)}
                            placeholder="Например: 123456"
                            required
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #dee2e6', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }}
                        />
                        <small style={{ color: '#6c757d', display: 'block', marginTop: '0.5rem' }}>
                            Логин будет сгенерирован автоматически: <b>[номер]@edu.rut-miit.ru</b>
                        </small>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ width: '100%', padding: '1rem', backgroundColor: '#0055A4', color: 'white', border: 'none', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                    >
                        {isLoading ? 'Сохранение...' : <><FiUserPlus size={20}/> Добавить преподавателя</>}
                    </button>
                </form>
            </main>
        </div>
    );
}