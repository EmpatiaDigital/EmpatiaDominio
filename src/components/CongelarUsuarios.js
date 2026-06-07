import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../style/CongelarUsuarios.css';

const CongelarUsuarios = () => {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://empatia-dominio-back.vercel.app/api/active/accounts')
      .then(res => res.json())
      .then(data => {
        const sociosFiltrados = data.filter(u => u.tipo === 'socio');
        setSocios(sociosFiltrados);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar socios:", err);
        setLoading(false);
      });
  }, []);

  const manejarCongelado = async (socio) => {
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: `Congelar a ${socio.nombre} ${socio.apellido}`,
      html: `
        <div class="swal-custom-form">
          <label for="swal-tipo">Medición de tiempo</label>
          <select id="swal-tipo" class="swal2-input">
            <option value="d">Días</option>
            <option value="h">Horas</option>
          </select>
          <label for="swal-tiempo" style="margin-top: 15px;">Cantidad de tiempo</label>
          <input id="swal-tiempo" type="number" min="1" class="swal2-input" placeholder="Ej: 7" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Congelación',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33', // Mantiene la consistencia del peligro/rojo
      focusConfirm: false,
      preConfirm: () => {
        const tipo = document.getElementById('swal-tipo').value;
        const cantidad = document.getElementById('swal-tiempo').value;
        if (!tipo || !cantidad || cantidad <= 0) {
          Swal.showValidationMessage('Por favor, ingresá una cantidad válida.');
        }
        return [tipo, cantidad];
      }
    });

    if (isConfirmed && formValues) {
      const [tipo, cantidad] = formValues;
      const ahora = new Date();
      let tiempoFinal;

      if (tipo.toLowerCase() === 'h') {
        tiempoFinal = new Date(ahora.getTime() + parseInt(cantidad) * 60 * 60 * 1000);
      } else {
        tiempoFinal = new Date(ahora.getTime() + parseInt(cantidad) * 24 * 60 * 60 * 1000);
      }

      try {
        await fetch(`https://empatia-dominio-back.vercel.app/api/active/${socio._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activo: false, hasta: tiempoFinal, tipo: 'socio' })
        });

        Swal.fire('Socio congelado', `La cuenta de ${socio.nombre} fue pausada con éxito.`, 'success');
        setSocios(prev =>
          prev.map(s => s._id === socio._id ? { ...s, active: false, freezeUntil: tiempoFinal } : s)
        );
      } catch (err) {
        Swal.fire('Error', 'No se pudo congelar al usuario', 'error');
      }
    }
  };

  const manejarHabilitar = async (socio) => {
    const confirmacion = await Swal.fire({
      title: `¿Habilitar a ${socio.nombre} ${socio.apellido}?`,
      text: "El socio recuperará el acceso completo de inmediato.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, habilitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745'
    });

    if (confirmacion.isConfirmed) {
      try {
        await fetch(`https://empatia-dominio-back.vercel.app/api/active/${socio._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activo: true, tipo: 'socio' })
        });

        Swal.fire('Socio habilitado', 'El usuario vuelve a estar activo.', 'success');
        setSocios(prev =>
          prev.map(s => s._id === socio._id ? { ...s, active: true, freezeUntil: null } : s)
        );
      } catch (err) {
        Swal.fire('Error', 'No se pudo habilitar al usuario', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando nómina de socios...</p>
      </div>
    );
  }

  return (
    <div className="congelar-container">
      <div className="header-section">
        <h2 className="title">Gestión de Socios</h2>
        <span className="counter-badge">{socios.length} Registrados</span>
      </div>
      
      <ul className="list">
        {socios.map(socio => (
          <li key={socio._id} className="list-item">
            <div className="socio-info">
              <div className="meta-row">
                <p className="nombre">{socio.nombre} {socio.apellido}</p>
                <span className="role-tag">{socio.role || 'Socio'}</span>
              </div>
              
              <div className="status-row">
                <span className="status-label">Estado:</span>
                <span className={`status-badge ${socio.active ? 'activo' : 'inactivo'}`}>
                  {socio.active ? 'Activo' : 'Congelado'}
                </span>
              </div>

              {socio.freezeUntil && !socio.active && (
                <div className="freeze-alert-box">
                  <p className="freeze-until">
                    ❄️ Congelado hasta el <strong>{new Date(socio.freezeUntil).toLocaleDateString("es-AR")}</strong> a las {new Date(socio.freezeUntil).toLocaleTimeString("es-AR", {hour: '2-digit', minute:'2-digit'})}hs
                  </p>
                </div>
              )}
            </div>

            <div className="botones-actions">
              {socio.active ? (
                <button
                  onClick={() => manejarCongelado(socio)}
                  className="btn-action btn-congelar"
                >
                  Congelar Cuenta
                </button>
              ) : (
                <button
                  onClick={() => manejarHabilitar(socio)}
                  className="btn-action btn-habilitar"
                >
                  Habilitar Cuenta
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CongelarUsuarios;
