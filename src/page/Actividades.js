import React, { useEffect, useState } from "react";
import "../style/Actividades.css";

const Actividades = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const actividadesPorPagina = 3;

  const fetchActividades = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/actividades");
      if (!res.ok) throw new Error("Error al obtener actividades");
      const data = await res.json();
      setActividades(data);
    } catch (error) {
      console.error(error);
      setActividades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActividades();
  }, []);

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "Fecha no disponible";
    const fecha = new Date(fechaISO);
    if (isNaN(fecha)) return "Fecha inválida";
    return fecha.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleCompartir = (titulo, id) => {
    const url = `http://localhost:3000/actividades`;
    const texto = `Este evento va a estar genial, ¿querés asistir conmigo?\n${titulo}\n${url}`;
    if (navigator.share) {
      navigator
        .share({
          title: titulo,
          text: texto,
          url: url,
        })
        .then(() => console.log("Compartido con éxito"))
        .catch((err) => console.error("Error al compartir:", err));
    } else {
      alert("Tu navegador no admite la función de compartir.");
    }
  };

  const handleAsistir = (titulo, fecha) => {
    const mensaje = `Me gustaría asistir a este evento: ${titulo} el día ${fecha}`;
    const telefono = "543462529718";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  // Paginación
  const totalPaginas = Math.ceil(actividades.length / actividadesPorPagina);
  const indiceInicial = (paginaActual - 1) * actividadesPorPagina;
  const actividadesActuales = actividades.slice(indiceInicial, indiceInicial + actividadesPorPagina);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const renderPaginacion = () => (
    <div className="paginacion">
      <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
        {"<"}
      </button>
      {Array.from({ length: totalPaginas }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => cambiarPagina(i + 1)}
          className={paginaActual === i + 1 ? "pagina-activa" : ""}
        >
          {i + 1}
        </button>
      ))}
      <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
        {">"}
      </button>
    </div>
  );

  if (loading) return <p>Cargando actividades...</p>;

  return (
    <div className="actividades-wrapper">
      <h1 className="titulo-principal">Actividades Programadas</h1>
      {actividades.length === 0 ? (
        <p>No hay actividades para mostrar.</p>
      ) : (
        <>
          {renderPaginacion()}
          <div className="grid-actividades">
            {actividadesActuales.map((act) => (
              <div key={act._id} className="actividad-card">
                <div className="title-content"> <h2>{act.titulo}</h2></div>
                <div className="card-img">
                  <img
                    src={act.imagen || "https://via.placeholder.com/300x200"}
                    alt={act.titulo}
                  />
                </div>
                <div className="card-content">
                  
                  <p><strong>Fecha:</strong> {formatearFecha(act.fecha)}</p>
                  <p><strong>Hora:</strong> {act.hora || "Hora no definida"}</p>
                  <p><strong>Dirección:</strong> {act.direccion || "No definida"}</p>
                  <p><strong>Organizador:</strong> {act.organizador || "No definido"}</p>
                  <p><strong>Objetivo:</strong> {act.objetivo || "No definido"}</p>
                </div>
                <div className="card-actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => handleCompartir(act.titulo, act._id)}
                  >
                    Compartir
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() =>
                      handleAsistir(act.titulo, formatearFecha(act.fecha))
                    }
                  >
                    Asistir
                  </button>
                </div>
              </div>
            ))}
          </div>
          {renderPaginacion()}
        </>
      )}
    </div>
  );
};

export default Actividades;
