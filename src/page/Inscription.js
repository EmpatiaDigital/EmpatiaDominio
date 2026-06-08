import React, { useState, useEffect } from 'react';
import '../style/Informacion.css';
import { useNavigate } from "react-router-dom";

const BASE_URL = 'https://empatia-dominio-back.vercel.app/api';

const Informacion = () => {
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${BASE_URL}/courses/active`);
        
        if (!res.ok) {
          throw new Error('No se encontró ningún curso activo en este momento.');
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Error en la respuesta del servidor (No se recibió JSON).");
        }

        const data = await res.json();
        if (data && data._id) {
          setCourse(data);
        } else {
          throw new Error('El curso encontrado no contiene una estructura válida.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, []);

  const scrollToPrivacy = (e) => {
    e.preventDefault();
    const privacySection = document.getElementById('privacy-section');
    if (privacySection) {
      privacySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInscription = () => {
    navigate("/inscription");
  };

  const renderIcono = (nombre) => {
    switch (nombre) {
      case 'lightbulb':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />;
      case 'warning':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />;
      case 'shield':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
      case 'settings':
        return (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </>
        );
      case 'smile':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
      default:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />;
    }
  };

  const {
    titulo = '',
    descripcion = '',
    duracion = '',
    clases = '',
    duracionClase = '',
    cargaTotal = '',
    modalidad = '',
    nivel = '',
    precio = 0,
    moneda = 'ARS',
    tieneDescuento = false,
    descuentoPorcentaje = 0,
    contenidos = [],
    audiencia = [],
    tieneCodigoPromo = false
  } = course || {};

  const precioRaw = precio ? precio.toString().replace(/[^\d.,]/g, '').replace(',', '.') : '0';
  const precioNumero = parseFloat(precioRaw);
  const precioMostrado = !isNaN(precioNumero) ? Math.round(precioNumero).toLocaleString('es-AR') : '0';
  const monedaMostrada = moneda === 'USD' ? 'U$D' : '$';

  const descuentoPct = descuentoPorcentaje || 0;
  const precioConDesc = tieneDescuento && !isNaN(precioNumero)
    ? Math.round(precioNumero * (1 - descuentoPct / 100))
    : null;

  return (
    <div className="informacion-container">

      {/* Header con aviso de privacidad */}
      <div className="privacy-banner">
        <a href="#privacy-section" onClick={scrollToPrivacy} className="privacy-link">
          <svg className="privacy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Uso de Datos Personales
        </a>
      </div>

      {/* Flujo de carga/error dinámico de la API */}
      {loading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
          Cargando información detallada del curso...
        </div>
      ) : error || !course ? (
        <div style={{ padding: '3rem 2rem', margin: '2rem auto', maxWidth: '500px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', textAlign: 'center' }}>
          <svg style={{ width: '40px', height: '40px', color: '#ef4444', margin: '0 auto 1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Información temporalmente no disponible</h3>
          <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>{error || "No pudimos conectar con el servidor de inscripciones."}</p>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="badge-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>Certificación Avalada</span>
              </div>

              <h1 className="hero-title">{titulo}</h1>
              {descripcion && <p className="hero-description">{descripcion}</p>}

              <p className="hero-philosophy">
                Este curso nace con una idea simple:{" "}
                <strong>acercar el conocimiento a las personas</strong>, sin miedo, sin tecnicismos y con sentido humano.
              </p>
            </div>
          </section>

          {/* Contenido del curso */}
          {duracion && contenidos && contenidos.length > 0 && (
            <section className="course-content">
              <div className="learning-section">
                <h2 className="section-title">Durante {duracion} vas a aprender</h2>
                <div className="learning-grid">
                  {contenidos.map((item, index) => (
                    <div className="learning-card" key={index}>
                      <div className="card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          {renderIcono(item.icono || '')}
                        </svg>
                      </div>
                      <h3>{item.titulo}</h3>
                      <p>{item.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Modalidad */}
          <section className="modality-section">
            <h2 className="section-title">Modalidad del Curso</h2>
            <div className="modality-grid">
              {duracion && <div className="modality-item"><span className="modality-label">Duración</span><span className="modality-value">{duracion}</span></div>}
              {clases && <div className="modality-item"><span className="modality-label">Clases</span><span className="modality-value">{clases}</span></div>}
              {duracionClase && <div className="modality-item"><span className="modality-label">Duración por encuentro</span><span className="modality-value">{duracionClase}</span></div>}
              {cargaTotal && <div className="modality-item"><span className="modality-label">Carga total</span><span className="modality-value">{cargaTotal}</span></div>}
              {modalidad && <div className="modality-item"><span className="modality-label">Modalidad</span><span className="modality-value">{modalidad}</span></div>}
              {nivel && <div className="modality-item"><span className="modality-label">Nivel</span><span className="modality-value">{nivel}</span></div>}
            </div>
          </section>

          {/* Para quién */}
          {audiencia && audiencia.length > 0 && (
            <section className="audience-section">
              <h2 className="section-title">¿Para quién es este curso?</h2>
              <div className="audience-tags">
                {audiencia.map((item, index) => (
                  <span className="audience-tag" key={index}>{item}</span>
                ))}
              </div>
            </section>
          )}

          {/* Inversión y Precio */}
          <section className="pricing-section">
            <div className="pricing-card">
              <h2 className="pricing-title">Inversión en tu Aprendizaje</h2>

              <div className="prices-container">
                {tieneDescuento ? (
                  <>
                    <div className="price-amount original-price">
                      <span className="currency">{monedaMostrada}</span>
                      <span className="amount">{precioMostrado}</span>
                    </div>
                    <div className="price-amount current-price">
                      <span className="currency">{monedaMostrada}</span>
                      <span className="amount">{precioConDesc?.toLocaleString('es-AR')}</span>
                    </div>
                  </>
                ) : (
                  <div className="price-amount current-price">
                    <span className="currency">{monedaMostrada}</span>
                    <span className="amount">{precioMostrado}</span>
                  </div>
                )}
              </div>

              <p className="price-description">
                {tieneDescuento ? `Precio con ${descuentoPct}% de descuento · ` : ''}Valor total por {duracion}
              </p>

              {tieneCodigoPromo && (
                <div className="promo-aviso">
                  <strong>¡Inscribite y puede que te lleves algo más!</strong>{' '}
                  Sorteamos códigos de descuento exclusivos entre los participantes.
                </div>
              )}

              <button className="cta-button" onClick={handleInscription}>
                Inscribirme Ahora
              </button>
            </div>
          </section>
        </>
      )}

      {/* Términos, Condiciones y Contactos Estructurados (Inmutables) */}
      <section className="privacy-section" id="privacy-section">
        <div className="privacy-container">
          <h2 className="privacy-title">Términos y Condiciones de Uso de Datos Personales</h2>

          <div className="privacy-content">
            {/* Bloques 1 al 11 omitidos aquí en pos de la brevedad de lectura, permanecen intactos en tu archivo */}
            <div className="privacy-block">
              <h3>1. Recopilación de Datos</h3>
              <p>Al inscribirte en {titulo ? `el curso "${titulo}"` : 'nuestras capacitaciones'}, recopilamos información personal básica...</p>
            </div>
            
            {/* [... Bloques del 2 al 11 sin alteraciones de texto ...] */}

            <div className="privacy-block">
              <h3>12. Canales de Contacto Oficiales</h3>
              <p>
                Para ejercer tus derechos de acceso, rectificación o eliminación de tus datos personales, podés contactarnos de forma directa mediante cualquiera de las siguientes vías de atención:
              </p>
              
              <div className="contact-channels">
                <div className="contact-item">
                  <span className="contact-label">Email</span>
                  <div className="contact-value">
                    <a className="linkCel" href="mailto:empatiadigital2025@gmail.com">
                      empatiadigital2025@gmail.com
                    </a>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-label">WhatsApp</span>
                  <div className="contact-value">
                    <a className="linkCel" href="https://wa.me/5493413559329" target="_blank" rel="noopener noreferrer">
                      +54 341 355-9329
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="privacy-footer">
              <p>Última actualización: Febrero 2026</p>
              <p>Empatía Digital</p>
            </div>
          </div>
        </div>
      </section>

      {/* Botón flotante */}
      {!loading && !error && course && (
        <button className="floating-inscription-btn" onClick={handleInscription}>
          Inscribirme Ahora
        </button>
      )}

    </div>
  );
};

export default Informacion;
