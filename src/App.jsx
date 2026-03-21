import React, { useRef, useEffect } from 'react';
import { useMascotaForm } from './hooks/useMascotaForm';
import { ChatControls } from './components/chat/ChatControls';
import { ChatMessage } from './components/chat/ChatMessage';

function App() {
  const chatEndRef = useRef(null);
  const form = useMascotaForm();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [form.messages]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-gray-100 font-sans">
      {/* Contenedor tipo Celular/Mockup */}
      <div className="w-full max-w-[420px] h-[750px] bg-white border border-gray-200 rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="pt-10 pb-4 px-4 text-white text-center font-bold bg-blue-600 uppercase tracking-widest text-[10px]">
          Asistente de Mascotas 🐾
        </div>

        {/* Cuerpo del Chat */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 scrollbar-hide">
          {form.messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}
          
          {/* Espaciador final cuando termina */}
          {form.step === 'finalizado' && (
            <div className="flex flex-col items-center justify-center py-8 animate-bounce">
               <div className="bg-green-100 text-green-600 p-4 rounded-full mb-2">
                  <i className="fas fa-check-circle text-4xl"></i>
               </div>
               <p className="text-sm font-bold text-gray-500">¡Publicación exitosa!</p>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Footer / Controles */}
        <div className="p-6 bg-white border-t border-gray-100 min-h-[160px] flex items-center justify-center">
          {form.step === 'finalizado' ? (
            /* BOTÓN DE CIERRE FINAL */
            <button
              onClick={form.handleCerrarAsistente}
              className="w-full bg-gray-800 hover:bg-black text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
            >
              <i className="fas fa-times-circle"></i>
              Cerrar y volver al portal
            </button>
          ) : (
            /* CONTROLES NORMALES DEL CHAT */
            <ChatControls 
              step={form.step} 
              state={form} 
              handlers={form} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;