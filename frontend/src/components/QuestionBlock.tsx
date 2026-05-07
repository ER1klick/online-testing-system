import { FiTrash2, FiMove, FiCheckCircle, FiCircle, FiPlus } from 'react-icons/fi';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TYPE_LABELS = {
    SINGLE_CHOICE: 'Один ответ',
    MULTIPLE_CHOICE: 'Несколько ответов',
    TEXT: 'Развернутый ответ',
    CODE: 'Задача на код'
};

export default function QuestionBlock({ q, qIndex, sIndex, updateQuestionText, toggleCorrect, addOption, updateOption, updateQuestionType, removeQuestion }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `q-${sIndex}-${qIndex}` });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={{ ...style, backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #0055A4', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div {...attributes} {...listeners} style={{ cursor: 'grab' }}><FiMove size={18} color="#666" /></div>
                    <select value={q.type} onChange={(e) => updateQuestionType(sIndex, qIndex, e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#0055A4' }}>
                        {Object.entries(TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                </div>
                <button onClick={() => removeQuestion(sIndex, qIndex)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18}/></button>
            </div>
            <textarea value={q.text} onChange={e => updateQuestionText(sIndex, qIndex, e.target.value)} placeholder="Текст вопроса..." rows={2} style={{ width: '100%', padding: '0.5rem', border: 'none', borderBottom: '1px solid #eee', fontSize: '1.1rem', outline: 'none' }} />

            {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (
                <div style={{ marginTop: '1rem' }}>
                    {(q.content.options || []).map((opt: string, oIndex: number) => (
                        <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <button onClick={() => toggleCorrect(sIndex, qIndex, oIndex)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: (q.content.correct || []).includes(oIndex) ? '#28a745' : '#ccc' }}>
                                {(q.content.correct || []).includes(oIndex) ? <FiCheckCircle size={20}/> : <FiCircle size={20}/>}
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