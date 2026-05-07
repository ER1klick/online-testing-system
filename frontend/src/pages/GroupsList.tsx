import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiArrowLeft, FiUsers } from 'react-icons/fi';

export default function GroupsList() {
    const [groups, setGroups] = useState<string[]>([]);
    const[isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/v1/groups')
            .then(res => setGroups(res.data))
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    },[]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <header style={{ backgroundColor: '#101820', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', marginRight: '1rem' }}><FiArrowLeft size={20}/></button>
                <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Учебные группы</h1>
            </header>

            <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                {isLoading ? <p>Загрузка...</p> : groups.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px' }}>
                        <p style={{ color: '#6c757d' }}>Группы пока не импортированы.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {groups.map((group, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/groups/${group}`)}
                                style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer', borderTop: '5px solid #0055A4', transition: 'transform 0.2s', textAlign: 'center' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <FiUsers size={40} color="#0055A4" style={{ marginBottom: '1rem' }} />
                                <h2 style={{ margin: 0, color: '#101820' }}>{group}</h2>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}