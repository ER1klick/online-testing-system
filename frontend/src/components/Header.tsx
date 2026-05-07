import { FiArrowLeft, FiSave } from 'react-icons/fi';

interface HeaderProps {
    title: string;
    onBack: () => void;
    onSave: () => void;
}

export default function Header({ title, onBack, onSave }: HeaderProps) {
    return (
        <header style={{ backgroundColor: '#101820', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer' }}><FiArrowLeft size={20}/></button>
                <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h1>
            </div>
            <button onClick={onSave} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSave size={18}/> Сохранить
            </button>
        </header>
    );
}