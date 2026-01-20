import { useState, useEffect, useMemo } from 'react';


const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const AgendaModal = ({ isOpen, onClose, onSave, appointmentToEdit }) => {
     const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (appointmentToEdit) {
      setTitle(appointmentToEdit.title || '');
      // Formata a data e hora para os inputs HTML
      const dateTime = new Date(appointmentToEdit.dateTime.toDate());
      setDate(dateTime.toISOString().split('T')[0]);
      setTime(dateTime.toTimeString().slice(0, 5));
      setDescription(appointmentToEdit.description || '');
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setDescription('');
    }
  }, [appointmentToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    const fullDateTime = new Date(`${date}T${time}:00`);

    const newAppointment = {
      title,
      dateTime: fullDateTime,
      description,
      // Se estiver editando, mantém o ID
      id: appointmentToEdit ? appointmentToEdit.id : undefined,
    };
    onSave(newAppointment);
    onClose();
  };

  if (!isOpen) return null;

  // Componente para o Modal de Adição/Edição de Compromisso

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-transform scale-100">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">{appointmentToEdit ? 'Editar Compromisso' : 'Novo Compromisso'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título do Compromisso (Obrigatório)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <textarea
                placeholder="Detalhes (Opcional)"
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
              >
                {appointmentToEdit ? 'Salvar Alterações' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default AgendaModal
