import { useReducer, useCallback, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
    { id: 2, text: "¿Qué sucedió? ¿Perdiste a tu mascota, la encontraste, o queres dar en adopción?", sender: 'bot' }
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

  useEffect(() => {
    let consultaback = `${API_BASE_URL}/mascotanuevo_datos`;
    fetch(consultaback)
      .then(res => res.json())
      .then(data => {
        dispatch({ type: 'SET_MAESTROS', payload: data });
      })
      .catch(err => console.error("Error cargando maestros:", err));
  }, []);

  const handleCerrarAsistente = useCallback(() => {
    const portalUrl = window.location.hostname === 'localhost' ? 'http://localhost:4020/' : '/';
    window.location.href = portalUrl;
  }, []);

  const enviarReporteFinal = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const formData = new FormData();
      Object.keys(state.mascotaData).forEach(key => {
        if (key === 'foto2') {
          if (state.mascotaData.foto2) formData.append("foto2", state.mascotaData.foto2);
        } else {
          formData.append(key, state.mascotaData[key] || "");
        }
      });
      formData.append("calle", "Ituzaingó, Buenos Aires"); 

      const response = await fetch(`${API_BASE_URL}/mascota_chat_graba`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'SET_STEP', payload: 'finalizado' });
      } else {
        throw new Error(result.message || "Error en el servidor");
      }
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("No pudimos guardar el reporte.");
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.mascotaData]);

  // NUEVO ORDEN: PASO 1 -> PASO 2 (Especie)
  const handleStartReport = useCallback((catId) => {
    let text = "Perdí mi mascota 😢";
    if (catId === 30) text = "Encontré una mascota 🏠";
    if (catId === 40) text = "Quiero dar en adopción 🐾";

    dispatch({ type: 'ADD_MESSAGE', payload: { text, sender: 'user' } });
    dispatch({ type: 'UPDATE_DATA', payload: { id_categoria: catId } });
    dispatch({ type: 'SET_STEP', payload: 'loading_bot' });

    setTimeout(() => {
      dispatch({ type: 'ADD_MESSAGE', payload: { text: "Perfecto, ¿qué tipo de mascota es?", sender: 'bot' } });
      dispatch({ type: 'SET_STEP', payload: 'especie' });
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
      // NUEVO ORDEN DE FLUJO:
      const flow = {
        // Después de Especie (id_tipo) viene Nombre (titulo)
        id_tipo: { 
          next: 'nombre', 
          msg: state.mascotaData.id_categoria === 20 ? "¿Cómo se llama tu mascota?" : "¿Cómo se llama tu mascota?" 
        },
        // Después de Nombre (titulo) viene Ubicación
        titulo: { 
          next: 'ubicacion', 
          msg: "Confirmá el punto en el mapa donde ocurrió:" 
        },
        ubicacion_confirmada: { 
          next: 'telefono', 
          msg: "Perfecto. ¿A qué número de celular te pueden contactar?" 
        },
        celular: { 
          next: 'contacto_nombre', 
          msg: "¿Cómo te llamás?" 
        }, 
        nombre_contacto: { 
          next: 'foto', 
          msg: "Por último, subí una foto de la mascota para el reporte:" 
        }
      };

      const currentConfig = flow[campo];

      if (currentConfig) {
        dispatch({ type: 'ADD_MESSAGE', payload: { text: currentConfig.msg, sender: 'bot' } });
        dispatch({ type: 'SET_STEP', payload: currentConfig.next });
      } else {
        dispatch({ type: 'SET_STEP', payload: 'menu_confirmar' });
      }
    }, 800);

  }, [enviarReporteFinal, state.mascotaData.latitud, state.mascotaData.longitud, state.mascotaData.id_categoria]);

  return { ...state, handleStartReport, handleNextStep, handleCerrarAsistente, dispatch };
};