import React from "react";
import { InteractiveMap } from "../map/InteractiveMap";
import PreviewCard from "./PreviewCard";

export const ChatControls = ({ step, state, handlers }) => {
  const { handleNextStep, handleStartReport, dispatch } = handlers;
  const { maestros, mascotaData, loading, phoneError, previewImage } = state;

  // Estado de carga global para el envío
  if (loading) return (
    <div className="flex flex-col items-center justify-center w-full py-8 space-y-3">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-blue-600">Publicando reporte... 🚀</p>
    </div>
  );

  const inputs = {
    // 1. Selección de Categoría
    inicio: (
      <div className="flex flex-col w-full gap-2 animate-in fade-in slide-in-from-bottom-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">¿Qué sucedió?</p>
        {maestros.cat?.map((c) => (
          <button
            key={c.id_categoria}
            onClick={() => handleStartReport(c.id_categoria)}
            className={`w-full py-4 border-2 rounded-2xl font-black transition-all active:scale-95 ${
              Number(c.id_categoria) === 20 
                ? "border-red-600 text-red-600 hover:bg-red-50" 
                : "border-green-600 text-green-600 hover:bg-green-50"
            }`}
          >
            {c.des.toUpperCase()} {Number(c.id_categoria) === 20 ? "😢" : "🏠"}
          </button>
        ))}
      </div>
    ),

    // 2. Nombre de la mascota
    nombre: (
      <div className="w-full animate-in fade-in">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">Nombre de la mascota (si no lo sabes, pone nose)</p>
        <input
          autoFocus
          className="w-full p-4 rounded-2xl border-2 border-gray-200 outline-none focus:border-blue-600 transition-colors"
          placeholder="Ej: Firulais, Manchita..."
          defaultValue={mascotaData.titulo || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim() !== "") {
              handleNextStep(e.target.value.trim(), "titulo");
            }
          }}
        />
      </div>
    ),

    // 3. Especie
    especie: (
      <div className="flex w-full gap-2 animate-in fade-in">
        {maestros.tipo?.map((t) => (
          <button
            key={t.id_tipo}
            onClick={() => handleNextStep(t.id_tipo, "id_tipo")}
            className={`flex-1 py-5 border-2 rounded-2xl font-black transition-all ${
              mascotaData.id_tipo === t.id_tipo 
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            }`}
          >
            <div className="text-2xl mb-1">{t.icono || '🐾'}</div>
            {t.des.toUpperCase()}
          </button>
        ))}
      </div>
    ),

    // 4. Raza
    raza: (
      <div className="flex flex-col w-full gap-2 animate-in fade-in">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">Seleccioná la raza</p>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {maestros.raza?.filter(r => Number(r.id_tipo) === Number(mascotaData.id_tipo)).map((r) => (
            <button
              key={r.id_raza}
              onClick={() => handleNextStep(r.id_raza, "id_raza")}
              className={`w-full py-3 px-4 border-2 rounded-xl text-left font-bold transition-all ${
                mascotaData.id_raza === r.id_raza 
                  ? "bg-blue-50 border-blue-600 text-blue-700" 
                  : "border-gray-100 text-gray-600 hover:border-blue-200"
              }`}
            >
              {r.des}
            </button>
          ))}
        </div>
      </div>
    ),

    // 5. Ubicación (Mapa)
    ubicacion: (
      <div className="flex flex-col w-full gap-3 animate-in fade-in">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2">¿Dónde fue visto por última vez?</p>
        <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner">
          <InteractiveMap
            lat={mascotaData.latitud}
            lng={mascotaData.longitud}
            onChange={(lat, lng) => dispatch({ type: "UPDATE_DATA", payload: { latitud: lat, longitud: lng } })}
          />
        </div>
        <button 
          onClick={() => handleNextStep("Confirmada", "ubicacion_confirmada")} 
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all"
        >
          CONFIRMAR UBICACIÓN ✅
        </button>
      </div>
    ),

    
    // 6. Teléfono con Formato (XX) XXXX - XXXX
    telefono: (
      <div className="w-full animate-in fade-in">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">Tu número de contacto (sin 15)</p>
        <input
          autoFocus
          type="tel"
          className={`w-full p-4 rounded-2xl border-2 outline-none transition-colors ${
            phoneError ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-600"
          }`}
          placeholder="(11) 1234 - 5678"
          // Usamos value para que sea un componente controlado
          value={state.mascotaData.celular || ""}
          onChange={(e) => {
            // 1. Solo permitimos números
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,4})(\d{0,4})/);
            
            // 2. Limitamos a 10 dígitos reales y aplicamos la máscara
            let formatted = !x[2] 
              ? x[1] 
              : `(${x[1]}) ${x[2]}${x[3] ? ' - ' + x[3] : ''}`;
            
            // 3. Actualizamos el estado inmediatamente para que se vea el cambio
            dispatch({ type: "UPDATE_DATA", payload: { celular: formatted } });
          }}
          onKeyDown={(e) => {
            // Al presionar Enter, validamos que tenga los 10 dígitos (sin contar máscara)
            const rawValue = e.target.value.replace(/\D/g, '');
            if (e.key === "Enter" && rawValue.length >= 10) {
              handleNextStep(e.target.value, "celular");
            }
          }}
        />
        {phoneError && (
          <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">
            Ingresá los 10 dígitos del área y número
          </p>
        )}
      </div>
    ),

    // 7. Nombre de contacto
    contacto_nombre: (
      <div className="w-full animate-in fade-in">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">¿A quién deben contactar?</p>
        <input
          autoFocus
          className="w-full p-4 rounded-2xl border-2 border-gray-200 outline-none focus:border-blue-600"
          placeholder="Tu nombre..."
          defaultValue={mascotaData.nombre_contacto || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim() !== "") {
              handleNextStep(e.target.value.trim(), "nombre_contacto");
            }
          }}
        />
      </div>
    ),

    // 8. Foto
    foto: (
      <div className="w-full flex flex-col gap-3 animate-in fade-in">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2">Subí una foto clara</p>
        <label className="flex flex-col items-center justify-center w-full py-8 border-4 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => dispatch({ type: "SET_PHOTO", payload: { file, preview: reader.result } });
                reader.readAsDataURL(file);
              }
            }}
          />
          <span className="text-4xl mb-2">📷</span>
          <span className="font-black text-gray-500">{previewImage ? "CAMBIAR FOTO" : "SELECCIONAR FOTO"}</span>
        </label>
        {previewImage && (
          <button 
            onClick={() => dispatch({ type: "SET_STEP", payload: "menu_confirmar" })} 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black"
          >
            CONTINUAR →
          </button>
        )}
      </div>
    ),

    // 9. Confirmación final (Aquí es donde se ajustó el scroll)
    menu_confirmar: (
      <div className="flex flex-col w-full max-h-[75vh] overflow-y-auto px-1 pb-10 custom-scrollbar animate-in zoom-in-95">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-2">Vista previa de tu publicación</p>
        
        {/* Card de visualización */}
        <PreviewCard mascotaData={mascotaData} previewImage={previewImage} maestros={maestros} />
        
        {/* Botones de acción final */}
        <div className="flex flex-col gap-3 mt-4">
          <button 
            onClick={() => handleNextStep(null, "enviar_final")} 
            className="w-full py-5 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all"
          >
            🚀 ¡PUBLICAR AHORA EN EL PORTAL!
          </button>
          
          <button 
            onClick={() => dispatch({ type: "SET_STEP", payload: "nombre" })} 
            className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600"
          >
            ⚠️ Editar algún dato
          </button>
        </div>
      </div>
    ),

    // 10. Pantalla de éxito
    finalizado: (
      <div className="text-center py-10 animate-in fade-in zoom-in">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">¡TODO LISTO!</h2>
        <p className="text-gray-500 mb-8 px-4">Tu reporte ya está circulando en la comunidad de Ituzaingó.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-10 py-4 bg-blue-100 text-blue-700 rounded-full font-black hover:bg-blue-200 transition-colors"
        >
          CREAR OTRO REPORTE
        </button>
      </div>
    )
  };

  // Retorna el paso actual o nada si no existe
  return inputs[step] || null;
};