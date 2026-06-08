import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import preguntasData from '../data/preguntas.json';
import '../style/TestJuego.css';

const TestJuego = () => {
  const navigate = useNavigate();

  // Seleccionamos 5 preguntas aleatorias del total disponible en el JSON
  const preguntasSeleccionadas = useMemo(() => {
    if (!preguntasData || preguntasData.length === 0) return [];
    return [...preguntasData].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, []);

  // Estados de control del juego
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [respondido, setRespondido] = useState(false);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [mostrarResultadoFinal, setMostrarResultadoFinal] = useState(false);

  const totalPreguntas = preguntasSeleccionadas.length;
  const itemActivo = preguntasSeleccionadas[preguntaActual];
  
  // Cálculo de puntaje (10 puntos por respuesta correcta)
  const puntajeFinal = respuestasCorrectas * 10;
  const puntajeMaximo = totalPreguntas * 10;

  const handleSeleccionarOpcion = (index) => {
    if (respondido) return;
    setOpcionSeleccionada(index);
  };

  const handleValidarRespuesta = () => {
    if (opcionSeleccionada === null) return;
    if (opcionSeleccionada === itemActivo.respuestaCorrecta) {
      setRespuestasCorrectas(prev => prev + 1);
    }
    setRespondido(true);
  };

  const handleSiguientePregunta = () => {
    setOpcionSeleccionada(null);
    setRespondido(false);

    if (preguntaActual + 1 < totalPreguntas) {
      setPreguntaActual(prev => prev + 1);
    } else {
      setMostrarResultadoFinal(true);
    }
  };

  const handleReiniciarJuego = () => {
    setPreguntaActual(0);
    setOpcionSeleccionada(null);
    setRespondido(false);
    setRespuestasCorrectas(0);
    setMostrarResultadoFinal(false);
  };

  return (
    <div className="tj-container">
      {/* Encabezado */}
      <div className="tj-header">
        <div className="tj-header-title-wrap">
          <svg className="tj-icon-status" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{width: '24px', height: '24px'}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3>Desafío Empatía Digital</h3>
        </div>
        {!mostrarResultadoFinal && (
          <span className="tj-counter">
            Pregunta {preguntaActual + 1} de {totalPreguntas}
          </span>
        )}
      </div>

      {/* Pantalla Final de Resultados */}
      {mostrarResultadoFinal ? (
        <div className="tj-resultados">
          <div className="tj-badge-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{width: '36px', height: '36px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h4>Resultados del Desafío</h4>
          <p className="tj-res-texto">
            Obtuviste un puntaje de <span className="tj-res-destaque">{puntajeFinal}</span> sobre {puntajeMaximo} puntos posibles.
          </p>

          <div className="tj-progress-bar-bg">
            <div 
              className="tj-progress-bar-fill" 
              style={{ width: `${(puntajeFinal / puntajeMaximo) * 100}%` }}
            ></div>
          </div>

          {/* Mensajes de feedback psicológico según el puntaje */}
          <div className="tj-feedback-final" style={{ marginBottom: '2rem', textAlign: 'center', maxWidth: '500px' }}>
            <p style={{ color: '#334155', fontSize: '1.05rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
              Queremos felicitarte por tu compromiso e interés en aprender sobre estos temas clave. Más allá del resultado numérico, el verdadero valor radica en informarse, reflexionar y promover entornos digitales más humanos y conscientes.
            </p>
            {puntajeFinal >= 40 && (
              <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '1.05rem', lineHeight: '1.6' }}>
                Demostrás un excelente nivel de conocimiento y criterio sobre seguridad y bienestar digital. Te invitamos a mantener este rol activo y seguir adquiriendo nuevas herramientas prácticas para acompañar y proteger a tu comunidad.
              </p>
            )}
          </div>

          {/* Bloque de Navegación e Inscripciones */}
          <div className="tj-action-layout" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '360px' }}>
            <button 
              onClick={() => navigate('/descargas')} 
              className="tj-btn-primary" 
              style={{ background: '#2563eb', color: '#ffffff', justifyContent: 'center' }}
            >
              Descargar guías y recursos gratuitos
            </button>
            
            <button 
              onClick={() => navigate('/inscription')} 
              className="tj-btn-primary" 
              style={{ background: '#0f172a', color: '#ffffff', justifyContent: 'center' }}
            >
              Inscribirse a los próximos talleres
            </button>

            <button 
              onClick={handleReiniciarJuego} 
              className="tj-btn-secondary"
              style={{ background: 'transparent', border: '2px solid #e2e8f0', color: '#475569', padding: '0.85rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
            >
              Volver a jugar
            </button>
          </div>
        </div>
      ) : (
        /* Pantalla Activa de Preguntas */
        <div className="tj-body">
          <h4 className="tj-pregunta">{itemActivo.pregunta}</h4>

          <div className="tj-opciones-list">
            {itemActivo.opciones.map((opcion, index) => {
              let claseDinamica = "";
              
              if (opcionSeleccionada === index && !respondido) claseDinamica = "tj-selected";
              
              if (respondido) {
                if (index === itemActivo.respuestaCorrecta) {
                  claseDinamica = "tj-correcta";
                } else if (opcionSeleccionada === index) {
                  claseDinamica = "tj-incorrecta";
                } else {
                  claseDinamica = "tj-opaca";
                }
              }

              return (
                <button
                  key={index}
                  disabled={respondido}
                  onClick={() => handleSeleccionarOpcion(index)}
                  className={`tj-opcion-btn ${claseDinamica}`}
                >
                  <span>{opcion}</span>
                  {respondido && index === itemActivo.respuestaCorrecta && (
                    <svg className="tj-icon-status" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {respondido && opcionSeleccionada === index && index !== itemActivo.respuestaCorrecta && (
                    <svg className="tj-icon-status" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {respondido && (
            <div className="tj-feedback-box">
              <p>{itemActivo.feedback}</p>
            </div>
          )}

          <div className="tj-footer-actions">
            {!respondido ? (
              <button
                disabled={opcionSeleccionada === null}
                onClick={handleValidarRespuesta}
                className="tj-btn-primary tj-comprobar"
              >
                Comprobar respuesta
              </button>
            ) : (
              <button onClick={handleSiguientePregunta} className="tj-btn-primary tj-siguiente">
                <span>{preguntaActual + 1 === totalPreguntas ? 'Ver resultados' : 'Siguiente'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{width: '16px', height: '16px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestJuego;
