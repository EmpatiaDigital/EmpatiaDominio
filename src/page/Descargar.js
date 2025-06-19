import React, { useState, useEffect } from "react";
import portadaGuia from "../assets/familiaEMPATIA.jpg";
import portadaLibro from "../assets/Cuidar.png";
import guiaPDF from "../assets/Guía Empatía Digital.pdf";
import avatar from "../assets/avatar.jpg";
import Swal from "sweetalert2";
import "../style/Descargar.css";
import { useAuth } from "../context/AuthContext";

const AUTOR_AVATAR =
  avatar || "https://cdn-icons-png.flaticon.com/512/147/147144.png";

const destacados = [
  {
    type: "pdf",
    title: "Guía de Empatía Digital para Familias",
    file: guiaPDF,
    portada: portadaGuia,
    name: "Guía Empatía Digital.pdf",
    esFijo: true,
  },
  {
    type: "libro",
    title: "Empatía Digital: Cuidar en Tiempos Digitales",
    file: "https://tulinkdelibro.com",
    portada: portadaLibro,
    name: "Libro Empatía Digital",
    esFijo: true,
  },
];

export default function Descargar() {
  const { user } = useAuth();
  const [materialDB, setMaterialDB] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const porPagina = 2;

  const cargarMateriales = async () => {
    try {
      const res = await fetch("https://empatia-dominio-back.vercel.app/api/descarga");
      const data = await res.json();
      setMaterialDB(data);
    } catch {
      Swal.fire("Error", "No se pudo cargar contenido", "error");
    }
  };

  useEffect(() => {
    cargarMateriales();
  }, []);

  const itemsCombinados = [...destacados, ...materialDB];

  const filtrados =
    tipoFiltro === "todos"
      ? itemsCombinados
      : itemsCombinados.filter((item) => item.type === tipoFiltro);

  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const visibles = filtrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  const handleFileUpload = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];
      const nuevo = {
        title: archivo.name,
        filename: archivo.name,
        type: archivo.name.toLowerCase().includes("libro") ? "libro" : "pdf",
        portada:
          "https://picsum.photos/300/200?random=" +
          Math.floor(Math.random() * 1000),
        fileData: base64,
      };

      // ¿Es uno de los dos destacados?
      const esDestacado = destacados.find((d) => d.name === archivo.name);
      if (esDestacado) {
        Swal.fire(
          "Reemplazo local",
          "Se reemplazó un material destacado.",
          "info"
        );
        destacados[destacados.findIndex((d) => d.name === archivo.name)] = {
          ...destacados.find((d) => d.name === archivo.name),
          ...nuevo,
          file: `data:application/pdf;base64,${base64}`,
        };
        return;
      }

      try {
        const res = await fetch("https://empatia-dominio-back.vercel.app/api/descarga", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevo),
        });
        const data = await res.json();
        if (res.ok) {
          setMaterialDB((prev) => [data, ...prev]);
          Swal.fire("Subido", "Archivo subido correctamente", "success");
        } else {
          throw new Error(data.error || "Error desconocido");
        }
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    };

    reader.readAsDataURL(archivo);
  };

  const eliminarItem = async (id) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      const res = await fetch(`https://empatia-dominio-back.vercel.app/api/descarga/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMaterialDB((prev) => prev.filter((item) => item._id !== id));
        Swal.fire("Eliminado", "Archivo eliminado", "success");
      }
    } catch {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  const registrarActividad = async (evento, nombre) => {
    const visitorId =
      localStorage.getItem("visitorId") ||
      (() => {
        const id = crypto.randomUUID();
        localStorage.setItem("visitorId", id);
        return id;
      })();

    const actividad = {
      visitorId,
      evento,
      titulo: nombre,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch("https://empatia-dominio-back.vercel.app/api/user-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actividad),
      });
    } catch (error) {
      console.error("Error al registrar actividad:", error);
    }
  };

  return (
    <section className="compras-section">
      <h2 className="titulo-principal">Material Recomendado</h2>

      <div className="filtro-container">
        <label>Mostrar:</label>
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="libro">Libros</option>
          <option value="pdf">PDFs</option>
        </select>
      </div>

      {user?.role === "superadmin" && (
        <div className="upload-container">
          <label htmlFor="upload-input" className="btn-ver-mas">
            Subir nuevo PDF o Libro
          </label>
          <input
            id="upload-input"
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>
      )}

      <div className="lista-posts-container">
        {visibles.map((item, index) => {
          const isPDF = item.type === "pdf";
          const esLocal = item.esFijo;

          const archivoBase64 = item.fileData
            ? `data:application/pdf;base64,${item.fileData}`
            : item.file;

          return (
            <div
              key={item._id || index}
              className="post-card"
              style={{
                backgroundImage: `url(${item.portada || portadaGuia})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="post-content-overlay-descargar">
                <div>
                  <h3 className="autor">{item.title}</h3>
                  <br></br>
                  <hr
                    style={{
                      border: "none",
                      height: "3px", // Grosor
                      backgroundColor: "#fff", // Color
                      margin: "2rem 0", // Separación arriba y abajo
                      width: "100%", // Ancho relativo
                    }}
                  />
                  {item.type === "libro" ? (
                    <a
                      href={archivoBase64}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ver-mas"
                      onClick={() =>
                        registrarActividad("PDFlibroDescarga", item.title)
                      }
                    >
                      Comprar Libro
                    </a>
                  ) : (
                    <a
                      href={archivoBase64}
                      download={item.filename || item.name}
                      className="btn-ver-mas"
                      onClick={() =>
                        registrarActividad("PDFguiaDescarga", item.title)
                      }
                    >
                      Descargar
                    </a>
                  )}
                </div>

                {user?.role === "superadmin" && !esLocal && (
                  <button
                    className="btn-ver-mas btn-borrar"
                    style={{ backgroundColor: "#ff5252", marginTop: "0.5rem" }}
                    onClick={() => eliminarItem(item._id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div
                style={{
                  backgroundColor: "#f0f8ff",
                  borderLeft: "4px solid #007acc",
                  padding: "1em",
                  marginTop: "1em",
                  fontStyle: "italic",
                  color: "#000",
                }}
              >
                <strong>Nota:</strong>{" "}
                <em>
                  Este contenido tiene fines educativos y no sustituye
                  asesoramiento clínico o médico profesional.
                </em>{" "}
                <a
                  href="/descargo-de-responsabilidad"
                  style={{
                    fontStyle: "normal",
                    textDecoration: "underline",
                    color: "#007acc",
                    marginLeft: "4px",
                  }}
                >
                  Ver más
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="paginacion-container">
        <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
          {"<"}
        </button>
        <span className="contador-materiales">
          Viendo: {visibles.length > 0 ? (pagina - 1) * porPagina + 1 : 0}–
          {Math.min(pagina * porPagina, filtrados.length)} de {filtrados.length}{" "}
          {tipoFiltro === "todos"
            ? "materiales"
            : tipoFiltro === "libro"
            ? "libros"
            : "PDFs"}
        </span>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
        >
          {">"}
        </button>
      </div>

      <div className="descripcion-autor">
        <img
          src={AUTOR_AVATAR}
          alt="Autor"
          className="avatar-autor"
          style={{ width: 80, borderRadius: "50%" }}
        />
        <div className="tarjeta-autor">
          <p>
            Creado por <b>Gabriel Reynoso</b>, acompañando a las familias en los
            desafíos que trae la tecnología. Comparte herramientas desde su
            experiencia como acompañante terapéutico para convivir mejor con
            pantallas, redes e inteligencia artificial.
          </p>
          <a href="/registro" className="link-suscripcion">
            Suscribite para recibir novedades, posts y más.
          </a>
        </div>
      </div>
    </section>
  );
}
