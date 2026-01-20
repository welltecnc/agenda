import { useState, useEffect, useCallback } from 'react';
import AgendaModal from './AgendaModal'; // Presume que AgendaModal está no mesmo diretório
import Dia from  './Dia'
import Mes from  './Mes'

// --- Variáveis de Configuração ---
const API_BASE_URL = 'http://localhost:3000/api/appointments';
const MOCK_USER_ID = '123'; // ID do usuário simulado para o backend

// --- Componente Principal ---

const AgendaPrincipal = () => {
  // Removendo isAuthReady e db/auth states
  const [user, setUser] = useState({ uid: MOCK_USER_ID }); // Simula o usuário logado
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [view, setView] = useState('daily'); // Começa em diário para testar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Fetch de Dados (GET) ---
  const fetchAppointments = useCallback(async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar compromissos do servidor.');
      }
      
      const data = await response.json();
      
      // Converte a string ISO (date_time) para um objeto Date
      const formattedAppointments = data.map(apt => ({
        ...apt,
        dateTime: new Date(apt.date_time), 
      }));
      
      setAppointments(formattedAppointments);
      setError(null);
    } catch (e) {
      console.error("Erro ao carregar compromissos:", e);
      setError(`Erro ao carregar dados. Verifique a API: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);


  // --- 2. useEffect para Carregar Dados ---
  useEffect(() => {
    // Remove dependência de 'isAuthReady' e 'user' do Firebase
    if (user?.uid) {
      fetchAppointments(user.uid);
    }
  }, [user, fetchAppointments]);


  // --- 3. Função Salvar/Editar (POST/PUT) ---
  const handleSaveAppointment = async (appointmentData) => {
    const isEditing = appointmentData.id !== undefined;
    const url = isEditing 
      ? `${API_BASE_URL}/${appointmentData.id}` 
      : API_BASE_URL;
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...appointmentData, 
          userId: MOCK_USER_ID, 
          dateTime: appointmentData.dateTime.toISOString() 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Status: ${response.status}. Mensagem: ${errorData.message}`);
      }

      await fetchAppointments(MOCK_USER_ID); 
      setIsModalOpen(false); 
      setError(null);

    } catch (e) {
      console.error(`Erro ao ${isEditing ? 'editar' : 'adicionar'} compromisso:`, e);
      setError(`Falha na operação: ${e.message}`);
    }
  };


  // --- 4. Função Excluir (DELETE) ---
  const handleDeleteAppointment = async (id) => {
    // Remove lógica de 'db' e 'user' do Firebase
    if (!window.confirm('Tem certeza de que deseja excluir este compromisso?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao excluir o compromisso no servidor.');
      }
      
      await fetchAppointments(MOCK_USER_ID);
      setError(null);
      
    } catch (e) {
      console.error("Erro ao excluir compromisso:", e);
      setError(`Falha ao excluir: ${e.message}`);
    }
  };


  // --- Funções UI (Abertura de Modal) ---

  const openAddModal = () => {
    setAppointmentToEdit(null); // Para criar novo
    setIsModalOpen(true);
  };

  const openEditModal = (appointment) => {
    setAppointmentToEdit(appointment);
    setIsModalOpen(true);
  };

  const handleSignOut = () => {
    // Simulação de logout REST (limpar token, etc.)
    setUser(null); 
    setAppointments([]);
    alert('Logout simulado. Em um cenário real, você limparia o token de sessão/JWT.');
  };

  // --- Renderização ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl font-semibold text-indigo-600">Carregando Agenda...</div>
      </div>
    );
  }

  // Ajusta a obtenção do ID para a simulação
  const currentUserId = user ? user.uid : 'Não Autenticado';

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
      {/* Header e Status */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-lg mb-4">
        <div className='mb-2 sm:mb-0'>
          <h1 className="text-3xl font-extrabold text-indigo-700">Agenda Pro</h1>
          <p className="text-sm text-gray-500 mt-1">
            Usuário (ID): <span className="font-mono text-xs break-all text-gray-700">{currentUserId}</span>
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-150 text-sm"
        >
          Sair / Trocar Usuário
        </button>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
          <p className="font-bold">Erro de Aplicação:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Botões de Visualização */}
      <div className="flex justify-center mb-4 space-x-2">
        <button
          onClick={() => setView('monthly')}
          className={`px-4 py-2 font-semibold rounded-full transition ${view === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}
        >
          Visualização Mensal
        </button>
        <button
          onClick={() => setView('daily')}
          className={`px-4 py-2 font-semibold rounded-full transition ${view === 'daily' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}
        >
          Visualização Diária
        </button>
      </div>

      {/* Conteúdo Principal */}
      <main>
        {view === 'monthly' ? (
          <Mes
            currentDate={currentDate}
            appointments={appointments}
            setCurrentDate={setCurrentDate}
            setView={setView}
          />
        ) : (
          <Dia
            appointments={appointments}
            currentDate={currentDate}
            onOpenModal={openAddModal}
            onEdit={openEditModal}
            onDelete={handleDeleteAppointment}
          />
        )}
      </main>

      {/* Modal */}
      <AgendaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
        appointmentToEdit={appointmentToEdit}
      />
    </div>
  );
};

export default AgendaPrincipal;