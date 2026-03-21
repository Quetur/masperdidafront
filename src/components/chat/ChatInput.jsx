export const ChatInput = ({ step, handlers, data, maestros, errors }) => {
  // Aquí movés toda la lógica de los botones según el step
  // Ejemplo:
  if (step === 'inicio') {
    return (
      <div className="flex flex-col w-full gap-2">
        <button onClick={() => handlers.onStart(20)} className="...">Perdí mi mascota 😢</button>
        <button onClick={() => handlers.onStart(10)} className="...">Encontré una mascota 🐶</button>
      </div>
    );
  }
  
  if (step === 'nombre') {
    return (
      <input 
        autoFocus 
        className="..." 
        onKeyDown={(e) => e.key === 'Enter' && handlers.onNext(e.target.value, 'titulo')}
      />
    );
  }

  // ... resto de los steps
  return null;
};