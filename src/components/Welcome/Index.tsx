import "./Welcome.css";
import { BsPersonVideo2 } from "react-icons/bs";
import { FaListUl } from "react-icons/fa6";
import { PiShareNetworkFill } from "react-icons/pi";
import { MdSecurity } from "react-icons/md";

const Welcome = ({hasSelectd}: {hasSelectd: boolean}) => {
    return (
        <div className={`welcome-container ${hasSelectd && 'opcity-selected'}`}>
            <div className="welcome-content">
                <div className="welcome-header">
                    <h1 className="welcome-title">Bem-vindo ao Dev Space</h1>
                    <p className="welcome-subtitle">Seu ambiente de desenvolvimento personalizado</p>
                </div>

                <div className="developer-info">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <BsPersonVideo2 size={45}/>
                            </div>
                            <h3>Daily Notes</h3>
                            <p>Organize suas notas diárias com data</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaListUl size={45}/>
                            </div>
                            <h3>Todo List</h3>
                            <p>Gerencie suas tarefas e subtarefas</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <PiShareNetworkFill size={45}/>
                            </div>
                            <h3>HTTP Client</h3>
                            <p>Teste suas APIs com requisições HTTP</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <MdSecurity size={45}/>
                            </div>
                            <h3>Gerenciador de Senhas</h3>
                            <p>Armazene senhas de forma segura</p>
                        </div>
                    </div>
                </div>

                <div className="welcome-footer">
                    <div className="message">
                        <p>Nenhuma informação é armazenada pelo sistema, todos os dados ficam no localStorage</p>
                    </div>
                    <p className="footer-text">
                        Developed with <span className="heart">❤️</span> by <a className="href" href="https://miqueiasbelfort.netlify.app/">Miqueias Belfort</a>
                    </p>
                    <p className="footer-year">© {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );
};

export default Welcome;

