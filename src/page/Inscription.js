import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../style/Inscription.css';

const Inscription = () => {
  const { user } = useAuth(); // Obtenemos el usuario autenticado
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedCourse, setEditedCourse] = useState(null);
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

  // Verificar si el usuario es superadmin
  const isSuperAdmin = user && user.role === 'superadmin';

  useEffect(() => {
    fetchActiveCourse();
  }, []);

  const fetchActiveCourse = async () => {
    try {
      const response = await fetch('https://empatia-dominio-back.vercel.app/api/courses/active');
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        setEditedCourse(data);
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar cambios en el modo de edición del curso
  const handleCourseEdit = (e) => {
    const { name, value } = e.target;
    
    // Manejar campos anidados como horarios
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedCourse(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditedCourse(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Guardar cambios del curso
  const handleSaveCourse = async () => {
    try {
      const response = await fetch(`https://empatia-dominio-back.vercel.app/api/courses/${course._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Asumiendo que guardas el token
        },
        body: JSON.stringify(editedCourse)
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourse(updatedCourse);
        setEditMode(false);
        alert('Curso actualizado correctamente');
      } else {
        alert('Error al actualizar el curso');
      }
    } catch (error) {
      alert('Error de conexión al actualizar el curso');
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
      } else {
        setErrorMessage(data.message || 'Error al enviar la inscripción');
      }
    } catch (error) {
      setErrorMessage('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
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
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>¡Inscripción Exitosa!</h2>
          <p>Hemos recibido tu solicitud para el curso <strong>{course.titulo}</strong></p>
          <p>Te contactaremos pronto a tu email <strong>{formData.email}</strong></p>
          <button 
            className="btn-primary"
            onClick={() => setSuccess(false)}
          >
            Nueva Inscripción
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inscription-container">
      {/* Botón de edición para superadmin */}
      {isSuperAdmin && (
        <div className="admin-controls">
          {!editMode ? (
            <button 
              className="btn-edit-admin"
              onClick={() => setEditMode(true)}
            >
              ✏️ Editar Curso
            </button>
          ) : (
            <div className="admin-buttons">
              <button 
                className="btn-save-admin"
                onClick={handleSaveCourse}
              >
                💾 Guardar Cambios
              </button>
              <button 
                className="btn-cancel-admin"
                onClick={() => {
                  setEditMode(false);
                  setEditedCourse(course);
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      <div className="course-hero">
        {course.imagenPrincipal && (
          <img 
            src={editMode ? editedCourse.imagenPrincipal : course.imagenPrincipal} 
            alt={editMode ? editedCourse.titulo : course.titulo}
            className="course-hero-image"
          />
        )}
        <div className="course-hero-overlay">
          {editMode ? (
            <input
              type="text"
              name="titulo"
              value={editedCourse.titulo}
              onChange={handleCourseEdit}
              className="edit-title-input"
            />
          ) : (
            <h1 className="course-title">{course.titulo}</h1>
          )}
          
          {editMode ? (
            <textarea
              name="descripcion"
              value={editedCourse.descripcion}
              onChange={handleCourseEdit}
              className="edit-description-input"
              rows="3"
            />
          ) : (
            <p className="course-description">{course.descripcion}</p>
          )}
        </div>
      </div>

      <div className="form-wrapper">
        <div className="course-info">
          <h2>Información del Curso</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Duración</span>
              {editMode ? (
                <input
                  type="text"
                  name="duracion"
                  value={editedCourse.duracion}
                  onChange={handleCourseEdit}
                  className="edit-info-input"
                />
              ) : (
                <span className="info-value">{course.duracion}</span>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Modalidad</span>
              {editMode ? (
                <input
                  type="text"
                  name="modalidad"
                  value={editedCourse.modalidad}
                  onChange={handleCourseEdit}
                  className="edit-info-input"
                />
              ) : (
                <span className="info-value">{course.modalidad}</span>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Precio</span>
              {editMode ? (
                <input
                  type="text"
                  name="precio"
                  value={editedCourse.precio}
                  onChange={handleCourseEdit}
                  className="edit-info-input"
                />
              ) : (
                <span className="info-value">{course.precio}</span>
              )}
            </div>
            
            {(course.cuposDisponibles || editMode) && (
              <div className="info-item">
                <span className="info-label">Cupos</span>
                {editMode ? (
                  <input
                    type="number"
                    name="cuposDisponibles"
                    value={editedCourse.cuposDisponibles}
                    onChange={handleCourseEdit}
                    className="edit-info-input"
                  />
                ) : (
                  <span className="info-value">{course.cuposDisponibles} disponibles</span>
                )}
              </div>
            )}
          </div>

          {editMode && (
            <div className="edit-horarios">
              <h3>Horarios</h3>
              <div className="horarios-edit-grid">
                <div>
                  <label>Mañana:</label>
                  <input
                    type="text"
                    name="horarios.manana"
                    value={editedCourse.horarios?.manana || ''}
                    onChange={handleCourseEdit}
                    placeholder="9:00 - 12:00"
                    className="edit-info-input"
                  />
                </div>
                <div>
                  <label>Tarde:</label>
                  <input
                    type="text"
                    name="horarios.tarde"
                    value={editedCourse.horarios?.tarde || ''}
                    onChange={handleCourseEdit}
                    placeholder="14:00 - 17:00"
                    className="edit-info-input"
                  />
                </div>
              </div>
            </div>
          )}

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
