import React, { useState, useEffect } from "react";
import portadaGuia from "../assets/familiaEMPATIA.jpg";
import portadaLibro from "../assets/Portada3.jpg";
import guiaPDF from "../assets/Guía Empatía Digital.pdf";
import avatar from "../assets/avatar.jpeg";
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

const BADGE_LABELS = { pdf: "PDF", libro: "Libro" };

const ArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Download = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 2v7M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 10V3M4 6l3-3 3 3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 4h10M5 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4M5.5 7v3M8.5 7v3M3 4l.75 7.25a.5.5 0 0 0 .5.45h5.5a.5.5 0 0 0 .5-.45L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1C3.69 1 1 3.69 1 7c0 1.08.28 2.1.78 2.97L1 13l3.13-.76A6 6 0 1 0 7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Descargar() {
  const { user } = useAuth();
  const [materialDB, setMaterialDB] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const porPagina = 4;

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

      const esDestacado = destacados.find((d) => d.name === archivo.name);
      if (esDestacado) {
        Swal.fire("Reemplazo local", "Se reemplazó un material destacado.", "info");
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

    try {
      await fetch("https://empatia-dominio-back.vercel.app/api/user-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          evento,
          titulo: nombre,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Error al registrar actividad:", error);
    }
  };

  return (
    <section className="descargar-section">

      {/* ── Header ── */}
      <div className="descargar-section-header">
        <div>
          <span className="section-eyebrow">Recursos gratuitos</span>
          <h2 className="titulo-principal">Material Recomendado</h2>
        </div>
        <span className="contador-materiales">
          {filtrados.length}{" "}
          {tipoFiltro === "todos"
            ? "materiales"
            : tipoFiltro === "libro"
            ? "libros"
            : "PDFs"}
        </span>
      </div>

      {/* ── Filtro ── */}
      <div className="filtro-container">
        <label htmlFor="filtro-tipo">Mostrar:</label>
        <select
          id="filtro-tipo"
          value={tipoFiltro}
          onChange={(e) => {
            setTipoFiltro(e.target.value);
            setPagina(1);
          }}
        >
          <option value="todos">Todos</option>
          <option value="libro">Libros</option>
          <option value="pdf">PDFs</option>
        </select>
      </div>

      {/* ── Upload admin ── */}
      {user?.role === "superadmin" && (
        <div className="upload-container">
          <label htmlFor="upload-input" className="btn-upload">
            <UploadIcon />
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

      {/* ── Grid de cards ── */}
      <div className="lista-material-container">
        {visibles.map((item, index) => {
          const esLocal = item.esFijo;
          const archivoBase64 = item.fileData
            ? `data:application/pdf;base64,${item.fileData}`
            : item.file;

          return (
            <div
              key={item._id || index}
              className="material-card"
              style={{
                backgroundImage: `url(${item.portada || portadaGuia})`,
              }}
            >
              {/* Badge tipo */}
              <span className="material-badge">
                {BADGE_LABELS[item.type] || item.type}
              </span>

              {/* Overlay */}
              <div className="material-overlay">
                <h3>{item.title}</h3>

                <div className="material-footer">
                  {item.type === "libro" ? (
                    <a
                      href={`https://wa.me/543413559329?text=${encodeURIComponent(
                        `Hola, tengo interés en colaborar con "${item.title}".`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-material"
                      onClick={() =>
                        registrarActividad("PDFlibroWhatsApp", item.title)
                      }
                    >
                      <WhatsAppIcon />
                      Colaborar
                    </a>
                  ) : (
                    <a
                      href={archivoBase64}
                      download={item.filename || item.name}
                      className="btn-material"
                      onClick={() =>
                        registrarActividad("PDFguiaDescarga", item.title)
                      }
                    >
                      <Download />
                      Descargar
                    </a>
                  )}

                  {user?.role === "superadmin" && !esLocal && (
                    <button
                      className="btn-material btn-eliminar"
                      onClick={() => eliminarItem(item._id)}
                    >
                      <TrashIcon />
                      Eliminar
                    </button>
                  )}
                </div>

                {/* Disclaimer */}
                <p className="nota-disclaimer">
                  Contenido educativo · no sustituye asesoramiento clínico.{" "}
                  <a href="/descargo-de-responsabilidad">Ver más</a>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Paginación ── */}
      {totalPaginas > 1 && (
        <div className="paginacion-container">
          <button
            className="paginacion-btn"
            disabled={pagina === 1}
            onClick={() => setPagina(pagina - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft />
          </button>
          <span className="contador-materiales">
            {(pagina - 1) * porPagina + 1}–
            {Math.min(pagina * porPagina, filtrados.length)} de {filtrados.length}
          </span>
          <button
            className="paginacion-btn"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(pagina + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight />
          </button>
        </div>
      )}

      {/* ── Tarjeta autor ── */}
      <div className="tarjeta-autor-wrapper">
        <div className="autor-header">
          <img
            src={AUTOR_AVATAR}
            alt="Foto del autor"
            className="avatar-autor"
          />
          <div className="autor-info">
            <p className="autor-nombre">Acompañante Terapéutico & Dev IA</p>
            <p className="autor-rol">Rosario · desde 2012</p>
          </div>
        </div>

        <p className="autor-bio">
          Desde 2014 comencé a explorar el mundo digital creando aplicaciones
          educativas con App Inventor del MIT, y en 2017 leí por primera vez
          sobre los modelos <strong>"transformer"</strong>, lo que despertó en
          mí un profundo interés por el desarrollo de la inteligencia artificial.
          Ese recorrido técnico se fue integrando con mi vocación por el
          acompañamiento en salud mental.
          <br /><br />
          En <strong>2024</strong> unifiqué mis conocimientos en IA y
          programación con mi formación como acompañante terapéutico, modalidad
          avalada por la <strong>Universidad Nacional de Rosario (UNR)</strong>{" "}
          y que ejerzo empíricamente desde 2012. Hoy acompaño a personas y
          familias a tomar decisiones más conscientes frente a la tecnología,
          combinando calidez humana con comprensión técnica.
        </p>

        <a href="/registro" className="btn-suscripcion">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 3h12v8.5a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 1 11.5V3ZM1 3l6 5.5L13 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Suscribite para recibir novedades
        </a>
      </div>

    </section>
  );
}
