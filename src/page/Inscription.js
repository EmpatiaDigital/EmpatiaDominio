import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Inscription.css';

const Inscription = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Logos de instituciones que avalan el curso
  const avaladores = [
    {
      nombre: 'Institución 1',
      logo: 'https://via.placeholder.com/150x80/4A90E2/ffffff?text=Avalador+1'
    },
    {
      nombre: 'Institución 2',
      logo: 'https://via.placeholder.com/150x80/27AE60/ffffff?text=Avalador+2'
    },
    {
      nombre: 'Institución 3',
      logo: 'https://via.placeholder.com/150x80/E74C3C/ffffff?text=Avalador+3'
    },
    {
      nombre: 'Institución 4',
      logo: 'https://via.placeholder.com/150x80/F39C12/ffffff?text=Avalador+4'
    }
  ];

  useEffect(() => {
    fetchActiveCourse();
  }, []);

  const fetchActiveCourse = async () => {
    try {
      const response = await fetch('https://empatia-dominio-back.vercel.app/api/courses/active');
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        setErrorMessage('No hay cursos disponibles en este momento');
      }
    } catch (error) {
      setErrorMessage('Error al cargar información del curso');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.celular.trim()) {
      newErrors.celular = 'El celular es obligatorio';
    }

    if (!formData.turnoPreferido) {
      newErrors.turnoPreferido = 'Debe seleccionar un turno';
    }

    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debe aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('https://empatia-dominio-back.vercel.app/api/inscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courseId: course._id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          celular: '',
          turnoPreferido: '',
          aceptaTerminos: false
        });
        
        // Redirigir al inicio después de 5 segundos
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } else {
        setErrorMessage(data.message || 'Error al enviar la inscripción');
      }
    } catch (error) {
      setErrorMessage('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVolverInicio = () => {
    navigate('/');
  };

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
        <div className="error-message">{errorMessage}</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="inscription-container">
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon-large">📧</div>
            <h2>¡Inscripción Exitosa!</h2>
            
            <div className="success-content">
              <p className="success-main-text">
                ¡Gracias por inscribirte al curso <strong>{course.titulo}</strong>!
              </p>
              
              <div className="email-notification">
                <div className="email-icon">✉️</div>
                <p>
                  Te hemos enviado un <strong>correo electrónico</strong> a <strong>{formData.email}</strong> con:
                </p>
                <ul className="email-details">
                  <li>✓ Confirmación de tu inscripción</li>
                  <li>✓ Detalles del curso</li>
                  <li>✓ <strong>Enlace al grupo de WhatsApp</strong> del curso</li>
                </ul>
              </div>

              <div className="whatsapp-reminder">
                <div className="whatsapp-icon">📱</div>
                <p>
                  <strong>¡No olvides revisar tu correo y unirte al grupo de WhatsApp!</strong>
                  <br />
                  Allí compartiremos información importante sobre el curso.
                </p>
              </div>

              <div className="redirect-notice">
                <p className="small-text">Serás redirigido al inicio en 5 segundos...</p>
              </div>
            </div>

            <div className="success-actions">
              <button 
                className="btn-primary"
                onClick={handleVolverInicio}
              >
                Volver al Inicio Ahora
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setSuccess(false)}
              >
                Nueva Inscripción
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inscription-container">
      <div className="course-hero">
        {course.imagenPrincipal && (
          <img 
            src={course.imagenPrincipal} 
            alt={course.titulo}
            className="course-hero-image"
          />
        )}
        <div className="course-hero-overlay">
          {/* Sección de avaladores */}
          <div className="avaladores-section">
            <p className="avaladores-title">Curso avalado por:</p>
            <div className="avaladores-logos">
              {avaladores.map((avalador, index) => (
                <div key={index} className="avalador-item">
                  <img 
                    src={avalador.logo} 
                    alt={avalador.nombre}
                    className="avalador-logo"
                  />
                </div>
              ))}
            </div>
          </div>

          <h1 className="course-title">{course.titulo}</h1>
          <h3
            className="course-description"
            style={{ color: "#ffffff" }}>
            {course.descripcion}
          </h3>
        </div>
      </div>

      <div className="form-wrapper">
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
            {course.cuposDisponibles && (
              <div className="info-item">
                <span className="info-label">Cupos</span>
                <span className="info-value">{course.cuposDisponibles} disponibles</span>
              </div>
            )}
          </div>

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

        <div className="form-container">
          <h2>Inscribite Ahora</h2>
          
          {errorMessage && (
            <div className="alert alert-error">
              {errorMessage}
            </div>
          )}

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
                placeholder="tu@email.com"
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
                placeholder="+54 341 123 4567"
              />
              {errors.celular && <span className="error-text">{errors.celular}</span>}
            </div>

            <div className="form-group">
              <label>Turno Preferido *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="turnoPreferido"
                    value="mañana"
                    checked={formData.turnoPreferido === 'mañana'}
                    onChange={handleChange}
                  />
                  <span>Mañana ({course.horarios?.manana || '9:00 - 12:00'})</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="turnoPreferido"
                    value="tarde"
                    checked={formData.turnoPreferido === 'tarde'}
                    onChange={handleChange}
                  />
                  <span>Tarde ({course.horarios?.tarde || '14:00 - 17:00'})</span>
                </label>
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
              </div>
              {errors.turnoPreferido && <span className="error-text">{errors.turnoPreferido}</span>}
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
              {errors.aceptaTerminos && <span className="error-text">{errors.aceptaTerminos}</span>}
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
