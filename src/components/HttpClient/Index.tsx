import { useEffect, useState } from "react";
import "./HttpClient.css";
import { IoMdTrash } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa6";

interface KeyValue {
    id: string;
    key: string;
    value: string;
    enabled: boolean;
}

interface SavedRequest {
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

interface ResponseData {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
const BODY_TYPES = ['none', 'json', 'form-data', 'raw', 'x-www-form-urlencoded'];

const Index = () => {
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState('');
    const [params, setParams] = useState<KeyValue[]>([]);
    const [headers, setHeaders] = useState<KeyValue[]>([]);
    const [bodyType, setBodyType] = useState('none');
    const [bodyContent, setBodyContent] = useState('');
    const [formDataFields, setFormDataFields] = useState<KeyValue[]>([]);
    const [files, setFiles] = useState<Record<string, File>>({});
    const [response, setResponse] = useState<ResponseData | null>(null);
    const [loading, setLoading] = useState(false);
    const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
    const [showSavedRequests, setShowSavedRequests] = useState(false);
    const [message, setMessage] = useState<string|null>(null);
    const [requestName, setRequestName] = useState({show: false, name: ''});

    useEffect(() => {
        const data = localStorage.getItem('httpRequests');
        if (data) {
            setSavedRequests(JSON.parse(data));
        }
    }, []);

    const saveRequests = (requests: SavedRequest[]) => {
        localStorage.setItem('httpRequests', JSON.stringify(requests));
    };

    const addKeyValue = (list: KeyValue[], setList: (list: KeyValue[]) => void) => {
        setList([...list, { id: Date.now().toString(), key: '', value: '', enabled: true }]);
    };

    const updateKeyValue = (list: KeyValue[], setList: (list: KeyValue[]) => void, id: string, field: 'key' | 'value' | 'enabled', newValue: string | boolean) => {
        setList(list.map(item => item.id === id ? { ...item, [field]: newValue } : item));
    };

    const removeKeyValue = (list: KeyValue[], setList: (list: KeyValue[]) => void, id: string) => {
        setList(list.filter(item => item.id !== id));
    };

    const handleFileChange = (fieldId: string, file: File | null) => {
        if (file) {
            setFiles({ ...files, [fieldId]: file });
        } else {
            const newFiles = { ...files };
            delete newFiles[fieldId];
            setFiles(newFiles);
        }
    };

    const buildUrl = (baseUrl: string, paramsList: KeyValue[]): string => {
        if (!baseUrl.trim()) return '';
        try {
            const urlObj = new URL(baseUrl);
            paramsList.filter(p => p.enabled && p.key).forEach(param => {
                urlObj.searchParams.append(param.key, param.value);
            });
            return urlObj.toString();
        } catch {
            const separator = baseUrl.includes('?') ? '&' : '?';
            const paramsString = paramsList
                .filter(p => p.enabled && p.key)
                .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                .join('&');
            return paramsString ? `${baseUrl}${separator}${paramsString}` : baseUrl;
        }
    };

    const buildHeaders = (headersList: KeyValue[]): HeadersInit => {
        const headersObj: Record<string, string> = {};
        headersList.filter(h => h.enabled && h.key).forEach(header => {
            headersObj[header.key] = header.value;
        });
        return headersObj;
    };

    const buildBody = (): BodyInit | undefined => {
        if (bodyType === 'none' || method === 'GET' || method === 'HEAD') {
            return undefined;
        }

        if (bodyType === 'json') {
            try {
                const parsed = JSON.parse(bodyContent || '{}');
                return JSON.stringify(parsed);
            } catch {
                return bodyContent;
            }
        }

        if (bodyType === 'form-data') {
            const formData = new FormData();
            formDataFields.filter(f => f.enabled && f.key).forEach(field => {
                if (files[field.id]) {
                    formData.append(field.key, files[field.id]);
                } else {
                    formData.append(field.key, field.value);
                }
            });
            return formData;
        }

        if (bodyType === 'x-www-form-urlencoded') {
            const formData = new URLSearchParams();
            formDataFields.filter(f => f.enabled && f.key).forEach(field => {
                formData.append(field.key, field.value);
            });
            return formData;
        }

        if (bodyType === 'raw') {
            return bodyContent;
        }

        return undefined;
    };

    const executeRequest = async () => {
        if (!url.trim()) {
            setMessage('Por favor, insira uma URL');
            return;
        }

        setLoading(true);
        setResponse(null);

        const startTime = Date.now();

        try {
            const finalUrl = buildUrl(url, params);
            const headersObj = buildHeaders(headers);
            const body = buildBody();

            if (bodyType === 'form-data' && 'Content-Type' in headersObj) {
                delete (headersObj as Record<string, string>)['Content-Type'];
            }

            const fetchOptions: RequestInit = {
                method,
                headers: Object.keys(headersObj).length > 0 ? headersObj : undefined,
                body
            };

            const fetchResponse = await fetch(finalUrl, fetchOptions);
            const responseHeaders: Record<string, string> = {};
            fetchResponse.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            let responseBody = '';
            const contentType = fetchResponse.headers.get('content-type');
            
            if (contentType?.includes('application/json')) {
                responseBody = JSON.stringify(await fetchResponse.json(), null, 2);
            } else if (contentType?.includes('text/')) {
                responseBody = await fetchResponse.text();
            } else {
                responseBody = await fetchResponse.blob().then(blob => {
                    return `[Blob - ${blob.size} bytes]`;
                });
            }

            const time = Date.now() - startTime;

            setResponse({
                status: fetchResponse.status,
                statusText: fetchResponse.statusText,
                headers: responseHeaders,
                body: responseBody,
                time
            });
        } catch (error) {
            const time = Date.now() - startTime;
            setResponse({
                status: 0,
                statusText: 'Network Error',
                headers: {},
                body: error instanceof Error ? error.message : 'Unknown error',
                time
            });
        } finally {
            setLoading(false);
        }
    };

    const saveRequest = () => {
        if (!requestName.name.trim()) {
            setMessage('Por favor, insira um nome para a requisição');
            setRequestName({show: false, name: ''});
            return;
        }

        const newRequest: SavedRequest = {
            id: Date.now().toString(),
            name: requestName.name,
            method,
            url,
            params: [...params],
            headers: [...headers],
            bodyType,
            bodyContent,
            createdAt: Date.now()
        };

        const updated = [...savedRequests, newRequest];
        setSavedRequests(updated);
        saveRequests(updated);
        setRequestName({show: false, name: ''});
    };

    const handleSaveRequestName = () => {
        setRequestName({show: !requestName.show, name: requestName.name});
    };

    const loadRequest = (request: SavedRequest) => {
        setMethod(request.method);
        setUrl(request.url);
        setParams(request.params.map(p => ({ ...p })));
        setHeaders(request.headers.map(h => ({ ...h })));
        setBodyType(request.bodyType);
        setBodyContent(request.bodyContent);
        setShowSavedRequests(false);
    };

    const deleteRequest = (id: string) => {
        const updated = savedRequests.filter(r => r.id !== id);
        setSavedRequests(updated);
        saveRequests(updated);
    };

    return (
        <div className="http-client">
            <div className="http-header">
                <h3>HTTP Client</h3>
                <div className="header-actions">
                    <button onClick={() => setShowSavedRequests(!showSavedRequests)} className="saved-btn">
                        {showSavedRequests ? 'Ocultar' : 'Salvas'} ({savedRequests.length})
                    </button>
                    <button onClick={handleSaveRequestName} className="save-btn" disabled={!url.trim()}>
                        Salvar
                    </button>
                </div>
            </div>

            {showSavedRequests && savedRequests.length > 0 && (
                <div className="saved-requests">
                    {savedRequests.map(request => (
                        <div key={request.id} className="saved-request-item">
                            <div className="saved-request-info" onClick={() => loadRequest(request)}>
                                <span className="method-badge method-badge-small">{request.method}</span>
                                <span className="saved-request-name">{request.name}</span>
                                <span className="saved-request-url">{request.url}</span>
                            </div>
                            <button onClick={() => deleteRequest(request.id)} className="delete-saved-btn">
                                <IoMdTrash size={16}/>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="http-form">
                <div className="request-line">
                    <div className="method-buttons">
                        {HTTP_METHODS.map(m => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                className={`method-btn method-${m.toLowerCase()} ${method === m ? 'active' : ''}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://api.example.com/endpoint"
                        className="url-input"
                    />
                    {requestName.show && (
                        <input 
                            type="text"
                            placeholder="Nome da requisição"
                            className="url-input"
                            value={requestName.name}
                            onChange={(e) => setRequestName({...requestName, name: e.target.value})}
                        />
                    )}
                    <div className="btn-send-request">
                        {requestName.show && (
                            <button onClick={saveRequest} className="send-btn" disabled={!requestName.name.trim()}>
                                Salvar
                            </button>
                        )}
                        <button onClick={executeRequest} className="send-btn" disabled={loading || !url.trim()}>
                            {loading ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className="message-container">
                        {message}
                    </div>
                )}

                <div className="tabs">
                    <button className="tab active">
                        Params
                    </button>
                    <button className="tab active">
                        Headers
                    </button>
                    {(method !== 'GET' && method !== 'HEAD') && (
                        <button className="tab active">
                            Body
                        </button>
                    )}
                </div>

                <div className="key-value-section">
                    <div className="section-title">Query Parameters</div>
                    {params.map(param => (
                        <KeyValueRow
                            key={param.id}
                            item={param}
                            onChange={(field, value) => updateKeyValue(params, setParams, param.id, field, value)}
                            onRemove={() => removeKeyValue(params, setParams, param.id)}
                        />
                    ))}
                    <button onClick={() => addKeyValue(params, setParams)} className="add-row-btn">
                        + Adicionar Parâmetro
                    </button>
                </div>

                <div className="key-value-section">
                    <div className="section-title">Headers</div>
                    {headers.map(header => (
                        <KeyValueRow
                            key={header.id}
                            item={header}
                            onChange={(field, value) => updateKeyValue(headers, setHeaders, header.id, field, value)}
                            onRemove={() => removeKeyValue(headers, setHeaders, header.id)}
                        />
                    ))}
                    <button onClick={() => addKeyValue(headers, setHeaders)} className="add-row-btn">
                        + Adicionar Header
                    </button>
                </div>

                {(method !== 'GET' && method !== 'HEAD') && (
                    <div className="body-section">
                        <div className="section-title">Body</div>
                        <div className="body-type-buttons">
                            {BODY_TYPES.map(type => {
                                const label = type === 'none' ? 'None' : 
                                             type === 'json' ? 'JSON' :
                                             type === 'form-data' ? 'Form Data' :
                                             type === 'x-www-form-urlencoded' ? 'Form URL' :
                                             'Raw';
                                const className = type === 'none' ? 'body-type-none' :
                                                 type === 'json' ? 'body-type-json' :
                                                 type === 'form-data' ? 'body-type-form-data' :
                                                 type === 'x-www-form-urlencoded' ? 'body-type-urlencoded' :
                                                 'body-type-raw';
                                return (
                                    <button
                                        key={type}
                                        onClick={() => setBodyType(type)}
                                        className={`body-type-btn ${className} ${bodyType === type ? 'active' : ''}`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {bodyType === 'json' && (
                            <textarea
                                value={bodyContent}
                                onChange={(e) => setBodyContent(e.target.value)}
                                placeholder='{"key": "value"}'
                                className="body-textarea"
                                rows={8}
                            />
                        )}

                        {bodyType === 'form-data' && (
                            <div className="key-value-section">
                                {formDataFields.map(field => (
                                    <KeyValueRow
                                        key={field.id}
                                        item={field}
                                        onChange={(fieldName, value) => updateKeyValue(formDataFields, setFormDataFields, field.id, fieldName, value)}
                                        onRemove={() => removeKeyValue(formDataFields, setFormDataFields, field.id)}
                                        fileField={true}
                                        file={files[field.id]}
                                        onFileChange={(file) => handleFileChange(field.id, file)}
                                    />
                                ))}
                                <button onClick={() => addKeyValue(formDataFields, setFormDataFields)} className="add-row-btn">
                                    + Adicionar Campo
                                </button>
                            </div>
                        )}

                        {bodyType === 'x-www-form-urlencoded' && (
                            <div className="key-value-section">
                                {formDataFields.map(field => (
                                    <KeyValueRow
                                        key={field.id}
                                        item={field}
                                        onChange={(fieldName, value) => updateKeyValue(formDataFields, setFormDataFields, field.id, fieldName, value)}
                                        onRemove={() => removeKeyValue(formDataFields, setFormDataFields, field.id)}
                                    />
                                ))}
                                <button onClick={() => addKeyValue(formDataFields, setFormDataFields)} className="add-row-btn">
                                    + Adicionar Campo
                                </button>
                            </div>
                        )}

                        {bodyType === 'raw' && (
                            <textarea
                                value={bodyContent}
                                onChange={(e) => setBodyContent(e.target.value)}
                                placeholder="Raw body content"
                                className="body-textarea"
                                rows={8}
                            />
                        )}
                    </div>
                )}

                {response && (
                    <div className="response-section">
                        <div className="section-title">
                            Response
                            <span className={`status-badge status-${Math.floor(response.status / 100)}xx`}>
                                {response.status} {response.statusText}
                            </span>
                            <span className="time-badge">{response.time}ms</span>
                        </div>
                        <div className="response-headers">
                            <div className="response-header-row">
                                <strong>Headers:</strong>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(response.headers, null, 2));
                                    }}
                                    className="copy-btn"
                                    title="Copiar headers"
                                >
                                    <FaRegCopy size={16}/>
                                    Copiar
                                </button>
                            </div>
                            <pre>{JSON.stringify(response.headers, null, 2)}</pre>
                        </div>
                        <div className="response-body">
                            <div className="response-header-row">
                                <strong>Body:</strong>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(response.body);
                                    }}
                                    className="copy-btn"
                                    title="Copiar body"
                                >
                                    <FaRegCopy size={16}/>
                                    Copiar
                                </button>
                            </div>
                            <pre>{response.body}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface KeyValueRowProps {
    item: KeyValue;
    onChange: (field: 'key' | 'value' | 'enabled', value: string | boolean) => void;
    onRemove: () => void;
    fileField?: boolean;
    file?: File;
    onFileChange?: (file: File | null) => void;
}

const KeyValueRow = ({ item, onChange, onRemove, fileField = false, file, onFileChange }: KeyValueRowProps) => {
    return (
        <div className="key-value-row">
            <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => onChange('enabled', e.target.checked)}
                className="enable-checkbox"
            />
            <input
                type="text"
                value={item.key}
                onChange={(e) => onChange('key', e.target.value)}
                placeholder="Key"
                className="key-input"
            />
            {fileField ? (
                <input
                    type="file"
                    onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
                    className="file-input"
                />
            ) : (
                <input
                    type="text"
                    value={item.value}
                    onChange={(e) => onChange('value', e.target.value)}
                    placeholder="Value"
                    className="value-input"
                />
            )}
            {file && (
                <span className="file-name">{file.name}</span>
            )}
            <button onClick={onRemove} className="remove-btn">
                <IoMdTrash size={16}/>
            </button>
        </div>
    );
};

export default Index;