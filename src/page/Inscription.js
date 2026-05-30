import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import '../style/Inscription.css';
import { Link } from "react-router-dom";

const BASE_URL = 'https://empatia-dominio-back.vercel.app/api';

const Inscription = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inscriptionsStats, setInscriptionsStats] = useState({
    manana: 0,
    tarde: 0,
    indistinto: 0,
    total: 0,
    cuposTotal: 0,
    cuposDisponibles: 0
  });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
    turnoPreferido: '',
    aceptaTerminos: false
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const avaladores = [
    { nombre: 'Institucion 1', logo: '' },
    { nombre: 'Institucion 2', logo: '' },
    { nombre: 'Institucion 3', logo: '' },
    { nombre: 'Institucion 4', logo: '' }
  ];

  // ─── Fetch del curso activo ───────────────────────────────────────────────
  useEffect(() => {
    fetchActiveCourse();
  }, []);

  // ─── Polling de estadísticas cada 10 s ───────────────────────────────────
  useEffect(() => {
    if (!course) return;
    fetchInscriptionsStats();
    const interval = setInterval(fetchInscriptionsStats, 10000);
    return () => clearInterval(interval);
  }, [course]);

  const fetchActiveCourse = async () => {
    try {
      const response = await fetch(`${BASE_URL}/courses/active`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        setCourse(null);
      }
    } catch {
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  // ─── FIX #3 y #4: guardar cuposTotal y cuposDisponibles del backend ──────
  const fetchInscriptionsStats = async () => {
    if (!course) return;
    try {
      const response = await fetch(
        `${BASE_URL}/inscriptions/estadisticas/${course._id}`
      );
      if (response.ok) {
        const data = await response.json();
        const stats = data.data || data;
        setInscriptionsStats({
          manana: stats.porTurno?.manana || 0,
          tarde: stats.porTurno?.tarde || 0,
          indistinto: stats.porTurno?.indistinto || 0,
          total: stats.activos || 0,
          cuposTotal: stats.cuposTotal || course.cuposTotal || 0,
          cuposDisponibles: stats.cuposDisponibles ?? 0
        });
      }
    } catch {
      console.error('Error al cargar estadísticas de inscripciones');
    }
  };

  // ─── FIX #3 y #4: cálculo correcto de cupos por turno ───────────────────
  //  El backend ya devuelve cuántos hay inscriptos por turno.
  //  Se divide el total de cupos en dos mitades iguales y se descuenta
  //  cada inscripto de su turno. Los "indistintos" se reparten equitativamente
  //  entre los dos turnos para el cálculo de disponibilidad visual.
  const getCuposDisponiblesPorTurno = (turno) => {
    const cuposTotal = inscriptionsStats.cuposTotal || course?.cuposTotal || 0;
    if (!cuposTotal) return 0;

    const mitad = Math.floor(cuposTotal / 2);
    const mitadIndistinto = Math.floor(inscriptionsStats.indistinto / 2);

    if (turno === 'manana') {
      return Math.max(0, mitad - inscriptionsStats.manana - mitadIndistinto);
    }
    if (turno === 'tarde') {
      const restoIndistinto = inscriptionsStats.indistinto - mitadIndistinto;
      return Math.max(0, mitad - inscriptionsStats.tarde - restoIndistinto);
    }
    return 0;
  };

  const isTurnoLleno = (turno) => getCuposDisponiblesPorTurno(turno) <= 0;

  const isCursoLleno = () => {
    const cuposTotal = inscriptionsStats.cuposTotal || course?.cuposTotal || 0;
    if (!cuposTotal) return false;
    return inscriptionsStats.total >= cuposTotal;
  };

  // ─── Determinar qué turnos están habilitados por el admin ────────────────
  //  El backend puede devolver course.turnosHabilitados = ['manana','tarde','indistinto']
  //  Si no existe, se habilitan todos por defecto.
  const getTurnosHabilitados = () => {
    if (course?.turnosHabilitados && course.turnosHabilitados.length > 0) {
      return course.turnosHabilitados;
    }
    return ['manana', 'tarde', 'indistinto'];
  };

  const renderTurnoLabel = (turno) => {
    const labels = { manana: 'Mañana', tarde: 'Tarde', indistinto: 'Indistinto' };
    return labels[turno] || turno;
  };

  const renderTurnoText = (turno) => {
    const lleno = isTurnoLleno(turno);
    return lleno ? `${renderTurnoLabel(turno)} - Cupo Lleno` : renderTurnoLabel(turno);
  };

  // ─── Handlers del formulario ──────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim())    newErrors.nombre    = 'El nombre es obligatorio';
    if (!formData.apellido.trim())  newErrors.apellido  = 'El apellido es obligatorio';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.celular.trim())       newErrors.celular       = 'El celular es obligatorio';
    if (!formData.turnoPreferido)       newErrors.turnoPreferido = 'Debe seleccionar un turno';
    if (!formData.aceptaTerminos)       newErrors.aceptaTerminos = 'Debe aceptar los términos y condiciones';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── FIX #1 y #2: URL correcta con backtick → /api/inscriptions ─────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    setSubmitting(true);

    try {
      // ✅ FIX #1: backtick en lugar de comilla simple
      // ✅ FIX #2: endpoint correcto → /api/inscriptions (POST)
      const response = await fetch(`${BASE_URL}/inscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, courseId: course._id })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchInscriptionsStats();

        // ✅ FIX #5: sin setTimeout extra — el .then() del Swal maneja todo
        await Swal.fire({
          icon: 'success',
          title: 'Inscripción Exitosa',
          html: `
            <div style="text-align: left; padding: 20px;">
              <p style="font-size: 16px; margin-bottom: 15px;">
                Gracias por inscribirte al curso <strong>${course.titulo}</strong>
              </p>
              <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin-bottom: 10px;">
                  Te hemos enviado un <strong>correo electrónico</strong> a <strong>${formData.email}</strong> con:
                </p>
                <div style="margin-left: 20px;">
                  <p style="margin: 5px 0;">- Confirmación de tu inscripción</p>
                  <p style="margin: 5px 0;">- Detalles del curso</p>
                  <p style="margin: 5px 0;">- <strong>Enlace al grupo de WhatsApp</strong> del curso</p>
                </div>
              </div>
              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin-top: 10px;">
                  <strong>No olvides revisar tu correo y unirte al grupo de WhatsApp.</strong>
                  <br />
                  Allí compartiremos información importante sobre el curso.
                </p>
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">
                Serás redirigido al inicio en 10 segundos...
              </p>
            </div>
          `,
          confirmButtonText: 'Volver al Inicio Ahora',
          confirmButtonColor: '#3085d6',
          showCancelButton: true,
          cancelButtonText: 'Nueva Inscripción',
          cancelButtonColor: '#6c757d',
          allowOutsideClick: false,
          timer: 10000,
          timerProgressBar: true
        }).then((result) => {
          if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            // ✅ FIX #5: solo navega si el usuario confirmó O se agotó el timer
            navigate('/informacion');
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // El usuario eligió "Nueva Inscripción" → limpiar formulario
            setFormData({
              nombre: '',
              apellido: '',
              email: '',
              celular: '',
              turnoPreferido: '',
              aceptaTerminos: false
            });
            setErrors({});
          }
        });

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al inscribirse',
          text: data.message || 'Error al enviar la inscripción. Por favor, intente nuevamente.',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Error de conexión. Por favor, intente nuevamente.',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Acciones rápidas ─────────────────────────────────────────────────────
  const handleVolverInicio = () => navigate('/');

  const handleConsultarWhatsApp = () => {
    const mensaje = encodeURIComponent(
      'Hola! Me interesa obtener información sobre próximos cursos. ¿Podrían ayudarme?'
    );
    window.open(`https://wa.me/5493413559329?text=${mensaje}`, '_blank');
  };

  // ─── Estados de carga / sin curso / curso lleno ───────────────────────────
  if (loading) {
    return (
      <div className="inscription-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="inscription-container">
        <div className="no-courses-container">
          <div className="no-courses-content">
            <div className="no-courses-icon">Cursos</div>
            <h2 className="no-courses-title">Por el momento no hay cursos disponibles</h2>
            <p className="no-courses-text">Estamos preparando nuevos cursos para ti.</p>
            <p className="no-courses-subtext">
              Si deseas obtener información sobre próximas fechas y nuevos cursos,
              <br />
              <strong>contáctanos por WhatsApp.</strong>
            </p>
            <div className="no-courses-actions">
              <button className="btn-whatsapp" onClick={handleConsultarWhatsApp}>
                Consultar por WhatsApp
              </button>
              <button className="btn-volver" onClick={handleVolverInicio}>
                Volver al Inicio
              </button>
            </div>
            <div className="contact-info">
              <p>También puedes contactarnos al:</p>
              <a href="tel:+5493413559329" className="phone-link">+54 9 341 355 9329</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCursoLleno()) {
    return (
      <div className="inscription-container">
        <div className="no-courses-container">
          <div className="no-courses-content">
            <div className="no-courses-icon">Curso Completo</div>
            <h2 className="no-courses-title">Curso Completo</h2>
            <p className="no-courses-text">
              El curso <strong>"{course.titulo}"</strong> ha alcanzado su capacidad máxima de inscripciones.
            </p>
            <p className="no-courses-subtext">
              ¿Te interesa este curso? Contáctanos por WhatsApp para conocer las próximas fechas.
            </p>
            <div className="no-courses-actions">
              <button className="btn-whatsapp" onClick={handleConsultarWhatsApp}>
                Consultar Próximas Fechas
              </button>
              <button className="btn-volver" onClick={handleVolverInicio}>
                Volver al Inicio
              </button>
            </div>
            <div className="contact-info">
              <p>También puedes contactarnos al:</p>
              <a href="tel:+5493413559329" className="phone-link">+54 9 341 355 9329</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Cupos totales usados para la barra de progreso ───────────────────────
  const cuposTotales = inscriptionsStats.cuposTotal || course.cuposTotal || 0;
  const cuposRestantes = Math.max(0, cuposTotales - inscriptionsStats.total);
  const porcentajeOcupado = cuposTotales > 0
    ? Math.min((inscriptionsStats.total / cuposTotales) * 100, 100)
    : 0;

  // ─── Turnos que el admin decidió habilitar ────────────────────────────────
  const turnosHabilitados = getTurnosHabilitados();

  // ─── Render principal ─────────────────────────────────────────────────────
  return (
    <div className="inscription-container">

      {/* Hero con imagen y datos del curso */}
      <div className="course-hero">
        {course.imagenPrincipal && (
          <img
            src={course.imagenPrincipal}
            alt={course.titulo}
            className="course-hero-image"
          />
        )}
        <div className="course-hero-overlay">
          <div className="avaladores-section">
            <p className="avaladores-title">Curso avalado por:</p>
            <div className="avaladores-logos">
              {avaladores.map((avalador, index) => (
                <div key={index} className="avalador-item">
                  {avalador.logo ? (
                    <img src={avalador.logo} alt={avalador.nombre} className="avalador-logo" />
                  ) : (
                    <div className="avalador-placeholder">{avalador.nombre}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <h1 className="course-title">{course.titulo}</h1>
          <h4 className="course-description" style={{ color: '#ffffff' }}>
            {course.descripcion}
          </h4>

          <Link to="/informacion" className="btn-conocer-mas">
            Conocer Más
          </Link>
        </div>
      </div>

      <div className="form-wrapper">

        {/* Info del curso + barra de cupos */}
        <div className="course-info">
          <h2>Información del Curso</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Duración</span>
              <span className="info-value">{course.duracion}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Modalidad</span>
              <span className="info-value">{course.modalidad}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Precio</span>
              <span className="info-value">{course.precio}</span>
            </div>
            {cuposTotales > 0 && (
              <div className="info-item">
                <span className="info-label">Cupos Totales</span>
                <span className="info-value">{cuposTotales} cupos</span>
              </div>
            )}
          </div>

          {/* Barra de progreso de cupos */}
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#fafafa'
            }}
          >
            <div
              style={{
                backgroundColor: '#e9e9e9',
                borderRadius: '99px',
                height: '8px',
                overflow: 'hidden',
                marginBottom: '10px'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${porcentajeOcupado}%`,
                  borderRadius: '99px',
                  backgroundColor: porcentajeOcupado >= 80 ? '#e74c3c' : '#888',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>

            <p style={{ fontSize: '0.9rem', color: '#444', marginBottom: '8px' }}>
              <strong>{cuposRestantes}</strong> cupos disponibles de <strong>{cuposTotales}</strong>
            </p>

            {/* Solo mostrar desglose por turno si hay más de un turno habilitado */}
            {turnosHabilitados.filter(t => t !== 'indistinto').length > 1 && (
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#666' }}>
                {turnosHabilitados.includes('manana') && (
                  <span>
                    Mañana: <strong>{getCuposDisponiblesPorTurno('manana')}</strong> disponibles
                  </span>
                )}
                {turnosHabilitados.includes('tarde') && (
                  <span>
                    Tarde: <strong>{getCuposDisponiblesPorTurno('tarde')}</strong> disponibles
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Galería */}
          {course.imagenesGaleria && course.imagenesGaleria.length > 0 && (
            <div className="gallery">
              <h3>Galería</h3>
              <div className="gallery-grid">
                {course.imagenesGaleria.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`Imagen ${index + 1}`}
                    className="gallery-image"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formulario de inscripción */}
        <div className="form-container">
          <h2>Inscribite Ahora</h2>

          <form onSubmit={handleSubmit} className="inscription-form">

            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={errors.nombre ? 'error' : ''}
                placeholder="Tu nombre"
              />
              {errors.nombre && <span className="error-text">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido *</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={errors.apellido ? 'error' : ''}
                placeholder="Tu apellido"
              />
              {errors.apellido && <span className="error-text">{errors.apellido}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="@email.com"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="celular">Celular *</label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                className={errors.celular ? 'error' : ''}
                placeholder="+54 xxx xxxx xxxx"
              />
              {errors.celular && <span className="error-text">{errors.celular}</span>}
            </div>

            {/* ─── FIX turnos: solo se renderizan los habilitados por el admin ─── */}
            <div className="form-group">
              <label>Turno Preferido *</label>
              <div className="radio-group">

                {turnosHabilitados.includes('manana') && (
                  <label className={`radio-label ${isTurnoLleno('manana') ? 'turno-lleno' : ''}`}>
                    <input
                      type="radio"
                      name="turnoPreferido"
                      value="manana"
                      checked={formData.turnoPreferido === 'manana'}
                      onChange={handleChange}
                      disabled={isTurnoLleno('manana')}
                    />
                    <span>{renderTurnoText('manana')}</span>
                    {!isTurnoLleno('manana') && (
                      <span className="cupos-restantes">
                        ({getCuposDisponiblesPorTurno('manana')} cupos)
                      </span>
                    )}
                  </label>
                )}

                {turnosHabilitados.includes('tarde') && (
                  <label className={`radio-label ${isTurnoLleno('tarde') ? 'turno-lleno' : ''}`}>
                    <input
                      type="radio"
                      name="turnoPreferido"
                      value="tarde"
                      checked={formData.turnoPreferido === 'tarde'}
                      onChange={handleChange}
                      disabled={isTurnoLleno('tarde')}
                    />
                    <span>{renderTurnoText('tarde')}</span>
                    {!isTurnoLleno('tarde') && (
                      <span className="cupos-restantes">
                        ({getCuposDisponiblesPorTurno('tarde')} cupos)
                      </span>
                    )}
                  </label>
                )}

                {turnosHabilitados.includes('indistinto') && (
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="turnoPreferido"
                      value="indistinto"
                      checked={formData.turnoPreferido === 'indistinto'}
                      onChange={handleChange}
                    />
                    <span>Indistinto</span>
                  </label>
                )}

              </div>
              {errors.turnoPreferido && (
                <span className="error-text">{errors.turnoPreferido}</span>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="aceptaTerminos"
                  checked={formData.aceptaTerminos}
                  onChange={handleChange}
                />
                <span>
                  Acepto los términos y condiciones y el tratamiento de mis datos personales
                  conforme a la política de privacidad *
                </span>
              </label>
              {errors.aceptaTerminos && (
                <span className="error-text">{errors.aceptaTerminos}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Enviando...' : 'Inscribirme'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
