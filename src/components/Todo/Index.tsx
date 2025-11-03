import { useEffect, useState } from "react";
import "./Todo.css";
import { LiaEdit } from "react-icons/lia";
import { IoMdTrash } from "react-icons/io";
import { IoCheckmarkOutline, IoCloseOutline, IoChevronUp, IoAdd } from "react-icons/io5";

interface SubTodo {
    id: string;
    text: string;
    completed: boolean;
}

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    subTodos: SubTodo[];
    createdAt: number;
}

const Index = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoText, setNewTodoText] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");
    const [expandedTodo, setExpandedTodo] = useState<string | null>(null);
    const [newSubTodoText, setNewSubTodoText] = useState<Record<string, string>>({});

    const loadTodos = () => {
        const data = localStorage.getItem('todos');
        if (data) {
            setTodos(JSON.parse(data));
        }
    };

    const saveTodos = (updatedTodos: Todo[]) => {
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
    };

    useEffect(() => {
        loadTodos();
    }, []);

    const handleAddTodo = () => {
        if (newTodoText.trim() === "") return;

        const newTodo: Todo = {
            id: Date.now().toString(),
            text: newTodoText.trim(),
            completed: false,
            subTodos: [],
            createdAt: Date.now()
        };

        const updatedTodos = [...todos, newTodo];
        setTodos(updatedTodos);
        saveTodos(updatedTodos);
        setNewTodoText("");
    };

    const handleDeleteTodo = (id: string) => {
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
        saveTodos(updatedTodos);
    };

    const handleToggleComplete = (id: string) => {
        const updatedTodos = todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        setTodos(updatedTodos);
        saveTodos(updatedTodos);
    };

    const handleStartEdit = (todo: Todo) => {
        setEditingId(todo.id);
        setEditingText(todo.text);
    };

    const handleSaveEdit = (id: string) => {
        if (editingText.trim() === "") {
            setEditingId(null);
            return;
        }

        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, text: editingText.trim() } : todo
        );
        setTodos(updatedTodos);
        saveTodos(updatedTodos);
        setEditingId(null);
        setEditingText("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingText("");
    };

    const handleAddSubTodo = (todoId: string) => {
        const text = newSubTodoText[todoId]?.trim() || "";
        if (text === "") return;

        const updatedTodos = todos.map(todo => {
            if (todo.id === todoId) {
                const newSubTodo: SubTodo = {
                    id: Date.now().toString(),
                    text: text,
                    completed: false
                };
                return { ...todo, subTodos: [...todo.subTodos, newSubTodo] };
            }
            return todo;
        });

        setTodos(updatedTodos);
        saveTodos(updatedTodos);
        setNewSubTodoText({ ...newSubTodoText, [todoId]: "" });
    };

    const handleDeleteSubTodo = (todoId: string, subTodoId: string) => {
        const updatedTodos = todos.map(todo => {
            if (todo.id === todoId) {
                return {
                    ...todo,
                    subTodos: todo.subTodos.filter(sub => sub.id !== subTodoId)
                };
            }
            return todo;
        });

        setTodos(updatedTodos);
        saveTodos(updatedTodos);
    };

    const handleToggleSubTodoComplete = (todoId: string, subTodoId: string) => {
        const updatedTodos = todos.map(todo => {
            if (todo.id === todoId) {
                return {
                    ...todo,
                    subTodos: todo.subTodos.map(sub =>
                        sub.id === subTodoId ? { ...sub, completed: !sub.completed } : sub
                    )
                };
            }
            return todo;
        });

        setTodos(updatedTodos);
        saveTodos(updatedTodos);
    };

    const handleEditSubTodo = (todoId: string, subTodoId: string, newText: string) => {
        if (newText.trim() === "") return;

        const updatedTodos = todos.map(todo => {
            if (todo.id === todoId) {
                return {
                    ...todo,
                    subTodos: todo.subTodos.map(sub =>
                        sub.id === subTodoId ? { ...sub, text: newText.trim() } : sub
                    )
                };
            }
            return todo;
        });

        setTodos(updatedTodos);
        saveTodos(updatedTodos);
    };

    const completedCount = todos.filter(todo => todo.completed).length;
    const totalCount = todos.length;

    return (
        <div className="todo-list">
            <div className="todo-header">
                <h3>Todo List</h3>
                {totalCount > 0 && (
                    <div className="todo-stats">
                        <span>{completedCount} / {totalCount} completas</span>
                    </div>
                )}
            </div>

            <div className="todo-form">
                <div className="input-group">
                    <input
                        type="text"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        placeholder="Adicionar nova tarefa..."
                        className="todo-input"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddTodo();
                            }
                        }}
                    />
                    <button
                        onClick={handleAddTodo}
                        className="add-todo-btn"
                        disabled={newTodoText.trim() === ""}
                    >
                        Adicionar
                    </button>
                </div>
            </div>

            <div className="todos-container">
                {todos.length === 0 ? (
                    <div className="empty-state">
                        <p>Nenhuma tarefa ainda</p>
                        <span>Crie sua primeira tarefa acima</span>
                    </div>
                ) : (
                    todos
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map(todo => (
                            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                                <div className="todo-main">
                                    <div className="todo-content">
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => handleToggleComplete(todo.id)}
                                            className="todo-checkbox"
                                        />
                                        {editingId === todo.id ? (
                                            <input
                                                type="text"
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSaveEdit(todo.id);
                                                    } else if (e.key === 'Escape') {
                                                        handleCancelEdit();
                                                    }
                                                }}
                                                className="todo-edit-input"
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className="todo-text"
                                                onDoubleClick={() => handleStartEdit(todo)}
                                            >
                                                {todo.text}
                                            </span>
                                        )}
                                    </div>
                                    <div className="todo-actions">
                                        {editingId === todo.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveEdit(todo.id)}
                                                    className="action-btn save-btn"
                                                    aria-label="Salvar"
                                                >
                                                    <IoCheckmarkOutline size={16}/>
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="action-btn cancel-btn"
                                                    aria-label="Cancelar"
                                                >
                                                    <IoCloseOutline size={16}/>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setExpandedTodo(expandedTodo === todo.id ? null : todo.id)}
                                                    className={`action-btn expand-btn ${expandedTodo === todo.id ? 'expanded' : ''}`}
                                                    aria-label="Expandir subtarefas"
                                                >
                                                    <IoChevronUp size={16}/>
                                                </button>
                                                <button
                                                    onClick={() => handleStartEdit(todo)}
                                                    className="action-btn edit-btn"
                                                    aria-label="Editar"
                                                >
                                                    <LiaEdit size={16}/>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTodo(todo.id)}
                                                    className="action-btn delete-btn"
                                                    aria-label="Deletar"
                                                >
                                                    <IoMdTrash size={16}/>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {expandedTodo === todo.id && (
                                    <div className="subtodos-section">
                                        <div className="subtodos-list">
                                            {todo.subTodos.map(subTodo => (
                                                <SubTodoItem
                                                    key={subTodo.id}
                                                    subTodo={subTodo}
                                                    todoId={todo.id}
                                                    onToggleComplete={handleToggleSubTodoComplete}
                                                    onDelete={handleDeleteSubTodo}
                                                    onEdit={handleEditSubTodo}
                                                />
                                            ))}
                                        </div>
                                        <div className="add-subtodo-form">
                                            <input
                                                type="text"
                                                value={newSubTodoText[todo.id] || ""}
                                                onChange={(e) => setNewSubTodoText({ ...newSubTodoText, [todo.id]: e.target.value })}
                                                placeholder="Adicionar subtarefa..."
                                                className="subtodo-input"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddSubTodo(todo.id);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => handleAddSubTodo(todo.id)}
                                                className="add-subtodo-btn"
                                                disabled={!newSubTodoText[todo.id]?.trim()}
                                            >
                                                <IoAdd size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};

interface SubTodoItemProps {
    subTodo: SubTodo;
    todoId: string;
    onToggleComplete: (todoId: string, subTodoId: string) => void;
    onDelete: (todoId: string, subTodoId: string) => void;
    onEdit: (todoId: string, subTodoId: string, newText: string) => void;
}

const SubTodoItem = ({ subTodo, todoId, onToggleComplete, onDelete, onEdit }: SubTodoItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(subTodo.text);

    const handleSave = () => {
        if (editText.trim() !== "") {
            onEdit(todoId, subTodo.id, editText);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditText(subTodo.text);
        setIsEditing(false);
    };

    return (
        <div className={`subtodo-item ${subTodo.completed ? 'completed' : ''}`}>
            <input
                type="checkbox"
                checked={subTodo.completed}
                onChange={() => onToggleComplete(todoId, subTodo.id)}
                className="subtodo-checkbox"
            />
            {isEditing ? (
                <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                    className="subtodo-edit-input"
                    autoFocus
                />
            ) : (
                <span
                    className="subtodo-text"
                    onDoubleClick={() => setIsEditing(true)}
                >
                    {subTodo.text}
                </span>
            )}
            <div className="subtodo-actions">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="action-btn save-btn" aria-label="Salvar">
                            <IoCheckmarkOutline size={16}/> 
                        </button>
                        <button onClick={handleCancel} className="action-btn cancel-btn" aria-label="Cancelar">
                            <IoCloseOutline size={16}/>
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} className="action-btn edit-btn" aria-label="Editar">
                            <LiaEdit size={16}/>
                        </button>
                        <button onClick={() => onDelete(todoId, subTodo.id)} className="action-btn delete-btn" aria-label="Deletar">
                            <IoMdTrash size={16}/>  
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Index;
