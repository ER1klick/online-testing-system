import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUploadCloud, FiFileText } from 'react-icons/fi';

export default function ImportStudents() {
    const[file, setFile] = useState<File | null>(null);
    const [groupName, setGroupName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!file || !groupName) return alert('Заполните группу и выберите файл');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('groupName', groupName);

        setIsLoading(true);
        try {
            await api.post('/v1/import/pdf', formData);
            alert('Студенты успешно импортированы!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Ошибка импорта. Проверьте формат файла.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ backgroundColor: '#101820', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', marginRight: '1rem' }}><FiArrowLeft size={20}/></button>
                <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Импорт студентов</h1>
            </header>

            <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Название группы</label>
                        <input
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="Например: УВП-411"
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #dee2e6', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Выберите PDF-ведомость</label>
                        <div style={{ border: '2px dashed #dee2e6', borderRadius: '8px', padding: '2rem', textAlign: 'center', backgroundColor: '#fafafa' }}>
                            <FiFileText size={40} color="#0055A4" style={{ marginBottom: '1rem' }} />
                            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'block', margin: '0 auto' }} />
                        </div>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: '#0055A4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        {isLoading ? 'Загрузка...' : <><FiUploadCloud size={20}/> Загрузить список</>}
                    </button>
                </div>
            </main>
        </div>
    );
}