import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../style/Inscription.css';

const Inscription = () => {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedCourse, setEditedCourse] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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
        setImagePreview(data.imagenPrincipal || '');
      } else {
        if (isSuperAdmin) {
          const emptyCourse = {
            titulo: 'Curso sin configurar',
            descripcion: 'Edita esta información para configurar el curso',
            duracion: '0 semanas',
            modalidad: 'Por definir',
            precio: '$0',
            cuposDisponibles: 0,
            horarios: {
              manana: '9:00 - 12:00',
              tarde: '14:00 - 17:00'
            },
            imagenPrincipal: '',
            imagenesGaleria: []
          };
          setCourse(emptyCourse);
          setEditedCourse(emptyCourse);
        } else {
          setErrorMessage('No hay cursos disponibles en este momento');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if (isSuperAdmin) {
        const emptyCourse = {
          titulo: 'Curso sin configurar',
          descripcion: 'Edita esta información para configurar el curso',
          duracion: '0 semanas',
          modalidad: 'Por definir',
          precio: '$0',
          cuposDisponibles: 0,
          horarios: {
            manana: '9:00 - 12:00',
            tarde: '14:00 - 17:00'
          },
          imagenPrincipal: '',
          imagenesGaleria: []
        };
        setCourse(emptyCourse);
        setEditedCourse(emptyCourse);
      } else {
        setErrorMessage('Error al cargar información del curso. Por favor, intenta más tarde.');
      }
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

  const handleCourseEdit = (e) => {
    const { name, value } = e.target;
    
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
      
      // Actualizar preview de imagen
      if (name === 'imagenPrincipal') {
        setImagePreview(value);
      }
    }
  };

  const handleSaveCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const isNewCourse = !course._id;
      const url = isNewCourse 
        ? 'https://empatia-dominio-back.vercel.app/api/courses'
        : `https://empatia-dominio-back.vercel.app/api/courses/${course._id}`;
      
      const method = isNewCourse ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedCourse)
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourse(updatedCourse);
        setEditedCourse(updatedCourse);
        setEditMode(false);
        alert(isNewCourse ? 'Curso creado correctamente' : 'Curso actualizado correctamente');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo guardar el curso'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al guardar el curso');
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

    if (!course._id) {
      setErrorMessage('No se puede inscribir a un curso que aún no está configurado');
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
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!course && !isSuperAdmin) {
    return (
      <div className="inscription-container">
        <div className="no-course-card">
          <div className="no-course-icon">📚</div>
          <h2>No hay cursos disponibles</h2>
          <p>Lo sentimos, actualmente no hay cursos activos para inscripción.</p>
          <p className="contact-text">
            Si tienes alguna consulta, puedes contactarnos o volver más tarde.
          </p>
        </div>
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
                  setImagePreview(course.imagenPrincipal || '');
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      <div className="course-hero">
        {editMode ? (
          <div className="edit-image-container">
            <div className="edit-image-input-group">
              <label htmlFor="imagenPrincipal" className="edit-image-label">
                🖼️ URL de Imagen Principal
              </label>
              <input
                type="url"
                id="imagenPrincipal"
                name="imagenPrincipal"
                value={editedCourse.imagenPrincipal || ''}
                onChange={handleCourseEdit}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="edit-image-url-input"
              />
              <small className="input-hint">
                Pega aquí la URL completa de la imagen (debe empezar con http:// o https://)
              </small>
            </div>
            
            {imagePreview && (
              <div className="image-preview-container">
                <p className="preview-label">Vista previa:</p>
                <img 
                  src={imagePreview} 
                  alt="Preview"
                  className="course-hero-image preview-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="image-error-message" style={{display: 'none'}}>
                  ⚠️ No se pudo cargar la imagen. Verifica que la URL sea correcta.
                </div>
              </div>
            )}
            
            {!imagePreview && (
              <div className="no-image-placeholder">
                <p>📷 No hay imagen. Agrega una URL arriba para ver la vista previa.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {course.imagenPrincipal ? (
              <img 
                src={course.imagenPrincipal} 
                alt={course.titulo}
                className="course-hero-image"
              />
            ) : (
              <div className="no-image-placeholder-public">
                <div className="placeholder-icon">🎓</div>
              </div>
            )}
          </>
        )}
        
        <div className="course-hero-overlay">
          {editMode ? (
            <input
              type="text"
              name="titulo"
              value={editedCourse.titulo}
              onChange={handleCourseEdit}
              className="edit-title-input"
              placeholder="Título del curso"
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
              placeholder="Descripción del curso"
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
                  placeholder="Ej: 8 semanas"
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
                  placeholder="Ej: Presencial, Online"
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
                  placeholder="Ej: $15,000"
                />
              ) : (
                <span className="info-value">{course.precio}</span>
              )}
            </div>
            
            <div className="info-item">
              <span className="info-label">Cupos</span>
              {editMode ? (
                <input
                  type="number"
                  name="cuposDisponibles"
                  value={editedCourse.cuposDisponibles}
                  onChange={handleCourseEdit}
                  className="edit-info-input"
                  placeholder="0"
                />
              ) : (
                <span className="info-value">
                  {course.cuposDisponibles ? `${course.cuposDisponibles} disponibles` : 'Consultar'}
                </span>
              )}
            </div>
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
          
          {!course._id && !isSuperAdmin && (
            <div className="alert alert-warning">
              Las inscripciones estarán disponibles próximamente.
            </div>
          )}

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
                disabled={!course._id}
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
                disabled={!course._id}
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
                disabled={!course._id}
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
                disabled={!course._id}
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
                    disabled={!course._id}
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
                    disabled={!course._id}
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
                    disabled={!course._id}
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
                  disabled={!course._id}
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
              disabled={submitting || !course._id}
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
