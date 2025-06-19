import React, { useEffect, useState } from "react";
import "../style/ModalActividades.css";

const API_URL = "https://empatia-dominio-back.vercel.app/api/actividades";

function ModalActividades() {
  const [actividad, setActividad] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const modalDismissed = localStorage.getItem("actividadModalDismissed");

    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const futuras = data.filter((act) => new Date(act.fecha) > new Date());
        if (futuras.length > 0) {
          const ultima = futuras[futuras.length - 1];
          setActividad(ultima);
          if (!modalDismissed) {
            setVisible(true);
          }
        }
      });
  }, []);

  const formatearFecha = (fecha) => {
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  };

  const cerrarModal = () => {
    setVisible(false);
    localStorage.setItem("actividadModalDismissed", "true");
  };

  if (!visible || !actividad) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-titulo">
          <h1>{actividad.titulo}</h1>
        </div>
        <button className="modal-close" onClick={cerrarModal}>
          ✕
        </button>

        <div className="title-content">
          <h2>Acercate el {formatearFecha(actividad.fecha)}</h2>
          <h3>{actividad.hora} hs</h3>
        </div>
        <div className="modal-card-img">
          <img
            src={actividad.imagen || "https://via.placeholder.com/300x200"}
            alt={actividad.titulo}
          />
        </div>
        <div className="modal-card-actions">
          <button
            className="btn-ver-mas"
            onClick={() => {
              cerrarModal();
              window.location.href = "https://empatiadigital.com.ar/actividades";
            }}
          >
            Ver más
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalActividades;
