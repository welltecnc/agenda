

const Dia = ({ appointments, currentDate, onOpenModal, onEdit, onDelete }) => {
    // Removemos o .toDate() e assumimos que app.dateTime JÁ É um objeto Date.
  const filteredAppointments = appointments
    .filter(app => {
      // Verifica se app.dateTime é um objeto Date válido antes de usá-lo
      if (!(app.dateTime instanceof Date) || isNaN(app.dateTime)) {
        console.error("Compromisso com data inválida:", app);
        return false;
      }
      
      const appDate = app.dateTime;
      return appDate.getDate() === currentDate.getDate() &&
             appDate.getMonth() === currentDate.getMonth() &&
             appDate.getFullYear() === currentDate.getFullYear();
    })
    // A ordenação agora compara os objetos Date diretamente, sem .toDate()
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  // Formatação de data
  const formattedDate = currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Componente de Visualização Diária
  return (
    <div className="p-4 bg-white rounded-xl shadow-lg mt-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{formattedDate}</h3>
      <div className="space-y-3">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map(app => (
            <div key={app.id} className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-600 flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold text-indigo-800">{app.title}</p>
                <p className="text-sm text-gray-600">
                  {/* Removemos o .toDate() aqui também */}
                  {app.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {app.description && <p className="text-xs text-gray-500 mt-1">{app.description}</p>}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(app)}
                  className="p-1 text-indigo-600 hover:text-indigo-800 transition"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button
                  onClick={() => onDelete(app.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition"
                  title="Excluir"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhum compromisso agendado para este dia.</p>
        )}
      </div>

      <button
        onClick={onOpenModal}
        className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition duration-150"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        <span>Adicionar Compromisso</span>
      </button>
    </div>
  );
};


export default Dia;