import React, { useState, useEffect } from 'react';
import '../style/Cursantes.css';

interface Inscripcion {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  turnoPreferido: 'mañana' | 'tarde' | 'indistinto';
  estado: 'pendiente' | 'confirmado' | 'cancelado';
  notas: string;
  createdAt: string;
  courseId: {
    _id: string;
    titulo: string;
  };
}


interface Estadisticas {
  totalInscripciones: number;
  activos: number;
  confirmados: number;
  pendientes: number;
  cancelados: number;
  cuposDisponibles: number;
  cuposTotales: number;
  porTurno: {
    manana: number;
    tarde: number;
    indistinto: number;
  };
}

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  turnoPreferido: 'mañana' | 'tarde' | 'indistinto';
  notas: string;
}

const Cursantes: React.FC<{ cursoId: string }> = ({ cursoId }) => {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
    turnoPreferido: 'indistinto',
    notas: ''
  });

  const API_URL = 'https://empatia-dominio-back.vercel.app/api/inscripciones';

  useEffect(() => {
    cargarDatos();
  }, [cursoId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      const [inscripcionesRes, estadisticasRes] = await Promise.all([
        fetch(`${API_URL}/curso/${cursoId}`),
        fetch(`${API_URL}/estadisticas/${cursoId}`)
      ]);

      if (!inscripcionesRes.ok || !estadisticasRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const inscripcionesData = await inscripcionesRes.json();
      const estadisticasData = await estadisticasRes.json();

      setInscripciones(inscripcionesData.data);
      setEstadisticas(estadisticasData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId 
        ? `${API_URL}/${editingId}`
        : API_URL;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const body = editingId 
        ? formData
        : { ...formData, courseId: cursoId, aceptaTerminos: true };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar inscripción');
      }

      await cargarDatos();
      cerrarModal();
      alert(editingId ? 'Inscripción actualizada exitosamente' : 'Inscripción registrada exitosamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar inscripción');
      console.error('Error:', err);
    }
  };

  const cambiarEstado = async (id: string, estadoActual: string) => {
    const estados = ['pendiente', 'confirmado', 'cancelado'];
    const indexActual = estados.indexOf(estadoActual);
    const nuevoEstado = estados[(indexActual + 1) % estados.length];
    
    try {
      const response = await fetch(`${API_URL}/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      await cargarDatos();
      alert(`Estado cambiado a ${nuevoEstado}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado');
      console.error('Error:', err);
    }
  };

  const cancelarInscripcion = async (id: string, nombreCompleto: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas cancelar la inscripción de ${nombreCompleto}? Se liberará un cupo.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}/cancelar`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Error al cancelar inscripción');
      }

      const data = await response.json();
      await cargarDatos();
      alert(`Inscripción cancelada. Cupos disponibles: ${data.cuposDisponibles}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cancelar inscripción');
      console.error('Error:', err);
    }
  };

  const eliminarInscripcion = async (id: string, nombreCompleto: string) => {
    if (!window.confirm(`¿ELIMINAR PERMANENTEMENTE la inscripción de ${nombreCompleto}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar inscripción');
      }

      await cargarDatos();
      alert(`${nombreCompleto} eliminado permanentemente`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar inscripción');
      console.error('Error:', err);
    }
  };

  const editarInscripcion = (inscripcion: Inscripcion) => {
    setEditingId(inscripcion._id);
    setFormData({
      nombre: inscripcion.nombre,
      apellido: inscripcion.apellido,
      email: inscripcion.email,
      celular: inscripcion.celular,
      turnoPreferido: inscripcion.turnoPreferido,
      notas: inscripcion.notas || ''
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      celular: '',
      turnoPreferido: 'indistinto',
      notas: ''
    });
  };

  const sincronizarCupos = async () => {
    try {
      const response = await fetch(`${API_URL}/sincronizar/${cursoId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Error al sincronizar cupos');
      }

      await cargarDatos();
      alert('Cupos sincronizados correctamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al sincronizar');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="cursantes-container">
        <div className="loading">Cargando inscripciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cursantes-container">
        <div className="error-message">{error}</div>
        <button onClick={cargarDatos} className="btn-retry">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="cursantes-container">
      <div className="cursantes-header">
        <h2>Gestión de Inscripciones</h2>
        <div className="header-actions">
          <button onClick={sincronizarCupos} className="btn-sync" title="Sincronizar cupos">
            🔄 Sincronizar
          </button>
          <button onClick={() => setShowModal(true)} className="btn-agregar">
            + Nueva Inscripción
          </button>
        </div>
      </div>

      {estadisticas && (
        <div className="estadisticas-cards">
          <div className="stat-card">
            <h3>Total Inscripciones</h3>
            <p className="stat-number">{estadisticas.totalInscripciones}</p>
          </div>
          <div className="stat-card activos">
            <h3>Activos</h3>
            <p className="stat-number">{estadisticas.activos}</p>
          </div>
          <div className="stat-card confirmado">
            <h3>Confirmados</h3>
            <p className="stat-number">{estadisticas.confirmados}</p>
          </div>
          <div className="stat-card pendiente">
            <h3>Pendientes</h3>
            <p className="stat-number">{estadisticas.pendientes}</p>
          </div>
          <div className="stat-card cancelado">
            <h3>Cancelados</h3>
            <p className="stat-number">{estadisticas.cancelados}</p>
          </div>
          <div className="stat-card disponible">
            <h3>Cupos Disponibles</h3>
            <p className="stat-number">
              {estadisticas.cuposDisponibles} / {estadisticas.cuposTotales}
            </p>
          </div>
        </div>
      )}

      {estadisticas && estadisticas.porTurno && (
        <div className="turnos-info">
          <h3>Distribución por Turno (Activos)</h3>
          <div className="turnos-cards">
            <div className="turno-card">
              <span className="turno-emoji">🌅</span>
              <div>
                <p className="turno-label">Mañana</p>
                <p className="turno-number">{estadisticas.porTurno.manana}</p>
              </div>
            </div>
            <div className="turno-card">
              <span className="turno-emoji">🌆</span>
              <div>
                <p className="turno-label">Tarde</p>
                <p className="turno-number">{estadisticas.porTurno.tarde}</p>
              </div>
            </div>
            <div className="turno-card">
              <span className="turno-emoji">⏰</span>
              <div>
                <p className="turno-label">Indistinto</p>
                <p className="turno-number">{estadisticas.porTurno.indistinto}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="cursantes-tabla-container">
        <table className="cursantes-tabla">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Celular</th>
              <th>Turno Preferido</th>
              <th>Estado</th>
              <th>Fecha Inscripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No hay inscripciones registradas
                </td>
              </tr>
            ) : (
              inscripciones.map((inscripcion) => (
                <tr key={inscripcion._id} className={inscripcion.estado === 'cancelado' ? 'row-cancelado' : ''}>
                  <td>{`${inscripcion.nombre} ${inscripcion.apellido}`}</td>
                  <td>{inscripcion.email}</td>
                  <td>{inscripcion.celular}</td>
                  <td>
                    <span className={`turno-badge ${inscripcion.turnoPreferido}`}>
                      {inscripcion.turnoPreferido === 'mañana' ? '🌅 ' : inscripcion.turnoPreferido === 'tarde' ? '🌆 ' : '⏰ '}
                      {inscripcion.turnoPreferido.charAt(0).toUpperCase() + inscripcion.turnoPreferido.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span 
                      className={`estado-badge ${inscripcion.estado}`}
                      onClick={() => cambiarEstado(inscripcion._id, inscripcion.estado)}
                      title="Click para cambiar estado"
                    >
                      {inscripcion.estado.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(inscripcion.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="acciones">
                    <button 
                      onClick={() => editarInscripcion(inscripcion)}
                      className="btn-editar"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {inscripcion.estado !== 'cancelado' && (
                      <button 
                        onClick={() => cancelarInscripcion(inscripcion._id, `${inscripcion.nombre} ${inscripcion.apellido}`)}
                        className="btn-cancelar-inscripcion"
                        title="Cancelar y liberar cupo"
                      >
                        ⛔
                      </button>
                    )}
                    <button 
                      onClick={() => eliminarInscripcion(inscripcion._id, `${inscripcion.nombre} ${inscripcion.apellido}`)}
                      className="btn-eliminar"
                      title="Eliminar permanentemente"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Inscripción' : 'Nueva Inscripción'}</h3>
              <button onClick={cerrarModal} className="btn-close">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="cursante-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ingrese el nombre"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apellido">Apellido *</label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    required
                    placeholder="Ingrese el apellido"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="ejemplo@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="celular">Celular *</label>
                  <input
                    type="tel"
                    id="celular"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: 341-1234567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="turnoPreferido">Turno Preferido *</label>
                <select
                  id="turnoPreferido"
                  name="turnoPreferido"
                  value={formData.turnoPreferido}
                  onChange={handleInputChange}
                  required
                >
                  <option value="mañana">🌅 Mañana</option>
                  <option value="tarde">🌆 Tarde</option>
                  <option value="indistinto">⏰ Indistinto</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notas">Notas (opcional)</label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  placeholder="Información adicional..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={cerrarModal} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cursantes;
