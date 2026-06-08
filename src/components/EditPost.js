import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import { Node } from '@tiptap/core'; 
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Swal from 'sweetalert2';
import '../style/Editor.css';

// ─── 1. EXTENSIÓN PERSONALIZADA TIPTAP: RECUADRO DINÁMICO ────────────────────
const CalloutBox = Node.create({
  name: "calloutBox",
  group: "block",
  content: "block+", 
  defining: true,

  addAttributes() {
    return {
      color: {
        default: "azul",
        parseHTML: (element) => element.getAttribute("data-color"),
        renderHTML: (attributes) => ({
          "data-color": attributes.color,
          class: `recuadro-dinamico recuadro-${attributes.color}`,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div.recuadro-dinamico" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", HTMLAttributes, 0];
  },
});

// ─── Helpers de optimización Cloudinary ───────────────────────────────────────
const optimizarCloudinary = (url, params = "f_auto,q_auto,w_1200") => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto")) return url;
  return url.replace("/upload/", `/upload/${params}/`);
};

const optimizarPortada = (url) => optimizarCloudinary(url, "f_auto,q_auto,w_800");
const optimizarContenido = (url) => optimizarCloudinary(url, "f_auto,q_auto,w_1200");

// ──────────────────────────────────────────────────────────────────────────────

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [autor, setAutor] = useState('');
  const [titulo, setTitulo] = useState('');
  const [epigrafe, setEpigrafe] = useState('');
  const [portada, setPortada] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [epigrafes, setEpigrafes] = useState([]);
  const [tamanos, setTamanos] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [cargando, setCargando] = useState(false);

  // Paleta controlada para los selectores visuales individuales
  const coloresRecuadro = [
    { nombre: "Azul", value: "azul" },
    { nombre: "Rojo", value: "rojo" },
    { nombre: "Verde", value: "verde" },
    { nombre: "Amarillo", value: "amarillo" },
    { nombre: "Violeta", value: "violeta" },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit,
      CalloutBox, 
      Image.configure({
        HTMLAttributes: {
          class: "imagen-fija-1200",
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
    content: '',
  });

  useEffect(() => {
    if (!editor || !postId) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`https://empatia-dominio-back.vercel.app/api/posts/${postId}`);
        if (!res.ok) throw new Error("No se pudo obtener el post");
        
        const data = await res.json();

        setTitulo(data.titulo || '');
        setAutor(data.autor || '');
        setEpigrafe(data.epigrafe || '');
        setPortada(data.portada ? optimizarPortada(data.portada) : null);
        setCategoria(data.categoria || '');
        setImagenes(data.imagenes || []);
        setEpigrafes(data.epigrafes || []);
        setTamanos(data.tamanos || []);
        
        editor.commands.setContent(data.contenido || '');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar el post de la base de datos.', 'error');
      }
    };

    fetchPost();
  }, [postId, editor]);

  const agregarRecuadroDestacado = (color) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "calloutBox",
        attrs: { color },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Escribí el contenido destacado acá..." }],
          },
        ],
      })
      .run();
  };

  const subirImagenACloudinary = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('https://empatia-dominio-back.vercel.app/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Error al subir imagen');

    const data = await res.json();
    return data.secure_url;
  };

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
            .insertContent(`<img src="${urlOptimizada}" />`)
            .run();
        }
      }

      setImagenes((prev) => [...prev, ...urls]);
      setEpigrafes((prev) => [...prev, ...urls.map(() => '')]);
      setTamanos((prev) => [...prev, ...urls.map(() => 100)]);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema al cargar los archivos al cuerpo del post.', 'error');
    } finally {
      setCargando(false);
    }
  };

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
      Swal.fire('Error de Portada', 'No se pudo reemplazar la imagen de portada.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const actualizarPost = async () => {
    const contenido = editor?.getHTML() || '';
    
    if (!titulo || !autor || !contenido || contenido === '<p></p>' || !categoria) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos obligatorios',
        text: 'Completá título, autor, contenido y categoría.',
      });
      return;
    }

    const avatar = localStorage.getItem('avatar') || '';

    const postActualizado = {
      titulo,
      autor,
      epigrafe,
      portada,
      contenido,
      imagenes,
      epigrafes,
      tamanos,
      categoria,
      fecha: new Date().toISOString(),
      avatar,
    };

  // Resto de la lógica del componente igual...
    try {
      Swal.fire({
        title: 'Guardando cambios...',
        html: 'Actualizando la información del post.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await fetch(`https://empatia-dominio-back.vercel.app/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postActualizado),
      });

      Swal.close();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Post actualizado!',
          text: 'Los cambios se guardaron con éxito.',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate('/'); 
        });
      } else {
        Swal.fire('Error', 'El servidor rechazó la actualización del post.', 'error');
      }
    } catch (err) {
      Swal.close();
      console.error(err);
      Swal.fire('Error inesperado', 'Revisá la conexión o la consola del desarrollador.', 'error');
    }
  };

  return (
    <div className="editor-container">
      <h2 className="editor-title">Editar Publicación</h2>

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
          const limpio = e.target.value.replace(/[^a-zA-Z\s]/g, '');
          setAutor(limpio);
          localStorage.setItem('nombre', limpio);
        }}
        className="editor-input"
      />

      <textarea
        placeholder="Epígrafe general del post..."
        value={epigrafe}
        onChange={(e) => setEpigrafe(e.target.value)}
        className="editor-textarea"
      />

      <label className="editor-label">Categoría</label>
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

      <label className="editor-label">Imagen de portada</label>
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
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'active' : ''}>Negrita</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'active' : ''}>Itálica</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'active' : ''}>Lista</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={editor?.isActive('heading', { level: 1 }) ? 'active' : ''}>Título 1</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}>Título 2</button>
        
        <button
          onClick={async () => {
            const previousUrl = editor?.getAttributes('link').href || '';

            const { value: url } = await Swal.fire({
              title: 'Insertar enlace',
              input: 'url',
              inputLabel: 'URL del enlace',
              inputValue: previousUrl,
              showCancelButton: true,
              confirmButtonText: 'Insertar',
              cancelButtonText: 'Cancelar',
              inputValidator: (value) => {
                if (value && !/^https?:\/\/|^\/|^[\w\-]/.test(value)) {
                  return 'Ingresá una URL válida o dejalo vacío para quitar el enlace';
                }
                return null;
              },
            });

            if (url === undefined) return;
            if (url === '') {
              editor?.chain().focus().unsetLink().run();
              return;
            }

            let cleanedUrl = url;
            const isExternal = /^https?:\/\//i.test(url);
            if (!isExternal && url.startsWith("http://localhost:3000")) {
              cleanedUrl = url.replace("http://localhost:3000", "");
            }

            editor?.chain().focus().extendMarkRange('link').setLink({ href: cleanedUrl }).run();
          }}
          className={editor?.isActive('link') ? 'active' : ''}
          type="button"
        >
          Enlace
        </button>

        {/* ─── CONTROLES VISUALES MINIATURA PARA RECUADROS ─── */}
        <div className="recuadro-picker-group">
          <span className="recuadro-picker-label">Recuadro</span>
          {coloresRecuadro.map((col) => (
            <button
              key={col.value}
              type="button"
              title={`Insertar bloque ${col.nombre}`}
              className={`swatch-btn swatch-${col.value} ${
                editor?.isActive('calloutBox', { color: col.value }) ? 'active' : ''
              }`}
              onClick={() => agregarRecuadroDestacado(col.value)}
            />
          ))}
        </div>

        <button type="button" onClick={() => editor?.chain().focus().unsetAllMarks().run()}>Limpiar</button>
      </div>

      <EditorContent editor={editor} className="tiptap" />

      <label className="editor-label">Añadir imágenes al cuerpo del post</label>
      <input type="file" multiple accept="image/*" onChange={handleImagenesSeleccionadas} className="editor-file" />

      {cargando && <p className="uploading-text">Procesando archivos multimedia...</p>}

      <button 
        onClick={actualizarPost} 
        className="publish-button" 
        type="button"
        disabled={cargando}
      >
        Guardar cambios
      </button>
    </div>
  );
};

export default EditPost;
