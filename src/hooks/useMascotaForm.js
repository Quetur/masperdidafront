import { useReducer, useCallback, useEffect } from 'react';

// --- DETECCIÓN DINÁMICA DEL HOST ---
const currentHost = window.location.hostname;
const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("api_base_url :", API_BASE_URL)
const initialState = {
  step: 'inicio',
  maestros: { cat: [], tipo: [], raza: [] },
  mascotaData: { 
    id_categoria: 20, 
    titulo: '', 
    id_tipo: 10, 
    id_raza: null, 
    sexo: 'Macho', 
    celular: '', 
    latitud: -34.661, 
    longitud: -58.662, 
    nombre_contacto: '', 
    foto2: null 
  },
  messages: [
    { id: 1, text: "¡Hola! Soy tu asistente de Mascota Perdida 🐾", sender: 'bot' },
    { id: 2, text: "¿Qué sucedió? ¿Perdiste a tu mascota o encontraste una?", sender: 'bot' }
  ],
  loading: false,
  previewImage: null,
  phoneError: null 
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_MAESTROS': return { ...state, maestros: action.payload };
    case 'SET_STEP': return { ...state, step: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'UPDATE_DATA': return { ...state, mascotaData: { ...state.mascotaData, ...action.payload } };
    case 'ADD_MESSAGE': return { ...state, messages: [...state.messages, { id: Date.now(), ...action.payload }] };
    case 'SET_PHOTO':
      return {
        ...state,
        previewImage: action.payload.preview,
        mascotaData: { ...state.mascotaData, foto2: action.payload.file },
        messages: [...state.messages, { id: Date.now(), text: "📸 Foto seleccionada", sender: 'user' }],
        step: 'menu_confirmar'
      };
    case 'SET_PHONE_ERROR': return { ...state, phoneError: action.payload };
    default: return state;
  }
}

export const useMascotaForm = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);

// 1. CARGA INICIAL DE MAESTROS
  useEffect(() => {
    // API_BASE_URL debe ser "/api" en producción para que Nginx lo capture
    let consultaback = `${API_BASE_URL}/mascotanuevo_datos`;
    console.log("fetch al back (URL):", consultaback);

    fetch(consultaback)
      .then(res => res.json())
      .then(data => {
        // La data se loguea aquí, donde ya fue recibida
        console.log("data del back recibida:", data); 
        dispatch({ type: 'SET_MAESTROS', payload: data });
      })
      .catch(err => console.error("Error cargando maestros:", err));
  }, []);

  // 2. FUNCIÓN PARA CERRAR Y VOLVER AL PORTAL
  const handleCerrarAsistente = useCallback(() => {
    // Lógica dinámica: en local vuelve al 4020, en la nube a la raíz "/"
    const portalUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:4020/' 
      : '/';
    
    console.log("Redirigiendo al portal:", portalUrl);
    window.location.href = portalUrl;
  }, []);

  // --- FUNCIÓN DE ENVÍO REAL AL BACKEND ---
  const enviarReporteFinal = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const formData = new FormData();
      formData.append("id_categoria", state.mascotaData.id_categoria);
      formData.append("id_tipo", state.mascotaData.id_tipo);
      formData.append("id_raza", state.mascotaData.id_raza || "");
      formData.append("titulo", state.mascotaData.titulo);
      formData.append("sexo", state.mascotaData.sexo);
      formData.append("latitud", state.mascotaData.latitud);
      formData.append("longitud", state.mascotaData.longitud);
      formData.append("calle", "Ituzaingó, Buenos Aires"); 
      formData.append("celular", state.mascotaData.celular);
      formData.append("nombre_contacto", state.mascotaData.nombre_contacto);

      if (state.mascotaData.foto2) {
        formData.append("foto2", state.mascotaData.foto2);
      }

      const response = await fetch(`${API_BASE_URL}/mascota_chat_graba`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        dispatch({ type: 'SET_STEP', payload: 'finalizado' });
        console.log("✅ Guardado exitoso:", result.insertId);
      } else {
        throw new Error(result.message || "Error desconocido en el servidor");
      }

    } catch (error) {
      console.error("❌ Error al publicar:", error);
      alert("No pudimos guardar el reporte.");
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.mascotaData]);

  const handleStartReport = useCallback((catId) => {
    const text = catId === 20 ? "Perdí mi mascota 😢" : "Encontré una mascota 🐶";
    dispatch({ type: 'ADD_MESSAGE', payload: { text, sender: 'user' } });
    dispatch({ type: 'UPDATE_DATA', payload: { id_categoria: catId } });
    dispatch({ type: 'SET_STEP', payload: 'loading_bot' });

    setTimeout(() => {
      const botMsg = catId === 20 ? "¿Cómo se llama tu mascota?" : "¿Qué nombre le pusiste o cómo se llama?";
      dispatch({ type: 'ADD_MESSAGE', payload: { text: botMsg, sender: 'bot' } });
      dispatch({ type: 'SET_STEP', payload: 'nombre' });
    }, 800);
  }, []);

  const handleNextStep = useCallback((valor, campo) => {
    if (campo === 'enviar_final') {
      enviarReporteFinal();
      return;
    }

    dispatch({ type: 'UPDATE_DATA', payload: { [campo]: valor } });
    
    let userDisplayMsg = valor;
    let isMapStep = false;

    if (campo === 'id_tipo') userDisplayMsg = (valor === 10 ? "Perro 🐶" : "Gato 🐱");
    if (campo === 'ubicacion_confirmada') {
        userDisplayMsg = "Ubicación confirmada ✅";
        isMapStep = true;
    }

    dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
            text: userDisplayMsg, 
            sender: 'user',
            ...(isMapStep && { 
                type: 'map', 
                lat: state.mascotaData.latitud, 
                lng: state.mascotaData.longitud 
            })
        } 
    });
    
    dispatch({ type: 'SET_STEP', payload: 'loading_bot' });

    setTimeout(() => {
      const flow = {
        titulo: { next: 'especie', msg: "¿Es perro o gato?" },
        id_tipo: { next: 'ubicacion', msg: "Confirmá el punto en el mapa donde ocurrió:" },
        ubicacion_confirmada: { next: 'telefono', msg: "Perfecto. ¿A qué número de celular te pueden contactar?" },
        celular: { next: 'contacto_nombre', msg: "¿Cómo te llamás?" }, 
        nombre_contacto: { next: 'foto', msg: "Por último, subí una foto de la mascota para el reporte:" }
      };

      const currentConfig = flow[campo];

      if (currentConfig) {
        dispatch({ type: 'ADD_MESSAGE', payload: { text: currentConfig.msg, sender: 'bot' } });
        dispatch({ type: 'SET_STEP', payload: currentConfig.next });
      } else {
        if (campo === 'nombre_contacto') {
            dispatch({ type: 'ADD_MESSAGE', payload: { text: "Por último, subí una foto de la mascota:", sender: 'bot' } });
            dispatch({ type: 'SET_STEP', payload: 'foto' });
        } else {
            dispatch({ type: 'SET_STEP', payload: 'menu_confirmar' });
        }
      }
    }, 800);

  }, [enviarReporteFinal, state.mascotaData.latitud, state.mascotaData.longitud]);

  return { ...state, handleStartReport, handleNextStep, handleCerrarAsistente, dispatch };
};