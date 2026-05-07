import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiArrowLeft } from 'react-icons/fi';

interface Student {
    id: string;
    email: string;
    fullName: string;
    groupName: string;
}

export default function GroupDetails() {
    const { groupName } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get(`/v1/groups/${groupName}/students`)
            .then(res => setStudents(res.data))
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    },[groupName]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ backgroundColor: '#101820', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <button onClick={() => navigate('/groups')} style={{ background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', marginRight: '1rem' }}><FiArrowLeft size={20}/></button>
                <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Студенты группы: {groupName}</h1>
            </header>

            <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {isLoading ? <p style={{ padding: '2rem' }}>Загрузка...</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f1f3f5', borderBottom: '2px solid #dee2e6' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#495057' }}>#</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#495057' }}>ФИО</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#495057' }}>Email (Логин)</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#495057' }}>Группа</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem', color: '#6c757d' }}>{index + 1}</td>
                                        <td style={{ padding: '1rem', fontWeight: 600, color: '#101820' }}>{student.fullName || 'Нет данных'}</td>
                                        <td style={{ padding: '1rem', color: '#6c757d' }}>{student.email}</td>
                                        <td style={{ padding: '1rem', color: '#0055A4', fontWeight: 500 }}>{student.groupName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}