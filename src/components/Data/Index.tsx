import React, { useEffect, useState } from "react";
import "./Data.css";
import { FaRegCopy } from "react-icons/fa6";

interface Note {
  id: string;
  date: string;
  content: string;
  createdAt: number;
}

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

interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface HttpRequester {
  id: string;
  name: string;
  method: string;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  bodyType: string;
  bodyContent: string;
  createdAt: number;
}

interface PasswordItem {
  id: string;
  site: string;
  username: string;
  password: string;
  createdAt: number;
}

interface AllData {
  dailyNotes: Note[];
  todos: Todo[];
  httpRequests: HttpRequester[];
  passwords: PasswordItem[];
}

const Data: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [requesters, setRequesters] = useState<HttpRequester[]>([]);
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [importData, setImportData] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const getParsedData = <T,>(key: string): T[] => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T[]) : [];
    } catch (error) {
      console.error(`Erro ao ler ${key} do localStorage:`, error);
      return [];
    }
  };

  const getAllData = () => {
    setNotes(getParsedData<Note>("dailyNotes"));
    setTodos(getParsedData<Todo>("todos"));
    setRequesters(getParsedData<HttpRequester>("httpRequests"));
    setPasswords(getParsedData<PasswordItem>("passwords"));
  };

  useEffect(() => {
    getAllData();
  }, []);

  const exportData = () => {
    const allData: AllData = {
      dailyNotes: notes,
      todos: todos,
      httpRequests: requesters,
      passwords: passwords,
    };

    const jsonString = JSON.stringify(allData, null, 2);
    setImportData(jsonString);
  };

  const importDataHandler = () => {
    try {
      const parsedData: AllData = JSON.parse(importData);

      if (!parsedData.dailyNotes || !parsedData.todos || !parsedData.httpRequests || !parsedData.passwords) {
        throw new Error("Formato de dados inválido");
      }

      localStorage.setItem("dailyNotes", JSON.stringify(parsedData.dailyNotes));
      localStorage.setItem("todos", JSON.stringify(parsedData.todos));
      localStorage.setItem("httpRequests", JSON.stringify(parsedData.httpRequests));
      localStorage.setItem("passwords", JSON.stringify(parsedData.passwords));

      getAllData();
      setImportData("");
      showMessage("Dados importados com sucesso!", "success");
    } catch (e) {
      console.error(e);
      showMessage("Erro ao importar dados. Verifique o formato JSON.", "error");
    }
  };

  const clearData = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados?")) {
      localStorage.removeItem("dailyNotes");
      localStorage.removeItem("todos");
      localStorage.removeItem("httpRequests");
      localStorage.removeItem("passwords");
      getAllData();
      setImportData("");
      showMessage("Todos os dados foram limpos!", "success");
    }
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="container">
      <div className="data-all-card">
        <div className="data-header">
          <h3>Dados Salvos</h3>
        </div>

        {message && (
          <div className={`data-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="data-summary">
          <div className="data-stats-grid">
            <div className="data-stat-card blue">
              <div className="stat-number">{notes.length}</div>
              <div className="stat-label">Notas Diárias</div>
            </div>
            <div className="data-stat-card green">
              <div className="stat-number">{todos.length}</div>
              <div className="stat-label">Todos</div>
            </div>
            <div className="data-stat-card yellow">
              <div className="stat-number">{requesters.length}</div>
              <div className="stat-label">Requisições HTTP</div>
            </div>
            <div className="data-stat-card red">
              <div className="stat-number">{passwords.length}</div>
              <div className="stat-label">Senhas</div>
            </div>
          </div>
        </div>

        <div className="data-actions">
          <button onClick={exportData} className="btn btn-primary">Ver Dados</button>
          <button onClick={clearData} className="btn btn-danger">Limpar</button>
        </div>

        <div className="data-import-section">
          <div className="data-import-title">
            <label className="data-label">Importar Dados (Cole o JSON abaixo):</label>
            <button
              onClick={() => navigator.clipboard.writeText(importData)}
              className="copy-btn"
              title="Copiar dados"
            >
              <FaRegCopy size={16} /> Copiar
            </button>
          </div>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder='{"dailyNotes": [], "todos": [], "httpRequests": [], "passwords": []}'
            className="data-textarea"
          />
          <button
            onClick={importDataHandler}
            disabled={!importData.trim()}
            className="btn btn-success"
          >Realizar Modificações</button>
        </div>
      </div>
    </div>
  );
};

export default Data;