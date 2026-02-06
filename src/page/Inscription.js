import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import '../style/Inscription.css';
import { Link } from "react-router-dom";

const Inscription = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inscriptionsStats, setInscriptionsStats] = useState({
    manana: 0,
    tarde: 0,
    indistinto: 0,
    total: 0
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


  // Logos de instituciones que avalan el curso
 const avaladores = [
    {
      nombre: 'Institución 1',
      logo: 'data:image/png;base64,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'
    },
    {
      nombre: 'Institución 2',
      logo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxARBhUQEBEVEBAWDQ8QEBAXEhkQERUPFREWGBcVExUaHSogGSYmGxMYJzMtJSkrLjouGCAzODMtQyg5LisBCgoKDg0NGxAQGTcdHR81LS03Ny03Ky83NystMi0rKzgtKy0tLCsrNy0tMTgrLTcrKysrNS0tLS0rLSsrLS0rLf/AABEIAMQBAQMBIgACEQEDEQH/xAAbAAEBAAIDAQAAAAAAAAAAAAABAAYHAwQFAv/EAEQQAAICAQIDBAUIBQoHAAAAAAABAgMRBBIFITEGBxNRIkFhcbEUMlJyc4GRshYmM0J0IzQ2YnWSobO0wRUkJYKiwtH/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/xAAmEQEAAgIBAgQHAAAAAAAAAAAAAQIDERIEIRMyUXEFIyQxM4HR/9oADAMBAAIRAxEAPwDciFAhQCiJEAiAgIgICREAiAgKFAhQCiRIkAsGLBgDAWAAREAAIAACAAAgBMGLBgDBiwYEREBIUCFAKIkQCICAiAgJEQCICAoUCFAKJEiQCwYsGAMBYABEQAAgAAIAACAEwYsGAMGLBgREQEhQIUAoiRAIgICICAkRAIgIChQIUAokSJALBiwYAwFgAERAACAAAgAAIATBiwYAwYsGBERASFAhQCiJEAiAgIgICREAiAgKFAhQCiRIkAsGLBgDAWAAREAAIAACAAAgBMGLBgDBiwYEREBIUCFAKIkQCICAigMK7yeLWVV10VycFYpysaeG4xaSjny5vP3AZuRr3uslnUX/AFKfjMyjinaejT6x1WKxyUYye2Kaw+nPJyZiPuhe9aRu06e3kty8zxtLrdHxDTuOFPHzoTjicc+tf/UzBO0fCvkvEXWucGt9cn12+T9qf+xC2TUbjvCjN1PCvOI3DaqZ9IxXu8f/AEef8RL8kDJrroQrcpyUIrrKTUYr3tkqzuNrsV+dIt6uVEjztPx3R2W7Iammcs4UVbFtv2LPM9EksLBnX1GuprntsthB4ziU4xePPDYanXU16dWWWwhBpNTlNRi01yw2+YHYYHW0XEqLk3TdXbjrsmp49+HyDW8T09OPGurqz03zUG/cmwOyRw6XV121b6rIWR+lGSmvxRygQHBrNdTTHN1sKl6nOahn3ZZxaPiumulim+q1+UbIyf4J5A7YCAAAgBMGLBgDBiwYEREBIUCFAKIkQCICAmtu9mWNdp/sbfzxNkms+97+faf7G788QOx3SyzfqPqU/GZ1+3s8dpJfZVfBnJ3Q/ttT9Wn4zOp3hyx2nl9jT8GU9R5Xn/Ep1h/bn7BWv9JIpPrVan7VhP4pHp95rxfQ/wCpb8YHid3ss9qYfZXflPX71ZYs0/1bvjApifkyx0t9Db3/AI9Xu4mv+BTb5Jaibb8lsia/4zxTUcV4/GuDeyVuzT1ZxCMfpy9uObf3GY9i232H1O3r/wAzj3+EjXnZuvUS4tBaSW29qXhvKj+6883y6ZNOLyQ9PpPwV9mT8Z7t7aeFyuherpQg5zr8PZyXN7HuecLzR6vdd2jssslo7pObVbspm3mW1NKUM+vqmvvOCfDO0Tg07U00014lfR/9p89jex2u0vaGu6yEI1x3qbVik9rg10XXm0WNLz+9pfrLH+Fh+eZ98D7IaniWgjqL9R4UFBVUR2eJ/JwW1YjuSiuXvfU+O9n+ksf4WH55mwuxK/VLTfw8X8Tg05b4/D+PyUJ7bqbHHevmtYT5r1pprkzKtH2C1Os0fyu/U7brY+JGMoObaksx3S3LbnPRLl/gY/3gf0v1P14f5FZu7RrGlgl0VcEvdtR0aT7F8Qt03aeuKbip3xouhnk1KW3n7m8r3G0+2PHfkXBnbFJ2ykq6k+m9+t+xJNmptJ/TOP8Aai/1JmXfApfJtO/3fEtT+ttjj/BMDFOB8E1XFNfObszjHi32Zlhvokl19ywjsdpOxmo0NCvVitrUknZFOuUJN4Tay/X60zMO6dx/R6ePnfKp7v7kMZ+49vtm4rspqd3T5PL+88bf/LBweN3d9pZ6rTSoue66uKkp+udTeMv2p4z70Ziai7rE/wBKeXT5Ldu926H++DboAAgBMGLBgDBiwYEREBIUCFAKIkQCICAms+97+faf7G788TZhgvePwDVarV0y09XiKNdik90Y4blFr5zXkB0e6H9tqfq0/GZ5/eQ/1pl9hT8GZF3b8C1Oltueoq8NSjVt9KMs4cs/Nb8zLtRw3T2W77KarJYS3SrjOWF0WWivLTnGmXq+nnPj4xOmtu7PSTlx92pehCqalL1bpYSXxf3Hf717F8ooj61C2TXsbjj4Mzm9qjS4oo3/AEaq1CtZ9uWkjC/0T1et4u9RrmqYNpeFGW+SgukE1yS9vXmyq2OYx8I7sd+ntTB4FO8y9bu20zj2ZzJcp22SSfrjyj/6swDj/A9RwzjStqUvCjZvouS3RSzyjPyaXLn1XvNz6emMKIwhFRhGKjGKWEopYSRyOKaw1leXUvrHGNPSw4/DxxX0ah4r3jai/hjoVcKpTjslZGTcsPrsi+mfe+pkPdrwzWqT1GpstVWxxqpnKXpN49Nxb5JLp78ma18OojZujTXGX0lXFP8AHB2iSxqLvYX6yx/hYfnmbC7FL9U9N/DwPalWm+aT+7JJYXIDRneAn+l+p5fvw/yKzd2l/m0PqQ+CPuVa8l+AgaI0if6Zx/tOP+oNudruBrW8HlTlRsUlOqT6Kxep+xptfeex4az0X4H0Bo7h/ENbwriEk4OtvCnXOOa5pdGn6+vWLObjfanV8RUaFBKO5PwaouTlJdN3VvH4G5rqYzjicVNeUkpL8GfFGlrr/Z1wh9WCh8EBjHYHszLR6OVlyXyixJSWc7K1zUM+eeb+7yMrEAABACYMWDAGDFgwIiICQoEKAURIgEQEBEBASIgEQEBQoEKAUSJEgFgxYMAYCwACIgABAAAQAAEAJgxYMAYMWDAiIgJCgQoBREiARAQEQEBIiARAQFCgQoBRIkSAWDFgwBgLAAIiAAEAABAAAQAmDFgwBgxYMCIiAkKBCgFESIBEBARAQEiIBEBAUKBCgFEiRIBYMWDAGAsAAiIAAQAAEAABACYMWDAGDFgwIiICQoEKAURIgEQEBEBASIgEQEBQoEKAUSJEgFgxYMAYCwACIgABAAAQAAEAJgxYMAYMWDAiIgPtVS8h8KXkdkgOt4b8h8N+R2CA6/hvyHw35HOQHDsZbGcxAcWxjtZyHkcd4pKmO1JelVc1Y5YUZxg3FKOHlt+eFy6+oD1NpYPAq7SP5k60rU6YNeItrnZOuKw8eV0W+Xn16vqaTtTf8mhOymuTnp9LOKrtk/5S2M292YeisQfnzwuecoMqSFI8WHHZO1fyKjB3+CpStxiWI8pJReMymkuq681yz0Ke1zXD4WW1LLornPZZn051SsW1SS9HEHl+p+eG0GVYI8ThnGJT4vZRNRTXpRakpVpKFeYwlhb3ull8lhNHDZ2nSipeEsNWT/ard4UJxg/Rx8/MuUfY+eeQGRBg8Th3HnbqoQdWxTS2y8RS5yrdkcrH0YvPtx16rscS11kOHqyEVW/HrjJW9fDdqg2lGXVrpz9eX5Aek0WDHuIcY1FWosUdlsVKFUEobGrpJze6UrVFqNaz+7lySyj5XHrG5y3KEPAWoobp8RyqxDk0rc7m5pYajzfLIGRYLaYvd2j1FdyrsqzYtO00qp1xnq99EcwnN7VXm/GW/wB18+meOvtNfZfiqMMOEox3RUH8ojUpNftfPP8AUxjFj6AZXtYbGeRw3i1lmtqi3Dw56bUTfo7bPGqurg1hTlFL030cs4yn5+4BxbGGxnMQHBsfkHhvyOwQHX8N+ReG/I7BAdbwpeQeFLyO0QHV8KXl8AO2QEREBERAREQEREBHFZTFzTlFNrOG0m1nrgiAHp4OSbhFtPKe1ZT5c0/uX4Hz8kq248OGMYxtWMZzjp58xID68CGU9scp5i9q5N+teR8x01afKEV6LXzV0b5r7xICWmrUElCKSxhbVj8A+TV5zsjndvztWd/0vf7RID6jVFPlFLHTkuXLHL7ivphOGJxjNZziSUlnzwwIClRB17XCLi3lxcU037UCogm2oRy2nJ7VltdM+eBIBsrjJYlFSWGsNZ5Pqv8ABHw9LX9CPzdnzV8z6Pu9hEArTV+IpbI7ksRltWUvJP1dTmIgIiICIiAiIgIiICIiA//Z'
    },
    {
      nombre: 'Institución 3',
      logo: 'data:image/png;base64,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'
    },
    {
      nombre: 'Institución 4',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmcdLs-UrTNtOWA8vLM9PAi-PwT7Re67VZyw&s'
    }
  ];

  useEffect(() => {
    fetchActiveCourse();
    fetchInscriptionsStats();
  }, []);

  const fetchActiveCourse = async () => {
    try {
      const response = await fetch('https://empatia-dominio-back.vercel.app/api/courses/active');
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No hay cursos disponibles en este momento',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar información del curso',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInscriptionsStats = async () => {
    try {
      const response = await fetch('https://empatia-dominio-back.vercel.app/api/inscriptions/stats');
      if (response.ok) {
        const data = await response.json();
        setInscriptionsStats(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas de inscripciones');
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
        // Mostrar modal de éxito con SweetAlert2
        await Swal.fire({
          icon: 'success',
          title: '¡Inscripción Exitosa!',
          html: `
            <div style="text-align: left; padding: 20px;">
              <p style="font-size: 16px; margin-bottom: 15px;">
                ¡Gracias por inscribirte al curso <strong>${course.titulo}</strong>!
              </p>
              <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin-bottom: 10px;">
                  Te hemos enviado un <strong>correo electrónico</strong> a <strong>${formData.email}</strong> con:
                </p>
                <div style="margin-left: 20px;">
                  <p style="margin: 5px 0;">✓ Confirmación de tu inscripción</p>
                  <p style="margin: 5px 0;">✓ Detalles del curso</p>
                  <p style="margin: 5px 0;">✓ <strong>Enlace al grupo de WhatsApp</strong> del curso</p>
                </div>
              </div>
              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="text-align: center; font-size: 30px; margin: 0;">📱</p>
                <p style="margin-top: 10px;">
                  <strong>¡No olvides revisar tu correo y unirte al grupo de WhatsApp!</strong>
                  <br />
                  Allí compartiremos información importante sobre el curso.
                </p>
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">
                Serás redirigido al inicio en 5 segundos...
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
          if (result.isConfirmed) {
            navigate('/');
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Limpiar formulario para nueva inscripción
            setFormData({
              nombre: '',
              apellido: '',
              email: '',
              celular: '',
              turnoPreferido: '',
              aceptaTerminos: false
            });
            setErrors({});
            fetchInscriptionsStats(); // Actualizar estadísticas
          }
        });

        // Si no interactúa, redirigir automáticamente después de 10 segundos
        setTimeout(() => {
          navigate('/');
        }, 10000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al inscribirse',
          text: data.message || 'Error al enviar la inscripción. Por favor, intente nuevamente.',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error) {
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

  const handleVolverInicio = () => {
    navigate('/');
  };

  // Función para verificar si un turno está lleno
  // REGLA: Un turno está lleno cuando alcanza la MITAD de los cupos totales
  // Solo cuenta los inscritos específicos de ese turno (NO cuenta indistinto)
  const isTurnoLleno = (turno) => {
    if (!course || !course.cuposDisponibles) return false;
    
    // Calcular la mitad de los cupos (redondeado hacia arriba)
    const mitadCupos = Math.ceil(course.cuposDisponibles / 2);
    
    if (turno === 'manana') {
      // Solo se bloquea si las inscripciones de MAÑANA llegan a la mitad
      return inscriptionsStats.manana >= mitadCupos;
    } else if (turno === 'tarde') {
      // Solo se bloquea si las inscripciones de TARDE llegan a la mitad
      return inscriptionsStats.tarde >= mitadCupos;
    }
    
    return false;
  };

  // Función para renderizar el texto del turno
  const renderTurnoText = (turno) => {
    const lleno = isTurnoLleno(turno);
    const turnoNombre = turno === 'manana' ? 'Mañana' : 'Tarde';
    
    if (lleno) {
      return `${turnoNombre} - Cupo Lleno`;
    }
    
    return turnoNombre;
  };

  // Función para obtener cupos disponibles por turno
  const getCuposDisponiblesPorTurno = (turno) => {
    if (!course || !course.cuposDisponibles) return 0;
    
    const mitadCupos = Math.ceil(course.cuposDisponibles / 2);
    
    if (turno === 'manana') {
      return mitadCupos - inscriptionsStats.manana;
    } else if (turno === 'tarde') {
      return mitadCupos - inscriptionsStats.tarde;
    }
    
    return 0;
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
        <div className="error-message">No hay cursos disponibles</div>
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
                  {avalador.logo && (
                    <img 
                      src={avalador.logo} 
                      alt={avalador.nombre}
                      className="avalador-logo"
                    />
                  )}
                  {!avalador.logo && (
                    <div className="avalador-placeholder">
                      {avalador.nombre}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <h1 className="course-title">{course.titulo}</h1>
          <h4 className="course-description" style={{ color: "#ffffff" }}>
            {course.descripcion}
          </h4>
          
          {/* Botón Conocer Más */}
          <Link to="/informacion" className="btn-conocer-mas">
            Conocer Más
          </Link>
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
                <span className="info-label">Cupos Totales</span>
                <span className="info-value">{course.cuposDisponibles} disponibles</span>
              </div>
            )}
          </div>

          {/* Mostrar estadísticas de cupos por turno */}
          {course.cuposDisponibles && (
            <div className="cupos-info">
              <h3>Disponibilidad por Turno</h3>
              <div className="cupos-grid">
                <div className="cupo-item">
                  <span className="cupo-label">Mañana:</span>
                  <span className={`cupo-value ${isTurnoLleno('manana') ? 'lleno' : 'disponible'}`}>
                    {getCuposDisponiblesPorTurno('manana')} de {Math.ceil(course.cuposDisponibles / 2)} disponibles
                  </span>
                </div>
                <div className="cupo-item">
                  <span className="cupo-label">Tarde:</span>
                  <span className={`cupo-value ${isTurnoLleno('tarde') ? 'lleno' : 'disponible'}`}>
                    {getCuposDisponiblesPorTurno('tarde')} de {Math.ceil(course.cuposDisponibles / 2)} disponibles
                  </span>
                </div>
                <div className="cupo-item">
                  <span className="cupo-label">Indistinto:</span>
                  <span className="cupo-value disponible">
                    {inscriptionsStats.indistinto} inscripciones
                  </span>
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

            <div className="form-group">
              <label>Turno Preferido *</label>
              <div className="radio-group">
                <label className={`radio-label ${isTurnoLleno('manana') ? 'turno-lleno' : ''}`}>
                  <input
                    type="radio"
                    name="turnoPreferido"
                    value="mañana"
                    checked={formData.turnoPreferido === 'mañana'}
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
