import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Swal from 'sweetalert2';
import '../style/Editor.css';

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

  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: '',
  });

  // Cargar datos del post al iniciar
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`https://empatia-dominio-back.vercel.app/api/posts/${postId}`);
        const data = await res.json();

        setTitulo(data.titulo || '');
        setAutor(data.autor || '');
        setEpigrafe(data.epigrafe || '');
        setPortada(data.portada || null);
        setCategoria(data.categoria || '');
        setImagenes(data.imagenes || []);
        setEpigrafes(data.epigrafes || []);
        setTamanos(data.tamanos || []);
        editor?.commands.setContent(data.contenido || '');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar el post', 'error');
      }
    };

    fetchPost();
  }, [postId, editor]);

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
    setCargando(true);
    const urls = [];

    for (const file of files) {
      const url = await subirImagenACloudinary(file);
      urls.push(url);
      editor?.chain().focus().insertContent(`<img src="${url}" class="imagen-fija-1200" />`).run();
    }

    setImagenes((prev) => [...prev, ...urls]);
    setEpigrafes((prev) => [...prev, ...urls.map(() => '')]);
    setTamanos((prev) => [...prev, ...urls.map(() => 100)]);
    setCargando(false);
  };

  const handlePortadaSeleccionada = async (e) => {
    const file = e.target.files[0];
    setCargando(true);
    const url = await subirImagenACloudinary(file);
    setPortada(url);
    setCargando(false);
  };

  const actualizarPost = async () => {
    const contenido = editor?.getHTML() || '';
    if (!titulo || !autor || !contenido || contenido === '<p></p>' || !categoria) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos obligatorios',
        text: 'Completá título, autor, contenido y categoría.',
      });
      return navigate('/');
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

    try {
      const res = await fetch(`https://empatia-dominio-back.vercel.app/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postActualizado),
      });

      if (res.ok) {
        Swal.fire('Actualizado', 'El post fue actualizado con éxito.', 'success');
        navigate('/'); 
      } else {
        Swal.fire('Error', 'No se pudo actualizar el post.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error inesperado', 'Revisá la consola.', 'error');
    }
  };

  return (
    <div className="editor-container">
      <h2 className="editor-title">✏️ Editar post</h2>

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
          <img src={portada} alt="portada" className="preview-portada" />
        </div>
      )}

      <div className="toolbar">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'active' : ''}>B</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'active' : ''}>I</button>
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'active' : ''}>•</button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={editor?.isActive('heading', { level: 1 }) ? 'active' : ''}>H1</button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
        <button onClick={() => editor?.chain().focus().unsetAllMarks().run()}>Limpiar</button>
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
        // Validación: permitir vacío (para quitar link), pero no texto inválido si se pone algo
        if (value && !/^https?:\/\/|^\/|^[\w\-]/.test(value)) {
          return 'Ingresá una URL válida o dejalo vacío para quitar el enlace';
        }
        return null;
      },
    });

    // Si el input fue cancelado (botón Cancelar)
    if (url === undefined) return;

    // Si está vacío, eliminamos el link actual
    if (url === '') {
      editor?.chain().focus().unsetLink().run();
      return;
    }

    // Limpiar localhost u origen del frontend
    let cleanedUrl = url;

    // Si es un enlace interno a tu app (rutas tipo /post/titulo), dejalo pasar tal cual
    // Pero si es externo (comienza con http:// o https://), no lo toques
    const isExternal = /^https?:\/\//i.test(url);
    
    if (!isExternal && url.startsWith("http://localhost:3000")) {
      cleanedUrl = url.replace("http://localhost:3000", "");
    }
    

    editor?.chain().focus().extendMarkRange('link').setLink({ href: cleanedUrl }).run();
  }}
  className={editor?.isActive('link') ? 'active' : ''}
  type="button"
>
  🔗 Link
</button>


      </div>

      <EditorContent editor={editor} className="tiptap" />

      <label className="editor-label">🖼️ Agregar nuevas imágenes:</label>
      <input type="file" multiple accept="image/*" onChange={handleImagenesSeleccionadas} className="editor-file" />

      {cargando && <p className="uploading-text">Subiendo imágenes...</p>}


      <button onClick={actualizarPost} className="publish-button" type="button">
        💾 Guardar cambios
      </button>
    </div>
  );
};

export default EditPost;
