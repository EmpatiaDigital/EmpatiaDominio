import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/SuperAdminCourses.css';

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

  if (loading) {
    return (
      <div className="superadmin-courses-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="superadmin-courses-container">
      <div className="header-section">
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
          <div className="banner-content">
            <div className="banner-badge">
              <span className="pulse-dot"></span>
              CURSO ACTIVO
            </div>
            <h2>{activeCourse.titulo}</h2>
            <p>{activeCourse.descripcion}</p>
            <div className="banner-stats">
              <span>📅 {activeCourse.duracion}</span>
              <span>💰 {activeCourse.precio}</span>
              <span>👥 {activeCourse.cuposDisponibles} cupos</span>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className={`course-card ${course.activo ? 'active' : ''}`}>
            {course.activo && (
              <div className="active-badge">
                <span className="pulse-dot"></span>
                ACTIVO
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
                  <span className="detail-label">Duración:</span>
                  <span className="detail-value">{course.duracion}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Modalidad:</span>
                  <span className="detail-value">{course.modalidad}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Precio:</span>
                  <span className="detail-value">{course.precio}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cupos:</span>
                  <span className="detail-value">{course.cuposDisponibles}</span>
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
              </div>

              <div className="image-upload-section">
                <label className="upload-label">
                  📸 Imagen Principal
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(course._id, e.target.files[0], 'main')}
                    className="file-input"
                  />
                </label>
                <label className="upload-label">
                  🖼️ Galería
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(course._id, e.target.files[0], 'gallery')}
                    className="file-input"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                  placeholder="Ej: Curso de Desarrollo Web"
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
                  placeholder="Describe el curso..."
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
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
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
