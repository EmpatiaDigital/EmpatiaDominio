import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import "../style/Editor.css";
import Swal from "sweetalert2";

// ─── Helpers de optimización Cloudinary ───────────────────────────────────────
// Inserta parámetros de transformación en una URL de Cloudinary.
const optimizarCloudinary = (url, params = "f_auto,q_auto,w_1200") => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto")) return url;
  return url.replace("/upload/", `/upload/${params}/`);
};

const optimizarPortada = (url) => optimizarCloudinary(url, "f_auto,q_auto,w_800");
const optimizarContenido = (url) => optimizarCloudinary(url, "f_auto,q_auto,w_1200");
// ──────────────────────────────────────────────────────────────────────────────

const CrearPost = () => {
  const [autor, setAutor] = useState(() => {
    return localStorage.getItem("nombre") || "Sentidos";
  });

  const [titulo, setTitulo] = useState("");
  const [epigrafe, setEpigrafe] = useState("");
  const [portada, setPortada] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [epigrafes, setEpigrafes] = useState([]);
  const [tamanos, setTamanos] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [cargando, setCargando] = useState(false);

  // 🛠️ MEJORA: Configuración nativa de atributos HTML para extensiones de Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "imagen-fija-1200", // Asegura que Tiptap no barra ni elimine tu clase de CSS
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: "",
  });

  const subirImagenACloudinary = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("https://empatia-dominio-back.vercel.app/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al subir la imagen");
    }

    const data = await res.json();
    return data.secure_url;
  };

  // 🛠️ MEJORA: Try/Catch/Finally para prevenir pantallas congeladas si falla la API
  const handleImagenesSeleccionadas = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setCargando(true);
    const urls = [];

    try {
      for (const file of files) {
        const urlOriginal = await subirImagenACloudinary(file);
        const urlOptimizada = optimizarContenido(urlOriginal);
        urls.push(urlOptimizada);

        if (editor) {
          editor
            .chain()
            .focus()
            .insertContent(`<img src="${urlOptimizada}" />`) // Tiptap le inyecta la clase automáticamente
            .run();
        }
      }

      setImagenes((prev) => [...prev, ...urls]);
      setEpigrafes((prev) => [...prev, ...urls.map(() => "")]);
      setTamanos((prev) => [...prev, ...urls.map(() => 100)]);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error al subir imágenes",
        text: "No se pudieron cargar una o más imágenes dentro del contenido.",
      });
    } finally {
      setCargando(false); // Se ejecuta SIEMPRE, evitando loaders infinitos
    }
  };

  // 🛠️ MEJORA: Control de errores en la carga de la portada
  const handlePortadaSeleccionada = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCargando(true);
    try {
      const urlOriginal = await subirImagenACloudinary(file);
      const urlOptimizada = optimizarPortada(urlOriginal);
      setPortada(urlOptimizada);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error de Portada",
        text: "Hubo un problema al subir la imagen de portada.",
      });
    } finally {
      setCargando(false);
    }
  };

  const guardarPost = async () => {
    const contenido = editor?.getHTML() || "";
  
    if (
      !titulo ||
      !autor ||
      !contenido ||
      contenido === "<p></p>" ||
      !categoria
    ) {
      Swal.fire({
        icon: "warning",
        title: "Faltan datos obligatorios",
        text: "Completá título, autor, contenido y categoría antes de publicar.",
      });
      return;
    }
  
    const avatar = localStorage.getItem("avatar") || "";
    const PostId = localStorage.getItem("userId");
  
    const nuevoPost = {
      titulo,
      autor,
      epigrafe,
      portada,
      contenido,
      imagenes,
      epigrafes,
      tamanos, // Nota: Asegúrate de recibir 'tamanos' en la destructuración de tu backend si lo persistís
      categoria,
      fecha: new Date().toISOString(),
      avatar,
      PostId,
    };
  
    try {
      Swal.fire({
        title: "Subiendo post...",
        html: "Por favor esperá un momento.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      const res = await fetch("https://empatia-dominio-back.vercel.app/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPost),
      });
  
      Swal.close();
  
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Post creado!",
          text: "Tu post se publicó correctamente.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
    
        setTitulo("");
        setAutor("");
        setEpigrafe("");
        setPortada(null);
        editor.commands.setContent("");
        setImagenes([]);
        setEpigrafes([]);
        setTamanos([]);
        setCategoria("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al guardar",
          text: "Ocurrió un problema al intentar guardar el post.",
        });
      }
    } catch (err) {
      Swal.close();
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "Revisá la consola o contactá al administrador.",
      });
    }
  };
  

  return (
    <div className="editor-container">
      <h2 className="editor-title">📝 Crear nuevo post</h2>

      <input
        type="text"
        placeholder="Título del post"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="editor-input"
      />

      <input
        type="text"
        placeholder="Autor"
        value={autor}
        onChange={(e) => {
          const soloLetrasEspacios = e.target.value.replace(/[^a-zA-Z\s]/g, "");
          setAutor(soloLetrasEspacios);
          localStorage.setItem("nombre", soloLetrasEspacios);
        }}
        className="editor-input"
      />

      <textarea
        placeholder="Epígrafe general del post..."
        value={epigrafe}
        onChange={(e) => setEpigrafe(e.target.value)}
        className="editor-textarea"
      />

      <label className="editor-label">Categoría:</label>
      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className="editor-select"
      >
        <option value="">-- Seleccioná una categoría --</option>
        <option value="Noticias">Noticias</option>
        <option value="Tutoriales">Tutoriales</option>
        <option value="Opinión">Opinión</option>
        <option value="Eventos">Eventos</option>
        <option value="Sociedad Digital">Sociedad Digital</option>
      </select>

      <label className="editor-label">📷 Imagen de portada:</label>
      <input
        type="file"
        accept="image/*"
        onChange={handlePortadaSeleccionada}
        className="editor-file"
      />

      {portada && (
        <div className="preview-portada-block">
          <img
            src={portada}
            alt="portada"
            className="preview-portada"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? "active" : ""}
          type="button"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? "active" : ""}
          type="button"
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor?.isActive("bulletList") ? "active" : ""}
          type="button"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor?.isActive("heading", { level: 1 }) ? "active" : ""}
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor?.isActive("heading", { level: 2 }) ? "active" : ""}
          type="button"
        >
          H2
        </button>

        <button
          onClick={async () => {
            const previousUrl = editor.getAttributes("link").href || "";

            const { value: url } = await Swal.fire({
              title: "Insertar enlace",
              input: "url",
              inputLabel: "URL del enlace",
              inputValue: previousUrl,
              showCancelButton: true,
              confirmButtonText: "Insertar",
              cancelButtonText: "Cancelar",
              inputValidator: (value) => {
                // 🛠️ MEJORA: Se corrigió la Regex cambiándola a https? para admitir enlaces seguros nativamente
                if (value && !/^https?:\/\/|^\/|^[\w\-]/.test(value)) {
                  return "Ingresá una URL válida o dejala vacía para quitar el enlace";
                }
                return null;
              },
            });

            if (url === undefined) return;

            if (url === "") {
              editor.chain().focus().unsetLink().run();
              return;
            }

            let cleanedUrl = url;
            const isExternal = /^https?:\/\//i.test(url);
            
            if (!isExternal && url.startsWith("http://localhost:3000")) {
              cleanedUrl = url.replace("http://localhost:3000", "");
            }            

            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: cleanedUrl })
              .run();
          }}
          className={editor?.isActive("link") ? "active" : ""}
          type="button"
        >
          🔗 Link
        </button>

        <button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          type="button"
        >
          Limpiar
        </button>
      </div>

      <EditorContent editor={editor} className="tiptap" />

      <label className="editor-label">
        🖼️ Agregar imágenes dentro del contenido:
      </label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImagenesSeleccionadas}
        className="editor-file"
      />

      {cargando && <p className="uploading-text">Procesando archivos multimedia...</p>}

      <button 
        onClick={guardarPost} 
        className="publish-button" 
        type="button"
        disabled={cargando} // 🛠️ MEJORA: Deshabilita el botón de enviar si se están subiendo imágenes
      >
        🚀 Publicar
      </button>
    </div>
  );
};

export default CrearPost;
