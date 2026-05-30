import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../style/Superadmincourses.css'; 
import { Link } from "react-router-dom";

const SuperAdminCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    duracion: '',
    modalidad: '',
    precio: '',
    cuposDisponibles: 30,
    fechaInicio: '',
    horarios: {
      manana: '9:00 - 12:00',
      tarde: '14:00 - 17:00'
    },
    activo: false
  });

  // Protección de ruta - solo superadmin
  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'Solo el SuperAdmin puede acceder a esta sección',
        confirmButtonColor: '#667eea'
      });
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://empatia-dominio-back.vercel.app/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        const active = data.find(c => c.activo);
        setActiveCourse(active);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los cursos',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      titulo: '',
      descripcion: '',
      duracion: '',
      modalidad: '',
      precio: '',
      cuposDisponibles: 30,
      fechaInicio: '',
      horarios: {
        manana: '9:00 - 12:00',
        tarde: '14:00 - 17:00'
      },
      activo: false
    });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      titulo: course.titulo || '',
      descripcion: course.descripcion || '',
      duracion: course.duracion || '',
      modalidad: course.modalidad || '',
      precio: course.precio || '',
      cuposDisponibles: course.cuposDisponibles || 30,
      fechaInicio: course.fechaInicio ? course.fechaInicio.split('T')[0] : '',
      horarios: {
        manana: course.horarios?.manana || '9:00 - 12:00',
        tarde: course.horarios?.tarde || '14:00 - 17:00'
      },
      activo: course.activo || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingCourse
      ? `https://empatia-dominio-back.vercel.app/api/courses/${editingCourse._id}`
      : 'https://empatia-dominio-back.vercel.app/api/courses';
    const method = editingCourse ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: editingCourse ? 'Curso Actualizado' : 'Curso Creado',
          text: editingCourse ? 'El curso se actualizó correctamente' : 'El curso se creó exitosamente',
          confirmButtonColor: '#667eea'
        });
        setShowModal(false);
        fetchCourses();
      } else {
        throw new Error('Error en la operación');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el curso',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleDelete = async (courseId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://empatia-dominio-back.vercel.app/api/courses/${courseId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El curso se eliminó correctamente',
            confirmButtonColor: '#667eea'
          });
          fetchCourses();
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el curso',
          confirmButtonColor: '#667eea'
        });
      }
    }
  };

  const handleToggleStatus = async (courseId) => {
    try {
      const response = await fetch(`https://empatia-dominio-back.vercel.app/api/courses/${courseId}/toggle-status`, {
        method: 'PATCH'
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Estado Actualizado',
          text: 'El estado del curso se actualizó correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        fetchCourses();
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado del curso',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const handleImageUpload = async (courseId, file, type = 'main') => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const endpoint = type === 'main' ? 'main' : 'gallery';
        const response = await fetch(`https://empatia-dominio-back.vercel.app/api/courses/${courseId}/image/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: reader.result })
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Imagen Subida',
            text: 'La imagen se subió correctamente',
            timer: 2000,
            showConfirmButton: false
          });
          fetchCourses();
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo subir la imagen',
          confirmButtonColor: '#667eea'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // NUEVA FUNCIÓN: Enviar reporte por WhatsApp
 // Función mejorada para enviar reporte por WhatsApp
const sendEnrollmentReportWhatsApp = async (courseId) => {
  try {
    // Fetch enrollments for the course
    const response = await fetch(`https://empatia-dominio-back.vercel.app/api/courses/${courseId}/enrollments`);
    
    if (!response.ok) {
      throw new Error('No se pudieron obtener los inscritos');
    }

    const enrollments = await response.json();
    const course = courses.find(c => c._id === courseId);
    
    if (!course) {
      throw new Error('Curso no encontrado');
    }

    // Construir mensaje
    let message = `📊 *REPORTE DE INSCRIPCIONES*\n\n`;
    message += `📚 *Curso:* ${course.titulo}\n`;
    message += `📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}\n`;
    message += `⏰ *Hora:* ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (enrollments.length === 0) {
      message += `ℹ️ *No hay inscripciones registradas*\n\n`;
    } else {
      message += `👥 *TOTAL INSCRITOS: ${enrollments.length}*\n\n`;
      
      // Agrupar por turno
      const porTurno = {
        'mañana': enrollments.filter(e => e.turnoPreferido === 'mañana'),
        'tarde': enrollments.filter(e => e.turnoPreferido === 'tarde'),
        'indistinto': enrollments.filter(e => e.turnoPreferido === 'indistinto')
      };

      // Mostrar inscritos por turno MAÑANA
      if (porTurno['mañana'].length > 0) {
        message += `🌅 *TURNO MAÑANA (${porTurno['mañana'].length}):*\n\n`;
        porTurno['mañana'].forEach((enrollment, index) => {
          message += `${index + 1}. *${enrollment.nombre} ${enrollment.apellido}*\n`;
          message += `   📞 ${enrollment.celular || 'Sin teléfono'}\n`;
          message += `   📧 ${enrollment.email || 'Sin email'}\n`;
          message += `   ✅ Estado: ${enrollment.estado.toUpperCase()}\n\n`;
        });
      }

      // Mostrar inscritos por turno TARDE
      if (porTurno['tarde'].length > 0) {
        message += `🌆 *TURNO TARDE (${porTurno['tarde'].length}):*\n\n`;
        porTurno['tarde'].forEach((enrollment, index) => {
          message += `${index + 1}. *${enrollment.nombre} ${enrollment.apellido}*\n`;
          message += `   📞 ${enrollment.celular || 'Sin teléfono'}\n`;
          message += `   📧 ${enrollment.email || 'Sin email'}\n`;
          message += `   ✅ Estado: ${enrollment.estado.toUpperCase()}\n\n`;
        });
      }

      // Mostrar inscritos por turno INDISTINTO
      if (porTurno['indistinto'].length > 0) {
        message += `🔄 *TURNO INDISTINTO (${porTurno['indistinto'].length}):*\n\n`;
        porTurno['indistinto'].forEach((enrollment, index) => {
          message += `${index + 1}. *${enrollment.nombre} ${enrollment.apellido}*\n`;
          message += `   📞 ${enrollment.celular || 'Sin teléfono'}\n`;
          message += `   📧 ${enrollment.email || 'Sin email'}\n`;
          message += `   ✅ Estado: ${enrollment.estado.toUpperCase()}\n\n`;
        });
      }
    }

    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📊 *RESUMEN DEL CURSO:*\n`;
    message += `• Total inscritos: ${enrollments.length}\n`;
    message += `• Cupos disponibles: ${course.cuposDisponibles}\n`;
    message += `• Precio: ${course.precio}\n`;
    message += `• Duración: ${course.duracion}\n`;
    message += `• Modalidad: ${course.modalidad}\n\n`;
    
    // Estadísticas por turno
    const mananaCount = enrollments.filter(e => e.turnoPreferido === 'mañana').length;
    const tardeCount = enrollments.filter(e => e.turnoPreferido === 'tarde').length;
    const indistintoCount = enrollments.filter(e => e.turnoPreferido === 'indistinto').length;
    
    message += `📈 *DISTRIBUCIÓN POR TURNO:*\n`;
    if (mananaCount > 0) message += `• Mañana: ${mananaCount}\n`;
    if (tardeCount > 0) message += `• Tarde: ${tardeCount}\n`;
    if (indistintoCount > 0) message += `• Indistinto: ${indistintoCount}\n`;
    
    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `_Reporte generado automáticamente_\n`;
    message += `_Sistema de Gestión Empatía Digital_`;

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '5493413559329';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappURL, '_blank');

  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo generar el reporte de inscripciones',
      confirmButtonColor: '#667eea'
    });
  }
};

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando cursos...</p>
      </div>
    );
  }

  return (
    <div className="superadmin-courses-container">
      <div className="header">
        <div className="header-content">
          <h1>🎓 Gestión de Cursos</h1>
          <p>Panel exclusivo de SuperAdmin</p>
        </div>
        <button className="btn-create" onClick={openCreateModal}>
          ➕ Crear Nuevo Curso
        </button>
      </div>

      {/* Active Course Highlight */}
      {activeCourse && (
        <div className="active-course-banner">
          <div className="banner-badge">⭐ CURSO ACTIVO</div>
          <h2>{activeCourse.titulo}</h2>
          <p>{activeCourse.descripcion}</p>
          <div className="banner-stats">
            <span>📅 {activeCourse.duracion}</span>
            <span>💰 {activeCourse.precio}</span>
            <span>👥 {activeCourse.cuposDisponibles} cupos</span>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className={`course-card ${course.activo ? 'active' : ''}`}>
            {course.activo && (
              <div className="active-badge">
                ⭐ ACTIVO
              </div>
            )}
            
            {course.imagenPrincipal && (
              <div className="course-image">
                <img src={course.imagenPrincipal} alt={course.titulo} />
              </div>
            )}

            <div className="course-content">
              <h3>{course.titulo}</h3>
              <p className="course-description">{course.descripcion}</p>
              
              <div className="course-details">
                <div className="detail-item">
                  <span className="label">Duración:</span>
                  <span className="value">{course.duracion}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Modalidad:</span>
                  <span className="value">{course.modalidad}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Precio:</span>
                  <span className="value">{course.precio}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Cupos:</span>
                  <span className="value">{course.cuposDisponibles}</span>
                </div>
              </div>

              <div className="course-actions">
                <button
                  className={`btn-toggle ${course.activo ? 'active' : ''}`}
                  onClick={() => handleToggleStatus(course._id)}
                >
                  {course.activo ? '🔴 Desactivar' : '🟢 Activar'}
                </button>
                
                <button
                  className="btn-edit"
                  onClick={() => openEditModal(course)}
                >
                  ✏️ Editar
                </button>
                
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(course._id)}
                >
                  🗑️ Eliminar
                </button>

                {/* NUEVO BOTÓN: Enviar reporte por WhatsApp */}
                <button
                  className="btn-whatsapp"
                  onClick={() => sendEnrollmentReportWhatsApp(course._id)}
                  title="Enviar lista de inscritos por WhatsApp"
                >
                  📱 Enviar Reporte
                </button>

          <Link to="/cursantes" >Post</Link>
              </div>

              <div className="image-uploads">
                <div className="upload-section">
                  <label>📸 Imagen Principal</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(course._id, e.target.files[0], 'main')}
                    className="file-input"
                  />
                </div>
                <div className="upload-section">
                  <label>🖼️ Galería</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(course._id, e.target.files[0], 'gallery')}
                    className="file-input"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No hay cursos creados</h3>
            <p>Crea tu primer curso para comenzar</p>
            <button className="btn-create" onClick={openCreateModal}>
              Crear Curso
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCourse ? '✏️ Editar Curso' : '➕ Crear Nuevo Curso'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-group">
                <label>Título del Curso *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Curso de Formación en Empatía"
                />
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Descripción detallada del curso"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duración</label>
                  <input
                    type="text"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleInputChange}
                    placeholder="Ej: 3 meses"
                  />
                </div>
                <div className="form-group">
                  <label>Modalidad</label>
                  <input
                    type="text"
                    name="modalidad"
                    value={formData.modalidad}
                    onChange={handleInputChange}
                    placeholder="Ej: Presencial/Online"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="text"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    placeholder="Ej: $50,000"
                  />
                </div>
                <div className="form-group">
                  <label>Cupos Disponibles</label>
                  <input
                    type="number"
                    name="cuposDisponibles"
                    value={formData.cuposDisponibles}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Horario Mañana</label>
                  <input
                    type="text"
                    name="horarios.manana"
                    value={formData.horarios.manana}
                    onChange={handleInputChange}
                    placeholder="9:00 - 12:00"
                  />
                </div>
                <div className="form-group">
                  <label>Horario Tarde</label>
                  <input
                    type="text"
                    name="horarios.tarde"
                    value={formData.horarios.tarde}
                    onChange={handleInputChange}
                    placeholder="14:00 - 17:00"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                  />
                  <span>Activar curso inmediatamente</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editingCourse ? 'Actualizar' : 'Crear'} Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCourses;






