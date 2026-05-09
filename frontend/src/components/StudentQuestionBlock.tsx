import Editor from '@monaco-editor/react';
import { FiCode } from 'react-icons/fi';

const TYPE_LABELS: { [key: string]: string } = {
    SINGLE_CHOICE: 'Один вариант ответа',
    MULTIPLE_CHOICE: 'Несколько вариантов ответа',
    TEXT: 'Развернутый ответ',
    CODE: 'Задача на программирование'
};

interface QuestionBlockProps {
    q: any;
    index: number;
    currentAnswer: any;
    onAnswerChange: (value: any) => void;
}

export default function StudentQuestionBlock({ q, index, currentAnswer, onAnswerChange }: QuestionBlockProps) {
    const uniqueId = q.id || `idx-${index}`;

    const safeCodeValue = typeof currentAnswer === 'string' ? currentAnswer : '';

    const toggleCheckbox = (optionIndex: number) => {
        const selected = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
        if (selected.includes(optionIndex)) {
            onAnswerChange(selected.filter(i => i !== optionIndex));
        } else {
            onAnswerChange([...selected, optionIndex]);
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '1.5rem',
            borderTop: '4px solid #0055A4'
        }}>
            {/* Метка типа вопроса */}
            <div style={{
                fontSize: '0.75rem',
                color: '#0055A4',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {TYPE_LABELS[q.type] || q.type}
            </div>

            {/* Текст вопроса */}
            <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 500, lineHeight: '1.5' }}>
                {index + 1}. {q.text}
            </div>

            {/* 1. Одиночный выбор (SINGLE_CHOICE) */}
            {q.type === 'SINGLE_CHOICE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(q.content?.options || []).map((opt: string, i: number) => (
                        <label
                            key={`${uniqueId}-opt-${i}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '4px', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <input
                                type="radio"
                                // КРИТИЧНО: уникальное имя группы для каждого вопроса
                                name={`radio-group-${uniqueId}`}
                                checked={currentAnswer === i}
                                onChange={() => onAnswerChange(i)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '1rem' }}>{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* 2. Множественный выбор (MULTIPLE_CHOICE) */}
            {q.type === 'MULTIPLE_CHOICE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(q.content?.options || []).map((opt: string, i: number) => (
                        <label
                            key={`${uniqueId}-opt-${i}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '4px', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <input
                                type="checkbox"
                                checked={Array.isArray(currentAnswer) && currentAnswer.includes(i)}
                                onChange={() => toggleCheckbox(i)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '1rem' }}>{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* 3. Текстовый ответ (TEXT) */}
            {q.type === 'TEXT' && (
                <textarea
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6',
                        minHeight: '120px',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        outlineColor: '#0055A4'
                    }}
                    placeholder="Введите ваш развернутый ответ здесь..."
                    value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                    onChange={(e) => onAnswerChange(e.target.value)}
                />
            )}

            {/* 4. Редактор кода (CODE) */}
            {q.type === 'CODE' && (
                <div style={{ border: '1px solid #dee2e6', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '0.75rem 1rem',
                        fontSize: '0.85rem',
                        borderBottom: '1px solid #dee2e6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#495057'
                    }}>
                        <FiCode /> Язык программирования: <strong style={{ textTransform: 'uppercase' }}>{q.content?.language || 'java'}</strong>
                    </div>
                    <Editor
                        height="300px"
                        defaultLanguage={q.content?.language?.toLowerCase() || 'java'}
                        theme="vs-dark"
                        value={safeCodeValue}
                        onChange={(val) => onAnswerChange(val || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 10, bottom: 10 }
                        }}
                    />
                </div>
            )}
        </div>
    );
}