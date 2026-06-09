import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import preguntasData from '../data/preguntas.json';
import '../style/TestJuego.css';

const PREGUNTAS_POR_JUEGO = 5;
const PUNTOS_POR_CORRECTA = 20;
const API = 'https://empatia-dominio-back.vercel.app/api';
const STORAGE_KEY = 'empatia_trivia_vistas'; // IDs de preguntas ya jugadas

// ─── Fingerprint (igual que PostStats) ───────────────────────────────────────
const getVisitorId = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) return `user_${payload.userId}`;
    } catch (_) {}
  }
  let fp = localStorage.getItem('empatia_fp');
  if (!fp) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint_empatia', 2, 2);
    const raw = [
      navigator.userAgent,
      navigator.language,
      window.screen.width + 'x' + window.screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL().slice(-50),
    ].join('|');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
    fp = `anon_${Math.abs(hash)}_${Date.now()}`;
    localStorage.setItem('empatia_fp', fp);
  }
  return fp;
};

// ─── Selección sin repetición ─────────────────────────────────────────────────
const seleccionarPreguntas = () => {
  if (!preguntasData || preguntasData.length === 0) return [];

  // Preguntas ya vistas guardadas en localStorage (array de indices como string)
  let vistas = [];
  try { vistas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { vistas = []; }

  // Preguntas disponibles = las que NO están en vistas
  const disponibles = preguntasData.filter((_, i) => !vistas.includes(i));

  // Si quedan menos de las necesarias, reseteamos el historial y usamos todas
  const pool = disponibles.length >= PREGUNTAS_POR_JUEGO ? disponibles : preguntasData;
  if (disponibles.length < PREGUNTAS_POR_JUEGO) {
    localStorage.setItem(STORAGE_KEY, '[]');
  }

  // Shuffle y slice
  const seleccionadas = [...pool]
    .map((p, i) => ({ ...p, _originalIndex: preguntasData.indexOf(p) }))
    .sort(() => 0.5 - Math.random())
    .slice(0, PREGUNTAS_POR_JUEGO);

  // Guardar indices usados en esta partida
  const nuevasVistas = [...new Set([
    ...(disponibles.length >= PREGUNTAS_POR_JUEGO ? vistas : []),
    ...seleccionadas.map(p => p._originalIndex),
  ])];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasVistas));

  return seleccionadas;
};

const TestJuego = () => {
  const navigate   = useNavigate();
  const insigniaRef = useRef(null);

  const preguntasSeleccionadas = useMemo(() => seleccionarPreguntas(), []);

  const [pantalla, setPantalla]               = useState('inicio');
  const [preguntaActual, setPreguntaActual]   = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [respondido, setRespondido]           = useState(false);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [historial, setHistorial]             = useState([]);
  const [capturando, setCapturando]           = useState(false);
  const [guardando, setGuardando]             = useState(false);
  const [partidaGuardada, setPartidaGuardada] = useState(false);
  const [ranking, setRanking]                 = useState([]);
  const [cargandoRanking, setCargandoRanking] = useState(false);
  const [mostrarRanking, setMostrarRanking]   = useState(false);

  const totalPreguntas = preguntasSeleccionadas.length;
  const itemActivo     = preguntasSeleccionadas[preguntaActual];
  const puntajeFinal   = respuestasCorrectas * PUNTOS_POR_CORRECTA;
  const puntajeMaximo  = totalPreguntas * PUNTOS_POR_CORRECTA;
  const porcentaje     = puntajeMaximo > 0 ? Math.round((puntajeFinal / puntajeMaximo) * 100) : 0;

  const configRango = useMemo(() => {
    if (porcentaje >= 80) return { id: 'PRO',      texto: 'CIUDADANO DIGITAL PRO',    clase: 'tj-rango-pro',      color: '#059669', subtitulo: 'Dominio excepcional de seguridad y convivencia' };
    if (porcentaje >= 40) return { id: 'MEDIUM',   texto: 'NIVEL DIGITAL MEDIUM',     clase: 'tj-rango-medium',   color: '#2563eb', subtitulo: 'Criterio solido con herramientas de proteccion' };
    return                       { id: 'APRENDIZ', texto: 'NIVEL APRENDIZ DIGITAL',   clase: 'tj-rango-aprendiz', color: '#d97706', subtitulo: 'Explorando las bases del bienestar web' };
  }, [porcentaje]);

  // ─── Guardar partida al llegar a resultados ───────────────────────────────
  useEffect(() => {
    if (pantalla !== 'resultados' || partidaGuardada) return;

    const guardarPartida = async () => {
      setGuardando(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        await fetch(`${API}/trivia/partida`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            visitorId: getVisitorId(),
            preguntasJugadas: preguntasSeleccionadas.map(p => p._originalIndex),
            puntaje: puntajeFinal,
            puntajeMaximo,
            porcentaje,
            respuestasCorrectas,
            totalPreguntas,
            rango: configRango.id,
          }),
        });
        setPartidaGuardada(true);
      } catch (err) {
        console.error('Error guardando partida:', err);
      } finally {
        setGuardando(false);
      }
    };

    guardarPartida();
  }, [pantalla]);

  // ─── Cargar ranking al mostrarlo ─────────────────────────────────────────
  const handleVerRanking = async () => {
    setMostrarRanking(true);
    if (ranking.length > 0) return;
    setCargandoRanking(true);
    try {
      const res  = await fetch(`${API}/trivia/ranking`);
      const data = await res.json();
      setRanking(Array.isArray(data) ? data : []);
    } catch { setRanking([]); }
    setCargandoRanking(false);
  };

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
    setPartidaGuardada(false);
    setMostrarRanking(false);
    setPantalla('inicio');
  };

  const handleCompartir = async () => {
    if (!insigniaRef.current || capturando) return;
    setCapturando(true);
    try {
      const canvas = await html2canvas(insigniaRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        logging: false, allowTaint: true, foreignObjectRendering: false,
      });

      const urlJuego = `${window.location.origin}/trivia`;
      const texto = `Mira la insignia que obtuve en el Desafio Empatia Digital\nIntentalo en el link: ${urlJuego}`;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'mi-insignia-empatia.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: texto });
      } else {
        const link = document.createElement('a');
        link.download = 'mi-insignia-empatia.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise(resolve => setTimeout(resolve, 400));
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Error al compartir:', err);
    } finally {
      setCapturando(false);
    }
  };

  const getFeedbackFinal = () => {
    if (porcentaje === 100) return 'Resultado perfecto. Demostras un dominio excepcional sobre seguridad y bienestar digital.';
    if (porcentaje >= 80)  return 'Excelente nivel de conocimiento. Tenes criterios solidos para proteger y acompanar a tu comunidad.';
    if (porcentaje >= 60)  return 'Buen desempeno. Conoces los conceptos clave; seguir explorando estos temas te dara aun mas herramientas.';
    if (porcentaje >= 40)  return 'Vas por buen camino. Te invitamos a revisar nuestros recursos gratuitos para reforzar lo aprendido.';
    return 'Este es un buen punto de partida. Descubri nuestras guias y talleres para seguir creciendo en este tema.';
  };

  const rangoColores = { PRO: '#059669', MEDIUM: '#2563eb', APRENDIZ: '#d97706' };

  return (
    <div className="tj-container">

      {/* ── PANTALLA INICIO ────────────────────────────────────────────────── */}
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
              {PREGUNTAS_POR_JUEGO} preguntas sin repetir
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
            Las preguntas rotan automaticamente — no veras las mismas dos veces seguidas.
          </p>
        </div>
      )}

      {/* ── PANTALLA JUEGO ─────────────────────────────────────────────────── */}
      {pantalla === 'juego' && itemActivo && (
        <>
          <div className="tj-header">
            <div className="tj-header-title-wrap">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3>Desafio Empatia Digital</h3>
            </div>
            <span className="tj-counter">{preguntaActual + 1} / {totalPreguntas}</span>
          </div>

          <div className="tj-progreso-barra-wrap">
            <div className="tj-progreso-barra-fill" style={{ width: `${((preguntaActual + (respondido ? 1 : 0)) / totalPreguntas) * 100}%` }} />
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
                  <button key={index} disabled={respondido} onClick={() => handleSeleccionarOpcion(index)} className={`tj-opcion-btn ${claseDinamica}`}>
                    <span className="tj-opcion-letra">{String.fromCharCode(65 + index)}</span>
                    <span className="tj-opcion-texto">{opcion}</span>
                    {respondido && index === itemActivo.respuestaCorrecta && (
                      <svg className="tj-icon-estado" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                    {respondido && opcionSeleccionada === index && index !== itemActivo.respuestaCorrecta && (
                      <svg className="tj-icon-estado" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </button>
                );
              })}
            </div>

            {respondido && (
              <div className={`tj-feedback-box ${opcionSeleccionada === itemActivo.respuestaCorrecta ? 'tj-feedback-ok' : 'tj-feedback-error'}`}>
                <div className="tj-feedback-label">{opcionSeleccionada === itemActivo.respuestaCorrecta ? 'Correcto' : 'Incorrecto'}</div>
                <p>{itemActivo.feedback}</p>
              </div>
            )}

            <div className="tj-footer-actions">
              {!respondido ? (
                <button disabled={opcionSeleccionada === null} onClick={handleValidarRespuesta} className="tj-btn-primary tj-comprobar">
                  Comprobar respuesta
                </button>
              ) : (
                <button onClick={handleSiguientePregunta} className="tj-btn-primary tj-siguiente">
                  <span>{preguntaActual + 1 === totalPreguntas ? 'Ver resultados' : 'Siguiente'}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── PANTALLA RESULTADOS ────────────────────────────────────────────── */}
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
              {guardando && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Guardando partida...</span>}
            </div>
          </div>

          <div className="tj-res-body">

            {/* Bloque capturado por html2canvas */}
            <div ref={insigniaRef} style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '16px', width: '100%' }}>
              <div
                className={`tj-insignia-card ${configRango.clase}`}
                style={{
                  background: configRango.id === 'PRO' ? 'linear-gradient(to right, #f0fdf4, #f8fafc)' : configRango.id === 'MEDIUM' ? 'linear-gradient(to right, #eff6ff, #f8fafc)' : 'linear-gradient(to right, #fffbeb, #f8fafc)',
                  border: `2px solid ${configRango.color}`, borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke={configRango.color} strokeWidth={2} style={{ width: '100%', height: '100%' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>INSIGNIA OTORGADA</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: configRango.color, margin: '2px 0' }}>{configRango.texto}</span>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>{configRango.subtitulo}</span>
                  </div>
                </div>
              </div>

              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0', textAlign: 'center' }}>Resultados del Desafio</h4>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.25rem', fontWeight: 700, color: '#1e3a5f', lineHeight: 1 }}>{puntajeFinal}</span>
                <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 600 }}>/ {puntajeMaximo} puntos</span>
              </div>

              <div style={{ width: '100%', maxWidth: '360px', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '50px', overflow: 'hidden', margin: '0 auto 1.5rem auto' }}>
                <div style={{ height: '100%', width: `${porcentaje}%`, background: 'linear-gradient(90deg, #4a90d9, #1e3a5f)', borderRadius: '50px' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.65rem', fontWeight: 700, color: '#059669', lineHeight: 1.2 }}>{respuestasCorrectas}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>correctas</span>
                </div>
                <div style={{ width: '1px', height: '38px', backgroundColor: '#e2e8f0', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.65rem', fontWeight: 700, color: '#dc2626', lineHeight: 1.2 }}>{totalPreguntas - respuestasCorrectas}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>incorrectas</span>
                </div>
                <div style={{ width: '1px', height: '38px', backgroundColor: '#e2e8f0', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{porcentaje}%</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>aciertos</span>
                </div>
              </div>
            </div>

            {/* Botón compartir */}
            <button onClick={handleCompartir} disabled={capturando} className="tj-btn-compartir-wa">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.948 0c3.176.001 6.165 1.24 8.407 3.485 2.242 2.246 3.476 5.237 3.475 8.417-.004 6.598-5.342 11.946-11.893 11.946-1.999-.001-3.965-.51-5.708-1.479L0 24zm6.59-4.846c1.62.962 3.376 1.47 5.291 1.47 5.274 0 9.563-4.307 9.566-9.607.002-2.569-1.002-4.985-2.827-6.812C16.8 2.376 14.39 1.373 11.83 1.373c-5.278 0-9.567 4.31-9.57 9.61-.001 1.925.499 3.805 1.447 5.463L2.73 21.08l4.814-1.26c-.46-.24-.46-.24 0 0z" />
              </svg>
              <span>{capturando ? 'Generando imagen...' : 'Compartir Logro en WhatsApp'}</span>
            </button>

            {/* Aviso login para guardar score */}
            {!localStorage.getItem('token') && (
              <div style={{ width: '100%', padding: '1rem 1.25rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={2} width="20" height="20" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#1e40af', fontWeight: 600 }}>Registrate para aparecer en el ranking</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#3b82f6' }}>Tu partida fue registrada. Iniciá sesion para guardar tu puntaje con tu nombre.</p>
                </div>
                <button onClick={() => navigate('/login')} style={{ padding: '0.45rem 1rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Ingresar
                </button>
              </div>
            )}

            {/* Ranking */}
            <div style={{ width: '100%', marginTop: '1rem' }}>
              <button
                onClick={handleVerRanking}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: mostrarRanking ? '#f1f5f9' : '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {mostrarRanking ? 'Ocultar ranking' : 'Ver ranking global'}
              </button>

              {mostrarRanking && (
                <div style={{ marginTop: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.85rem 1rem', backgroundColor: '#0f172a', color: '#fff' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Top 10 — Mejores puntajes</p>
                  </div>

                  {cargandoRanking ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Cargando ranking...</div>
                  ) : ranking.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Todavia no hay jugadores registrados en el ranking.</div>
                  ) : (
                    ranking.map((jugador, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderBottom: i < ranking.length - 1 ? '1px solid #f1f5f9' : 'none', backgroundColor: i === 0 ? '#fefce8' : '#fff' }}>
                        <span style={{ fontSize: i === 0 ? '1.25rem' : '0.9rem', fontWeight: 700, color: i === 0 ? '#d97706' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#cbd5e1', minWidth: '24px', textAlign: 'center' }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jugador.nombre}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{jugador.totalPartidas} {jugador.totalPartidas === 1 ? 'partida' : 'partidas'} · promedio {jugador.porcentajePromedio}%</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: rangoColores[jugador.mejorRango] || '#1e3a5f' }}>{jugador.mejorPuntaje} pts</p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: rangoColores[jugador.mejorRango] || '#94a3b8', fontWeight: 600 }}>{jugador.mejorRango}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="tj-res-feedback" style={{ marginTop: '1.25rem' }}>
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
              <button onClick={() => navigate('/descargas')} className="tj-btn-accion tj-btn-accion-primary">Descargar guias y recursos gratuitos</button>
              <button onClick={() => navigate('/inscription')} className="tj-btn-accion tj-btn-accion-dark">Inscribirse a los proximos talleres</button>
              <button onClick={handleReiniciar} className="tj-btn-accion tj-btn-accion-ghost">Volver a jugar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestJuego;
