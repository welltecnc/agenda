import { useMemo } from 'react';


const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];


const Mes = ({ currentDate, appointments, setCurrentDate, setView }) => {
  // --- 1. Lógica de Calendário (Sem Alteração) ---
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  // Ajusta para começar na Segunda-feira (1) em vez de Domingo (0)
  // Se for Domingo (0), subtrai 6. Se for Terça (2), subtrai 1.
  startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1)); 

  const today = new Date();

  const daysInMonth = [];
  let day = new Date(startDate);
  // Cria os dias do calendário (geralmente 42 células)
  while (day.getMonth() !== endOfMonth.getMonth() || day.getDate() <= endOfMonth.getDate()) {
    daysInMonth.push(new Date(day));
    day.setDate(day.getDate() + 1);
    if (daysInMonth.length > 42) break; // Limite de 6 semanas
  }

  // --- 2. Mapear compromissos para contagem por dia (AJUSTADO) ---
  const appointmentsByDay = useMemo(() => {
    const map = new Map();
    appointments.forEach(app => {
      // Remove .toDate(). Usa app.dateTime, que é um objeto Date.
      // toLocaleDateString('en-CA') => 'YYYY-MM-DD' (útil para chaves de mapa)
      if (app.dateTime instanceof Date && !isNaN(app.dateTime)) {
        const dateKey = app.dateTime.toLocaleDateString('en-CA'); 
        map.set(dateKey, (map.get(dateKey) || 0) + 1);
      }
    });
    return map;
  }, [appointments]);

  // --- 3. Funções de Navegação (Sem Alteração) ---

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dayDate) => {
    setCurrentDate(dayDate);
    setView('daily');
  };


  // --- 4. Renderização ---

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      {/* Navegação do Mês */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPrevMonth} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition" title="Mês Anterior">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={goToNextMonth} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition" title="Próximo Mês">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Títulos dos Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 border-b pb-2">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="text-xs sm:text-sm">{day}</div>
        ))}
      </div>

      {/* Dias do Mês */}
      <div className="grid grid-cols-7 gap-1 mt-2">
        {daysInMonth.map((dayDate, index) => {
          const isCurrentMonth = dayDate.getMonth() === currentDate.getMonth();
          // Compara strings de data (sem hora)
          const isToday = dayDate.toDateString() === today.toDateString(); 
          const isSelected = dayDate.toDateString() === currentDate.toDateString();
          const dateKey = dayDate.toLocaleDateString('en-CA');
          const appointmentCount = appointmentsByDay.get(dateKey) || 0;

          let dayClasses = `p-1 sm:p-2 aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition cursor-pointer relative group h-12 w-full`;

          if (!isCurrentMonth) {
            dayClasses += ' text-gray-400 bg-gray-50';
          } else {
            dayClasses += ' text-gray-800 hover:bg-indigo-100';
          }

          if (isToday) {
            dayClasses += ' ring-2 ring-indigo-500 ring-offset-1 font-bold';
          }

          if (isSelected) {
            dayClasses += ' bg-indigo-600 text-white shadow-lg hover:bg-indigo-700';
          }

          return (
            <div
              key={index}
              className={dayClasses}
              onClick={() => handleDayClick(dayDate)}
            >
              <span className={`font-semibold ${isSelected ? 'text-white' : 'text-current'}`}>{dayDate.getDate()}</span>
              {appointmentCount > 0 && (
                <span className={`text-xs mt-1 w-4 h-4 flex items-center justify-center rounded-full ${isSelected ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white'}`}>
                  {appointmentCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default Mes;