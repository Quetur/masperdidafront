import React, { useRef, useEffect } from 'react';
import { useMascotaForm } from './hooks/useMascotaForm';
import { ChatControls } from './components/chat/ChatControls';
import { ChatMessage } from './components/chat/ChatMessage';

function App() {
  const chatEndRef = useRef(null);
  const form = useMascotaForm();

  // Scroll automático al último mensaje cada vez que cambia el historial
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [form.messages]);

  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-gray-100 font-sans">

      {/* CONTENEDOR PRINCIPAL: Altura adaptativa al contenido */}
      <div className="w-full max-w-[420px] h-fit max-h-[92vh] bg-white border border-gray-200 rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative">

        {/* Header con el Botón de Cierre "Aro Negro" */}
        <div className="pt-12 pb-6 px-4 text-white text-center bg-blue-600 shadow-md shrink-0 relative">

          {/* BOTÓN CERRAR: Con Aro Negro Grueso y 'X' Blanca */}
          <button
            onClick={form.handleCerrarAsistente}
            // CAMBIOS CLAVE: border-4, border-black, w-11 h-11
            className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center bg-red-600 hover:bg-red-700 active:scale-90 rounded-full shadow-2xl transition-all group z-10 border-4 border-black"
            title="Cerrar asistente"
          >
            <span className="text-white text-2xl font-black leading-none group-hover:scale-110 transition-transform">
              ✕
            </span>
          </button>

          <h2 className="font-black uppercase tracking-tighter text-2xl flex items-center justify-center gap-2">
            Asistente de Mascotas <span className="text-3xl">🐾</span>
          </h2>

        </div>

        {/* CUERPO DEL CHAT: Solo esta parte tiene scroll interno */}
        <div className="overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide min-h-0">
          {form.messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}

          {/* Feedback de éxito al finalizar el reporte */}
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

        {/* FOOTER: Controles dinámicos según el paso actual */}
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