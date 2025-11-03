import { useEffect, useState } from "react";
import "./Passwords.css";
import { FaRegCopy, FaEye, FaEyeSlash } from "react-icons/fa6";
import { LiaEdit } from "react-icons/lia";
import { IoMdTrash } from "react-icons/io";

interface Password {
    id: string;
    site: string;
    username: string;
    password: string;
    createdAt: number;
}

const getEncryptionKey = (): string => {
    let key = localStorage.getItem('passwordMasterKey');
    if (!key) {
        // Gera uma chave padrão baseada no domínio (não é ideal, mas funcional)
        key = btoa(window.location.hostname + 'dev-space-key-2024');
        localStorage.setItem('passwordMasterKey', key);
    }
    return key;
};

const encrypt = (text: string): string => {
    const key = getEncryptionKey();
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
        encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
};

const decrypt = (encrypted: string): string => {
    try {
        const key = getEncryptionKey();
        const decoded = atob(encrypted);
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return decrypted;
    } catch {
        return '';
    }
};

const Index = () => {
    const [message, setMessage] = useState<string|null>(null);
    const [passwords, setPasswords] = useState<Password[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState({ site: '', username: '', password: '' });
    const [editingPassword, setEditingPassword] = useState({ site: '', username: '', password: '' });

    useEffect(() => {
        loadPasswords();
    }, []);

    const loadPasswords = () => {
        const data = localStorage.getItem('passwords');
        if (data) {
            try {
                const encrypted = JSON.parse(data);
                const decrypted = encrypted.map((item: Omit<Password, 'password'> & { encryptedPassword: string }) => ({
                    ...item,
                    password: decrypt(item.encryptedPassword)
                }));
                setPasswords(decrypted);
            } catch {
                setPasswords([]);
            }
        }
    };

    const savePasswords = (updatedPasswords: Password[]) => {
        const encrypted = updatedPasswords.map(item => ({
            ...item,
            encryptedPassword: encrypt(item.password),
            password: undefined
        }));
        localStorage.setItem('passwords', JSON.stringify(encrypted));
    };

    const handleAddPassword = () => {
        if (
            !newPassword.site.trim() 
            || !newPassword.username.trim() 
            || !newPassword.password.trim()
        ) {
            setMessage('Por favor, preencha todos os campos');
            return;
        }

        const password: Password = {
            id: Date.now().toString(),
            site: newPassword.site.trim(),
            username: newPassword.username.trim(),
            password: newPassword.password,
            createdAt: Date.now()
        };

        const updated = [...passwords, password];
        setPasswords(updated);
        savePasswords(updated);
        setNewPassword({ site: '', username: '', password: '' });
        setMessage(null);
    };

    const handleDeletePassword = (id: string) => {
        const updated = passwords.filter(p => p.id !== id);
        setPasswords(updated);
        savePasswords(updated);
    };

    const handleStartEdit = (password: Password) => {
        setEditingId(password.id);
        setEditingPassword({ ...password });
    };

    const handleSaveEdit = () => {
        if (!editingPassword.site.trim() || !editingPassword.username.trim() || !editingPassword.password.trim()) {
            setMessage('Por favor, preencha todos os campos');
            return;
        }

        const updated = passwords.map(p =>
            p.id === editingId
                ? {
                    ...p,
                    site: editingPassword.site.trim(),
                    username: editingPassword.username.trim(),
                    password: editingPassword.password
                }
                : p
        );

        setPasswords(updated);
        savePasswords(updated);
        setEditingId(null);
        setEditingPassword({ site: '', username: '', password: '' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingPassword({ site: '', username: '', password: '' });
    };

    const toggleShowPassword = (id: string) => {
        setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const filteredPasswords = passwords.filter(p =>
        p.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="passwords-manager">
            <div className="passwords-header">
                <h3>Gerenciador de Senhas</h3>
            </div>

            <div className="passwords-form">
                <div className="form-row">
                    <input
                        type="text"
                        value={newPassword.site}
                        onChange={(e) => setNewPassword({ ...newPassword, site: e.target.value })}
                        placeholder="Nome do site/app"
                        className="password-input"
                    />
                    <input
                        type="text"
                        value={newPassword.username}
                        onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                        placeholder="Usuário/Email"
                        className="password-input"
                    />
                    <input
                        type="password"
                        value={newPassword.password}
                        onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                        placeholder="Senha"
                        className="password-input"
                    />
                    <button onClick={handleAddPassword} className="add-password-btn">
                        Adicionar
                    </button>
                </div>
                {message && (
                    <div className="message-container">
                        {message}
                    </div>
                )}
            </div>

            <div className="search-section">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar por site ou usuário..."
                    className="search-input"
                />
            </div>

            <div className="passwords-list">
                {filteredPasswords.length === 0 ? (
                    <div className="empty-state">
                        <p>{searchQuery ? 'Nenhuma senha encontrada' : 'Nenhuma senha salva ainda'}</p>
                        <span>{searchQuery ? 'Tente outra busca' : 'Adicione sua primeira senha acima'}</span>
                    </div>
                ) : (
                    filteredPasswords
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map(password => (
                            <div key={password.id} className="password-item">
                                {editingId === password.id ? (
                                    <div className="password-edit">
                                        <input
                                            type="text"
                                            value={editingPassword.site}
                                            onChange={(e) => setEditingPassword({ ...editingPassword, site: e.target.value })}
                                            className="edit-input"
                                            placeholder="Site"
                                        />
                                        <input
                                            type="text"
                                            value={editingPassword.username}
                                            onChange={(e) => setEditingPassword({ ...editingPassword, username: e.target.value })}
                                            className="edit-input"
                                            placeholder="Usuário"
                                        />
                                        <input
                                            type="text"
                                            value={editingPassword.password}
                                            onChange={(e) => setEditingPassword({ ...editingPassword, password: e.target.value })}
                                            className="edit-input"
                                            placeholder="Senha"
                                        />
                                        <div className="edit-actions">
                                            <button onClick={handleSaveEdit} className="save-edit-btn">
                                                Salvar
                                            </button>
                                            <button onClick={handleCancelEdit} className="cancel-edit-btn">
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="password-info">
                                            <div className="password-site">{password.site}</div>
                                            <div className="password-username">{password.username}</div>
                                            <div className="password-password-row">
                                                <span className="password-password">
                                                    {showPassword[password.id] ? password.password : '••••••••'}
                                                </span>
                                                <button
                                                    onClick={() => toggleShowPassword(password.id)}
                                                    className="show-password-btn"
                                                    aria-label={showPassword[password.id] ? "Ocultar senha" : "Mostrar senha"}
                                                >
                                                    {showPassword[password.id] ? (
                                                        <FaEyeSlash size={16}/>
                                                    ) : (
                                                        <FaEye size={16}/>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="password-actions">
                                            <button
                                                onClick={() => copyToClipboard(password.username)}
                                                className="action-btn copy-btn"
                                                title="Copiar usuário"
                                            >
                                                <FaRegCopy size={16}/>
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(password.password)}
                                                className="action-btn copy-btn"
                                                title="Copiar senha"
                                            >
                                                <FaRegCopy size={16}/>
                                            </button>
                                            <button
                                                onClick={() => handleStartEdit(password)}
                                                className="action-btn edit-btn"
                                                title="Editar"
                                            >
                                                <LiaEdit size={16}/>
                                            </button>
                                            <button
                                                onClick={() => handleDeletePassword(password.id)}
                                                className="action-btn delete-btn"
                                                title="Deletar"
                                            >
                                                <IoMdTrash size={16}/>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};

export default Index;