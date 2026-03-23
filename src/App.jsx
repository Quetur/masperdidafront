import React, { useRef, useEffect } from 'react';
import { useMascotaForm } from './hooks/useMascotaForm';
import { ChatControls } from './components/chat/ChatControls';
import { ChatMessage } from './components/chat/ChatMessage';

function App() {
  const chatEndRef = useRef(null);
  const form = useMascotaForm();

  // Scroll automático al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [form.messages]);

  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-gray-100 font-sans">

      {/* CONTENEDOR PRINCIPAL:
          - h-fit: Ajusta la altura al contenido exacto.
          - max-h-[90vh]: Límite para que no se salga de la pantalla en móviles.
          - flex-col: Organiza Header, Cuerpo y Footer.
      */}
      <div className="w-full max-w-[420px] h-fit max-h-[92vh] bg-white border border-gray-200 rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative">

        {/* HEADER: Altura fija mínima para que no se encoja */}
        {/* Header Optimizado */}
        <div className="pt-10 pb-6 px-4 text-white text-center bg-blue-600 shadow-md shrink-0">
          <h2 className="font-black uppercase tracking-tighter text-xl flex items-center justify-center gap-2">
            Asistente de Mascotas <span className="text-2xl">🐾</span>
          </h2>
        </div>
        {/* CUERPO DEL CHAT: 
            - overflow-y-auto: Solo este sector tiene scroll si los mensajes superan el max-h.
            - min-h-0: Importante para que flexbox entienda que puede achicarse.
        */}
        <div className="overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide min-h-0">
          {form.messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}

          {/* Feedback de éxito */}
          {form.step === 'finalizado' && (
            <div className="flex flex-col items-center justify-center py-6 animate-pulse">
              <div className="bg-green-100 text-green-600 p-4 rounded-full mb-2">
                <i className="fas fa-check-circle text-4xl"></i>
              </div>
              <p className="text-sm font-bold text-gray-500">¡Publicación exitosa!</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* FOOTER / CONTROLES: 
            - shrink-0: Mantiene su tamaño siempre.
            - bg-white: Fondo sólido para que no se transparente el chat.
        */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0 flex items-center justify-center">
          {form.step === 'finalizado' ? (
            <button
              onClick={form.handleCerrarAsistente}
              className="w-full bg-gray-800 hover:bg-black text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
            >
              <i className="fas fa-times-circle"></i>
              Cerrar y volver al portal
            </button>
          ) : (
            <div className="w-full">
              <ChatControls
                step={form.step}
                state={form}
                handlers={form}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;