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
          throw new Error('El curso encontrado no es válido.');
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

  // Ícono SVG según nombre que venga de la base de datos
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

  // 1. Estado de Carga
  if (loading) {
    return (
      <div className="informacion-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#64748b', fontStyle: 'italic' }}>Cargando información del curso...</p>
      </div>
    );
  }

  // 2. Estado de Error (Si la API falla o no hay curso, se muestra esto)
  if (error || !course) {
    return (
      <div className="informacion-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
        <svg style={{ width: '48px', height: '48px', color: '#ef4444', marginBottom: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Conectando con el servidor</h2>
        <p style={{ color: '#64748b', maxWidth: '400px' }}>{error || "No hay inscripciones activas disponibles en este momento."}</p>
      </div>
    );
  }

  // 3. Flujo Seguro: Extraemos las propiedades directamente de la API ya validada
  const {
    titulo,
    descripcion,
    duracion,
    clases,
    duracionClase,
    cargaTotal,
    modalidad,
    nivel,
    precio,
    moneda,
    tieneDescuento,
    descuentoPorcentaje,
    contenidos,
    audiencia,
    tieneCodigoPromo
  } = course;

  // Procesamiento del precio dinámico
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
      <section className="course-content">
        {duracion && (
          <div className="learning-section">
            <h2 className="section-title">Durante {duracion} vas a aprender</h2>
            {contenidos && contenidos.length > 0 && (
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
            )}
          </div>
        )}
      </section>

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

      {/* Precio y CTA */}
      <section className="pricing-section">
        <div className="pricing-card">
          <h2 className="pricing-title">Inversión en tu Aprendizaje</h2>

          {tieneDescuento ? (
            <>
              <div className="price-amount" style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '1.8rem' }}>
                <span className="currency">{monedaMostrada}</span>
                <span className="amount">{precioMostrado}</span>
              </div>
              <div className="price-amount">
                <span className="currency">{monedaMostrada}</span>
                <span className="amount">{precioConDesc?.toLocaleString('es-AR')}</span>
              </div>
              <p className="price-description">
                Precio con {descuentoPct}% de descuento · Valor total por {duracion}
              </p>
            </>
          ) : (
            <>
              <div className="price-amount">
                <span className="currency">{monedaMostrada}</span>
                <span className="amount">{precioMostrado}</span>
              </div>
              <p className="price-description">Valor total por {duracion}</p>
            </>
          )}

          {tieneCodigoPromo && (
            <div className="promo-aviso" style={{ margin: '0.75rem 0 1rem', padding: '0.65rem 1rem', background: '#fef9c3', borderRadius: '8px', fontSize: '0.9rem', color: '#854d0e', borderLeft: '4px solid #ca8a04' }}>
              <strong>¡Inscribite y puede que te lleves algo más!</strong>{' '}
              Sorteamos códigos de descuento exclusivos entre los participantes.
            </div>
          )}

          <button className="cta-button" onClick={handleInscription}>
            Inscribirme Ahora
          </button>
        </div>
      </section>

      {/* Términos y Condiciones Dinámicos */}
      <section className="privacy-section" id="privacy-section">
        <div className="privacy-container">
          <h2 className="privacy-title">Términos y Condiciones de Uso de Datos Personales</h2>
          <div className="privacy-content">
            <div className="privacy-block">
              <h3>1. Recopilación de Datos</h3>
              <p>
                Al inscribirte en el curso "{titulo}", recopilamos información personal que incluye: nombre completo, documento de identidad, dirección de correo electrónico y teléfono para gestionar tu participación de forma segura.
              </p>
            </div>
            {/* El resto de bloques legales se mantienen estables usando la variable {titulo} */}
            <div className="privacy-footer">
              <p>Última actualización: Febrero 2026</p>
              <p>Empatía Digital</p>
            </div>
          </div>
        </div>
      </section>

      {/* Botón flotante de inscripción */}
      <button className="floating-inscription-btn" onClick={handleInscription}>
        Inscribirme Ahora
      </button>

    </div>
  );
};

export default Informacion;
