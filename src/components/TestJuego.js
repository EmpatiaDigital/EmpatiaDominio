import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import preguntasData from '../data/preguntas.json';
import '../style/TestJuego.css';

const PREGUNTAS_POR_JUEGO = 5;
const PUNTOS_POR_CORRECTA = 10;

const TestJuego = () => {
  const navigate = useNavigate();
  const insigniaRef = useRef(null);

  const preguntasSeleccionadas = useMemo(() => {
    if (!preguntasData || preguntasData.length === 0) return [];
    return [...preguntasData].sort(() => 0.5 - Math.random()).slice(0, PREGUNTAS_POR_JUEGO);
  }, []);

  const [pantalla, setPantalla] = useState('inicio');
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [respondido, setRespondido] = useState(false);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [capturando, setCapturando] = useState(false);

  const totalPreguntas = preguntasSeleccionadas.length;
  const itemActivo = preguntasSeleccionadas[preguntaActual];
  const puntajeFinal = respuestasCorrectas * PUNTOS_POR_CORRECTA;
  const puntajeMaximo = totalPreguntas * PUNTOS_POR_CORRECTA;
  const porcentaje = puntajeMaximo > 0 ? Math.round((puntajeFinal / puntajeMaximo) * 100) : 0;

  const configRango = useMemo(() => {
    if (porcentaje >= 80) {
      return {
        id: 'PRO',
        texto: 'CIUDADANO DIGITAL PRO',
        clase: 'tj-rango-pro',
        color: '#059669',
        subtitulo: 'Dominio excepcional de seguridad y convivencia'
      };
    } else if (porcentaje >= 40) {
      return {
        id: 'MEDIUM',
        texto: 'NIVEL DIGITAL MEDIUM',
        clase: 'tj-rango-medium',
        color: '#2563eb',
        subtitulo: 'Criterio solido con herramientas de proteccion'
      };
    } else {
      return {
        id: 'APRENDIZ',
        texto: 'NIVEL APRENDIZ DIGITAL',
        clase: 'tj-rango-aprendiz',
        color: '#d97706',
        subtitulo: 'Explorando las bases del bienestar web'
      };
    }
  }, [porcentaje]);

  const handleIniciar = () => setPantalla('juego');

  const handleSeleccionarOpcion = (index) => {
    if (respondido) return;
    setOpcionSeleccionada(index);
  };

  const handleValidarRespuesta = () => {
    if (opcionSeleccionada === null) return;
    const esCorrecta = opcionSeleccionada === itemActivo.respuestaCorrecta;
    if (esCorrecta) setRespuestasCorrectas(prev => prev + 1);
    setHistorial(prev => [...prev, {
      pregunta: itemActivo.pregunta,
      correcta: esCorrecta,
      seleccionada: opcionSeleccionada,
      correctaIndex: itemActivo.respuestaCorrecta,
    }]);
    setRespondido(true);
  };

  const handleSiguientePregunta = () => {
    setOpcionSeleccionada(null);
    setRespondido(false);
    if (preguntaActual + 1 < totalPreguntas) {
      setPreguntaActual(prev => prev + 1);
    } else {
      setPantalla('resultados');
    }
  };

  const handleReiniciar = () => {
    setPreguntaActual(0);
    setOpcionSeleccionada(null);
    setRespondido(false);
    setRespuestasCorrectas(0);
    setHistorial([]);
    setPantalla('inicio');
  };

  const handleCompartir = async () => {
    if (!insigniaRef.current || capturando) return;
    setCapturando(true);

    try {
      const canvas = await html2canvas(insigniaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const urlJuego = `${window.location.origin}/trivia`;
      const texto = `Mira lo que obtuve en el Desafio Empatia Digital\nJuga la trivia aca: ${urlJuego}`;

      // Convertir canvas a Blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'mi-insignia-empatia.png', { type: 'image/png' });

      // Web Share API — permite compartir imagen directamente (funciona en movil)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: texto,
        });
      } else {
        // Fallback desktop: descarga la imagen y abre WhatsApp con el texto
        const link = document.createElement('a');
        link.download = 'mi-insignia-empatia.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        await new Promise(resolve => setTimeout(resolve, 400));

        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`,
          '_blank'
        );
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error al compartir la insignia:', err);
      }
    } finally {
      setCapturando(false);
    }
  };

  const getFeedbackFinal = () => {
    if (porcentaje === 100) return 'Resultado perfecto. Demostras un dominio excepcional sobre seguridad y bienestar digital.';
    if (porcentaje >= 80) return 'Excelente nivel de conocimiento. Tenes criterios solidos para proteger y acompanar a tu comunidad.';
    if (porcentaje >= 60) return 'Buen desempeno. Conoces los conceptos clave; seguir explorando estos temas te dara aun mas herramientas.';
    if (porcentaje >= 40) return 'Vas por buen camino. Te invitamos a revisar nuestros recursos gratuitos para reforzar lo aprendido.';
    return 'Este es un buen punto de partida. Descubri nuestras guias y talleres para seguir creciendo en este tema.';
  };

  return (
    <div className="tj-container">

      {/* Pantalla de Inicio */}
      {pantalla === 'inicio' && (
        <div className="tj-inicio">
          <div className="tj-inicio-header">
            <svg className="tj-inicio-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="tj-inicio-eyebrow">Trivia interactiva</span>
          </div>

          <h2 className="tj-inicio-titulo">Desafio Empatia Digital</h2>
          <p className="tj-inicio-descripcion">
            Pone a prueba tus conocimientos sobre seguridad, bienestar y convivencia en entornos digitales. Cinco preguntas, respuestas inmediatas y explicaciones detalladas.
          </p>

          <div className="tj-inicio-chips">
            <div className="tj-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {PREGUNTAS_POR_JUEGO} preguntas
            </div>
            <div className="tj-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {PUNTOS_POR_CORRECTA} puntos por acierto
            </div>
            <div className="tj-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Feedback en cada respuesta
            </div>
          </div>

          <button onClick={handleIniciar} className="tj-btn-iniciar">
            <span>Comenzar desafio</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <p className="tj-inicio-aviso">
            Las preguntas se seleccionan aleatoriamente en cada partida.
          </p>
        </div>
      )}

      {/* Pantalla de Juego */}
      {pantalla === 'juego' && itemActivo && (
        <>
          <div className="tj-header">
            <div className="tj-header-title-wrap">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3>Desafio Empatia Digital</h3>
            </div>
            <span className="tj-counter">
              {preguntaActual + 1} / {totalPreguntas}
            </span>
          </div>

          <div className="tj-progreso-barra-wrap">
            <div
              className="tj-progreso-barra-fill"
              style={{ width: `${((preguntaActual + (respondido ? 1 : 0)) / totalPreguntas) * 100}%` }}
            />
          </div>

          <div className="tj-body">
            <div className="tj-pregunta-numero">Pregunta {preguntaActual + 1}</div>
            <h4 className="tj-pregunta">{itemActivo.pregunta}</h4>

            <div className="tj-opciones-list">
              {itemActivo.opciones.map((opcion, index) => {
                let claseDinamica = '';
                if (opcionSeleccionada === index && !respondido) claseDinamica = 'tj-selected';
                if (respondido) {
                  if (index === itemActivo.respuestaCorrecta) claseDinamica = 'tj-correcta';
                  else if (opcionSeleccionada === index) claseDinamica = 'tj-incorrecta';
                  else claseDinamica = 'tj-opaca';
                }

                return (
                  <button
                    key={index}
                    disabled={respondido}
                    onClick={() => handleSeleccionarOpcion(index)}
                    className={`tj-opcion-btn ${claseDinamica}`}
                  >
                    <span className="tj-opcion-letra">{String.fromCharCode(65 + index)}</span>
                    <span className="tj-opcion-texto">{opcion}</span>
                    {respondido && index === itemActivo.respuestaCorrecta && (
                      <svg className="tj-icon-estado" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {respondido && opcionSeleccionada === index && index !== itemActivo.respuestaCorrecta && (
                      <svg className="tj-icon-estado" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {respondido && (
              <div className={`tj-feedback-box ${opcionSeleccionada === itemActivo.respuestaCorrecta ? 'tj-feedback-ok' : 'tj-feedback-error'}`}>
                <div className="tj-feedback-label">
                  {opcionSeleccionada === itemActivo.respuestaCorrecta ? 'Correcto' : 'Incorrecto'}
                </div>
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Pantalla de Resultados */}
      {pantalla === 'resultados' && (
        <div className="tj-resultados">
          <div className="tj-res-header">
            <div className="tj-header">
              <div className="tj-header-title-wrap">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3>Desafio Empatia Digital</h3>
              </div>
            </div>
          </div>

          <div className="tj-res-body">

            {/* Solo este div entra en la captura */}
            <div ref={insigniaRef} className={`tj-insignia-card ${configRango.clase}`}>
              <div className="tj-insignia-layout">
                <div className="tj-insignia-asset-container">
                  <div className="tj-insignia-vector-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke={configRango.color} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
                <div className="tj-insignia-content">
                  <span className="tj-insignia-meta">INSIGNIA OTORGADA</span>
                  <h5 className="tj-insignia-tier" style={{ color: configRango.color }}>{configRango.texto}</h5>
                  <p className="tj-insignia-sub">{configRango.subtitulo}</p>
                </div>
              </div>
            </div>

            {/* Boton fuera del ref: no aparece en la imagen */}
            <button
              onClick={handleCompartir}
              disabled={capturando}
              className="tj-btn-compartir-wa"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.948 0c3.176.001 6.165 1.24 8.407 3.485 2.242 2.246 3.476 5.237 3.475 8.417-.004 6.598-5.342 11.946-11.893 11.946-1.999-.001-3.965-.51-5.708-1.479L0 24zm6.59-4.846c1.62.962 3.376 1.47 5.291 1.47 5.274 0 9.563-4.307 9.566-9.607.002-2.569-1.002-4.985-2.827-6.812C16.8 2.376 14.39 1.373 11.83 1.373c-5.278 0-9.567 4.31-9.57 9.61-.001 1.925.499 3.805 1.447 5.463L2.73 21.08l4.814-1.26c-.46-.24-.46-.24 0 0z" />
              </svg>
              <span>{capturando ? 'Generando imagen...' : 'Compartir Logro en WhatsApp'}</span>
            </button>

            <h4 className="tj-res-titulo">Resultados del Desafio</h4>

            <div className="tj-res-score-wrap">
              <span className="tj-res-score">{puntajeFinal}</span>
              <span className="tj-res-score-max">/ {puntajeMaximo} puntos</span>
            </div>

            <div className="tj-progress-bar-bg">
              <div
                className="tj-progress-bar-fill"
                style={{ width: `${porcentaje}%` }}
              />
            </div>

            <div className="tj-res-stats">
              <div className="tj-stat">
                <span className="tj-stat-valor tj-stat-correctas">{respuestasCorrectas}</span>
                <span className="tj-stat-label">correctas</span>
              </div>
              <div className="tj-stat-sep" />
              <div className="tj-stat">
                <span className="tj-stat-valor tj-stat-incorrectas">{totalPreguntas - respuestasCorrectas}</span>
                <span className="tj-stat-label">incorrectas</span>
              </div>
              <div className="tj-stat-sep" />
              <div className="tj-stat">
                <span className="tj-stat-valor">{porcentaje}%</span>
                <span className="tj-stat-label">aciertos</span>
              </div>
            </div>

            <div className="tj-res-feedback">
              <p>Gracias por participar y por tu interes en aprender sobre estos temas. Mas alla del resultado, informarse y reflexionar es el primer paso para construir entornos digitales mas humanos.</p>
              <p className="tj-res-feedback-personalizado">{getFeedbackFinal()}</p>
            </div>

            <div className="tj-res-historial">
              <p className="tj-historial-titulo">Resumen de respuestas</p>
              {historial.map((item, i) => (
                <div key={i} className={`tj-historial-item ${item.correcta ? 'tj-hist-ok' : 'tj-hist-mal'}`}>
                  <div className={`tj-hist-dot ${item.correcta ? 'tj-dot-ok' : 'tj-dot-mal'}`} />
                  <span className="tj-hist-texto">{item.pregunta}</span>
                </div>
              ))}
            </div>

            <div className="tj-res-acciones">
              <button onClick={() => navigate('/descargas')} className="tj-btn-accion tj-btn-accion-primary">
                Descargar guias y recursos gratuitos
              </button>
              <button onClick={() => navigate('/inscription')} className="tj-btn-accion tj-btn-accion-dark">
                Inscribirse a los proximos talleres
              </button>
              <button onClick={handleReiniciar} className="tj-btn-accion tj-btn-accion-ghost">
                Volver a jugar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestJuego;
