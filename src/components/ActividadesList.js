import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../style/CrearActividades.css";

const API_URL = "https://empatia-dominio-back.vercel.app/api/actividades";

const CrearActividades = ({ actividad, onEditar, onBorrar, onVerDetalle }) => {
  const {
    imagen = "https://via.placeholder.com/300x180?text=Sin+Imagen",
    fecha,
    titulo,
    objetivo,
    hora = "Hora no definida",
    direccion,
    organizador,
  } = actividad || {};

  let fechaFormateada = "Fecha no definida";
  if (fecha) {
    const fechaObj = new Date(fecha);
    if (!isNaN(fechaObj)) {
      fechaFormateada = fechaObj.toLocaleDateString("es-AR");
    }
  }

  return (
    <div className="actividad-card">
      <div className="title-content">
        <h2>{titulo}</h2>
      </div>
      <div
        className="card-img"
        onClick={onVerDetalle}
        style={{ cursor: "pointer" }}
      >
        <img src={imagen} alt={titulo} />
      </div>
      <div className="card-content">
        <p><strong>Fecha:</strong> {fechaFormateada}</p>
        <p><strong>Hora:</strong> {hora}</p>
        <p><strong>Objetivo:</strong> {objetivo}</p>
        <p><strong>Dirección:</strong> {direccion}</p>
        <p><strong>Organizador:</strong> {organizador}</p>
      </div>
      <div className="card-actions">
        <button className="btn btn-edit" onClick={onEditar}>Editar</button>
        <button className="btn btn-delete" onClick={onBorrar}>Borrar</button>
      </div>
    </div>
  );
};

const ActividadesList = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);

  const [nuevaActividad, setNuevaActividad] = useState({
    titulo: "",
    fecha: "",
    hora: "",
    objetivo: "",
    direccion: "",
    organizador: "",
    imagen: "",
  });

  const fetchActividades = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener actividades");
      const data = await res.json();
      setActividades(data);
    } catch (error) {
      console.error(error);
      setActividades([]);
      Swal.fire("Error", "No se pudieron cargar las actividades.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActividades();
  }, []);

  const handleBorrar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al borrar actividad");
      setActividades(actividades.filter((act) => act._id !== id));
      Swal.fire("Eliminada", "La actividad fue eliminada.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo borrar la actividad.", "error");
    }
  };

  const handleEditar = (actividad) => {
    setModoEdicion(true);
    setIdEditar(actividad._id);
    setMostrarFormulario(true);
    setNuevaActividad({
      titulo: actividad.titulo,
      fecha: actividad.fecha?.split("T")[0] || "",
      hora: actividad.hora,
      objetivo: actividad.objetivo,
      direccion: actividad.direccion,
      organizador: actividad.organizador,
      imagen: actividad.imagen,
    });
  };

  const handleVerDetalle = (actividad) => {
    let fechaDetalle = "Fecha no definida";
    if (actividad.fecha) {
      const fechaObj = new Date(actividad.fecha);
      if (!isNaN(fechaObj)) {
        fechaDetalle = fechaObj.toLocaleDateString("es-AR");
      }
    }

    Swal.fire({
      title: actividad.titulo,
      html: `
        <p><strong>Fecha:</strong> ${fechaDetalle}</p>
        <p><strong>Hora:</strong> ${actividad.hora}</p>
        <p><strong>Objetivo:</strong> ${actividad.objetivo}</p>
        <p><strong>Dirección:</strong> ${actividad.direccion}</p>
        <p><strong>Organizador:</strong> ${actividad.organizador}</p>
      `,
      imageUrl:
        actividad.imagen ||
        "https://via.placeholder.com/300x180?text=Sin+Imagen",
      imageWidth: 300,
      imageHeight: 180,
      imageAlt: "Imagen de actividad",
    });
  };

  const toggleFormulario = () => {
    setMostrarFormulario(!mostrarFormulario);
    if (!mostrarFormulario) {
      setModoEdicion(false);
      setNuevaActividad({
        titulo: "",
        fecha: "",
        hora: "",
        objetivo: "",
        direccion: "",
        organizador: "",
        imagen: "",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaActividad({ ...nuevaActividad, [name]: value });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevaActividad((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarImagen = () => {
    setNuevaActividad((prev) => ({ ...prev, imagen: "" }));
  };

  const handleGuardarActividad = async () => {
    try {
      const actividadAEnviar = {
        ...nuevaActividad,
        imagen:
          nuevaActividad.imagen ||
          "https://via.placeholder.com/300x180?text=Sin+Imagen",
        fecha: nuevaActividad.fecha
          ? new Date(`${nuevaActividad.fecha}T12:00:00`).toISOString()
          : new Date().toISOString(),
      };

      if (modoEdicion) {
        const res = await fetch(`${API_URL}/${idEditar}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(actividadAEnviar),
        });

        if (!res.ok) throw new Error("Error al actualizar actividad");

        const actualizada = await res.json();
        setActividades(
          actividades.map((act) =>
            act._id === idEditar ? actualizada : act
          )
        );
        Swal.fire("Actualizada", "La actividad fue actualizada.", "success");
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(actividadAEnviar),
        });

        if (!res.ok) throw new Error("Error al guardar la actividad");

        const actividadGuardada = await res.json();
        setActividades([actividadGuardada, ...actividades]);
        Swal.fire("Guardado", "La actividad fue guardada.", "success");
      }

      setNuevaActividad({
        titulo: "",
        fecha: "",
        hora: "",
        objetivo: "",
        direccion: "",
        organizador: "",
        imagen: "",
      });
      setMostrarFormulario(false);
      setModoEdicion(false);
      setIdEditar(null);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar la actividad.", "error");
    }
  };

  if (loading) return <p>Cargando actividades...</p>;

  return (
    <>
      <button className="btn btn-crear" onClick={toggleFormulario}>
        {mostrarFormulario
          ? modoEdicion
            ? "Cancelar edición"
            : "Cancelar"
          : "Crear nueva actividad"}
      </button>

      <div className="actividades-container">
        {mostrarFormulario && (
          <div className="formulario-actividad">
            <h3>{modoEdicion ? "Editar Actividad" : "Nueva Actividad"}</h3>
            <input name="titulo" placeholder="Título" value={nuevaActividad.titulo} onChange={handleInputChange} />
            <input name="fecha" type="date" value={nuevaActividad.fecha} onChange={handleInputChange} />
            <input name="hora" placeholder="Hora" value={nuevaActividad.hora} onChange={handleInputChange} />
            <input name="objetivo" placeholder="Objetivo" value={nuevaActividad.objetivo} onChange={handleInputChange} />
            <input name="direccion" placeholder="Dirección" value={nuevaActividad.direccion} onChange={handleInputChange} />
            <input name="organizador" placeholder="Organizador" value={nuevaActividad.organizador} onChange={handleInputChange} />
            
            <input type="file" accept="image/*" onChange={handleImagenChange} />
            {nuevaActividad.imagen && (
              <div style={{ marginTop: "10px" }}>
                <img src={nuevaActividad.imagen} alt="Vista previa" style={{ maxWidth: "200px", maxHeight: "150px" }} />
                <br />
                <button onClick={eliminarImagen}>Eliminar imagen</button>
              </div>
            )}

            <button className="btn btn-save" onClick={handleGuardarActividad}>
              {modoEdicion ? "Actualizar" : "Guardar"}
            </button>
          </div>
        )}

        {actividades.length === 0 && <p>No hay actividades para mostrar.</p>}

        {actividades.map((actividad) => (
          <CrearActividades
            key={actividad._id}
            actividad={actividad}
            onEditar={() => handleEditar(actividad)}
            onBorrar={() => handleBorrar(actividad._id)}
            onVerDetalle={() => handleVerDetalle(actividad)}
          />
        ))}
      </div>
    </>
  );
};

export default ActividadesList;
