import { useEffect, useState } from "react";
import "./DailyNotes.css";
import { IoMdTrash } from "react-icons/io";
import { LiaEdit } from "react-icons/lia";

interface Note {
    id: string;
    date: string;
    content: string;
    createdAt: number;
};

const Index = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [edit, setEdit] = useState<string|null>(null);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const formatDate = (dateString: string): string => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleAddNote = () => {
        if (newNoteContent.trim() === "") return;

        const newNote: Note = {
            id: Date.now().toString(),
            date: selectedDate,
            content: newNoteContent.trim(),
            createdAt: Date.now()
        };

        if(edit){
            const filtedNotes = notes.filter(item => item.id !== edit);
            setNotes([...filtedNotes, newNote]);
            localStorage.setItem('dailyNotes', JSON.stringify([...filtedNotes, newNote]));
            setEdit(null);
            setNewNoteContent("");
            return;
        }

        setNotes([...notes, newNote]);
        localStorage.setItem('dailyNotes', JSON.stringify([...notes, newNote]));
        setNewNoteContent("");
    };

    const handleDeleteNote = (id: string) => {
        setNotes(notes.filter(note => note.id !== id));
        localStorage.setItem('dailyNotes', JSON.stringify(notes.filter(note => note.id !== id)));
    };

    const notesByDate = notes.reduce((acc, note) => {
        if (!acc[note.date]) {
            acc[note.date] = [];
        }
        acc[note.date].push(note);
        return acc;
    }, {} as Record<string, Note[]>);

    const sortedDates = Object.keys(notesByDate).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    const handleEditNote = (id: string) => {
        const filteredNote = notes.filter(note => note.id == id)[0];
        setEdit(id);
        setNewNoteContent(filteredNote.content);
        setSelectedDate(filteredNote.date);
    }

    const getDate = () => {
        const data = localStorage.getItem('dailyNotes');
        if (data) {
            setNotes(JSON.parse(data));
        }
    };

    useEffect(() => {
        getDate();
    }, []);

    return (
        <div className="daily-notes">
            <div className="notes-header">
                <h3>Notas Diárias</h3>
            </div>

            <div className="notes-form">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="date-input"
                />
                <div className="input-group">
                    <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Escreva uma nota..."
                        className="note-input"
                        rows={5}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                handleAddNote();
                            }
                        }}
                    />
                    <button
                        onClick={handleAddNote}
                        className="add-note-btn"
                        disabled={newNoteContent.trim() === ""}
                    >
                        {edit ? 'Editar' : 'Adicionar'}
                    </button>
                </div>
            </div>

            <div className="notes-list">
                {sortedDates.length === 0 ? (
                    <div className="empty-state">
                        <p>Nenhuma nota ainda</p>
                        <span>Crie sua primeira nota acima</span>
                    </div>
                ) : (
                    sortedDates.sort().map(date => (
                        <div key={date} className="date-group">
                            <div className="date-header">
                                <span className="date-label">{formatDate(date)}</span>
                                <span className="date-badge">{notesByDate[date].length}</span>
                            </div>
                            <div className="notes-container">
                                {notesByDate[date]
                                    .sort((a, b) => b.createdAt - a.createdAt)
                                    .map(note => (
                                        <div key={note.id} className="note-item">
                                            <p className="note-content">{note.content}</p>
                                            <button
                                                onClick={() => handleEditNote(note.id)}
                                                className="edit-note-btn"
                                                aria-label="Editar nota"
                                            >
                                                <LiaEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="delete-note-btn"
                                                aria-label="Deletar nota"
                                            >
                                                <IoMdTrash size={16} />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Index;