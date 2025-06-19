// CongelarUsuarios.jsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../style/CongelarUsuarios.css';  // <-- Importamos el CSS

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
      });
  }, []);

  const manejarCongelado = async (socio) => {
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: `Congelar a ${socio.nombre} ${socio.apellido}`,
      html:
        '<input id="swal-tipo" class="swal2-input" placeholder="Horas o Días (h/d)" />' +
        '<input id="swal-tiempo" class="swal2-input" placeholder="Cantidad" />',
      showCancelButton: true,
      confirmButtonText: 'Congelar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const tipo = document.getElementById('swal-tipo').value;
        const cantidad = document.getElementById('swal-tiempo').value;
        if (!tipo || !cantidad) {
          Swal.showValidationMessage('Ambos campos son requeridos');
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

      await fetch(`https://empatia-dominio-back.vercel.app/api/active/${socio._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false, hasta: tiempoFinal, tipo: 'socio' })
      });

      Swal.fire('Socio congelado', '', 'success');
      setSocios(prev =>
        prev.map(s => s._id === socio._id ? { ...s, active: false, freezeUntil: tiempoFinal } : s)
      );
    }
  };

  const manejarHabilitar = async (socio) => {
    const confirmacion = await Swal.fire({
      title: `¿Habilitar a ${socio.nombre} ${socio.apellido}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      await fetch(`https://empatia-dominio-back.vercel.app/api/active/${socio._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: true, tipo: 'socio' })
      });

      Swal.fire('Socio habilitado', '', 'success');
      setSocios(prev =>
        prev.map(s => s._id === socio._id ? { ...s, active: true, freezeUntil: null } : s)
      );
    }
  };

  if (loading) return <p className="loading">Cargando socios...</p>;

  return (
    <div className="container">
      <h2 className="title">Gestión de Socios</h2>
      <ul className="list">
        {socios.map(socio => (
          <li key={socio._id} className="list-item">
            <div>
              <p className="nombre">{socio.nombre} {socio.apellido}</p>
              <p className="nombre"> Rol:{socio.role}</p>
              <p>
                Estado:
                <strong className={socio.active ? 'activo' : 'inactivo'}>
                  {socio.active ? 'Activo' : 'Inactivo'}
                </strong>
                {socio.freezeUntil && !socio.active && (
                <span className="freeze-until">
                Se congeló en la hora {new Date(socio.freezeUntil).toLocaleTimeString("es-AR")} hasta {new Date(socio.freezeUntil).toLocaleDateString("es-AR")}
              </span>
              
                )}
              </p>
            </div>
            <div className="botones">
              <button
                onClick={() => manejarCongelado(socio)}
                className="btn congelar"
              >
                Congelar
              </button>
              <button
                onClick={() => manejarHabilitar(socio)}
                className="btn habilitar"
              >
                Habilitar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CongelarUsuarios;
