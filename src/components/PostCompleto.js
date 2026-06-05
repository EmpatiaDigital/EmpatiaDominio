// src/components/PostDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import fondo from "../assets/Juego.jpeg";
import "../style/PostCompleto.css";
import { FaFacebook, FaWhatsapp, FaInstagram } from "react-icons/fa";
import Swal from "sweetalert2";
import PostStats from "./PostStats";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";

// ─── Helpers de optimización Cloudinary ───────────────────────────────────────
const optimizarCloudinary = (url, params = "f_auto,q_auto,w_1200") => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto")) return url;
  return url.replace("/upload/", `/upload/${params}/`);
};

const optimizarPortada = (url) => optimizarCloudinary(url, "f_auto,q_auto,w_800");

const optimizarImagenesEnHtml = (html) => {
  if (!html) return html;
  return html.replace(
    /(src=")(https:\/\/res\.cloudinary\.com\/[^"]+)(")/g,
    (match, pre, url, post) => {
      if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto")) {
        return match;
      }
      const urlOptimizada = url.replace("/upload/", "/upload/f_auto,q_auto,w_1200/");
      return `${pre}${urlOptimizada}${post}`;
    }
  );
};

const PostCompleto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [postsRelacionados, setPostsRelacionados] = useState([]);
  const [cargando, setCargando] = useState(true);

  const shareUrl = `https://empatia-dominio-back.vercel.app/api/posts/${id}/preview`;
  const currentUrl = `${window.location.origin}/post/${id}`;

  const mensaje = post
    ? encodeURIComponent(`${post.titulo} – Leé este post en Empatía Digital este es lo nuevo: ${shareUrl} `)
    : "";

  // 1. Carga del post principal
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setCargando(true);
        const res = await fetch(`https://empatia-dominio-back.vercel.app/api/posts/${id}`);
        const data = await res.json();
        setPost(data);
        setCargando(false);
      } catch (error) {
        console.error("Error al obtener el post:", error);
        setCargando(false);
      }
    };

    fetchPost();
  }, [id]);

  // 2. Carga de los 3 posts relacionados de la misma categoría
  useEffect(() => {
    if (!post?.categoria) return;

    const fetchRelacionados = async () => {
      try {
        const res = await fetch("https://empatia-dominio-back.vercel.app/api/posts");
        const todosLosPosts = await res.json();
        
        // Filtramos por categoría y dejamos afuera el post que ya se está leyendo
        const filtrados = todosLosPosts
          .filter((p) => p.categoria === post.categoria && p._id !== id)
          .slice(0, 3);

        setPostsRelacionados(filtrados);
      } catch (error) {
        console.error("Error al cargar posts relacionados:", error);
      }
    };

    fetchRelacionados();
  }, [post, id]);

  // 3. Formateo de elementos inyectados en el HTML (Links externos y Lazy loading)
  useEffect(() => {
    if (!post) return;

    const enlaces = document.querySelectorAll(".imagen-fija-1200 a, .post-content a");
    enlaces.forEach((a) => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("http")) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });

    const imgs = document.querySelectorAll(".imagen-fija-1200 img, .post-content img");
    imgs.forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    });
  }, [post]);

  if (cargando) return <p>Cargando post...</p>;
  if (!post) return <p>No se encontró el post.</p>;

  const contenidoOptimizado = optimizarImagenesEnHtml(post.contenido);
  const portadaOptimizada = optimizarPortada(post.portada);

  return (
    <div className="post-detalle">
      <h2 className="post-completo-title">{post.titulo}</h2>

      <div className="post-header">
        <img
          src={post.avatar || DEFAULT_AVATAR}
          alt="avatar"
          className="avatar"
          loading="lazy"
          decoding="async"
        />
        <div>
          <p
            style={{
              color: "#000",
              fontSize: "0.9rem",
              display: "inline",
              fontStyle: "italic",
              fontWeight: "bold",
            }}
          >
            Por: {post.autor}
          </p>
          <div>
            <p>
              <b>Fecha:</b> {new Date(post.fecha).toLocaleDateString()}{" "}
              &nbsp;&nbsp;&nbsp;
              <b>Categoría:</b> {post.categoria}
            </p>
          </div>
        </div>
      </div>

      <div className="share-section">
        <PostStats postId={id} postTitulo={post?.titulo} />

        <h3>Compartir en redes:</h3>
        <div className="share-buttons">
          <a
            href={`https://api.whatsapp.com/send?text=${mensaje}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn whatsapp"
          >
            <FaWhatsapp size={30} />
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${mensaje}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn facebook"
          >
            <FaFacebook size={30} />
          </a>

          <a
            onClick={() => {
              navigator.clipboard.writeText(currentUrl);
              Swal.fire({
                icon: "success",
                title: "¡Link copiado!",
                text: "Pegalo en tus historias de Instagram.",
                confirmButtonText: "Ok",
                timer: 2500,
                timerProgressBar: true,
              });
            }}
            className="share-btn instagram"
            title="Copiá el link y compartilo en tus historias"
          >
            <FaInstagram size={30} />
          </a>
        </div>
      </div>

      {portadaOptimizada && (
        <img
          src={portadaOptimizada}
          alt="portada"
          className="preview-portada"
          loading="eager"
          decoding="async"
          width="800"
        />
      )}

      <p>
        <i>{post.epigrafe}</i>
      </p>

      <div
        className="imagen-fija-1200"
        dangerouslySetInnerHTML={{ __html: contenidoOptimizado }}
      />

      <PostStats postId={id} postTitulo={post?.titulo} />

      <div
        style={{
          backgroundColor: "#fff3cd",
          borderLeft: "6px solid #ffc107",
          padding: "1rem",
          borderRadius: "8px",
          fontFamily: "sans-serif",
          color: "#856404",
          marginBottom: "1.5rem",
          marginTop: "2rem"
        }}
      >
        <p style={{ margin: "0 0 0.5rem 0" }}>
          <strong
            style={{
              display: "block",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            ⚠️ Aviso importante:
          </strong>
          Este contenido es informativo y refleja la experiencia desde el
          acompañamiento terapéutico. No reemplaza la consulta con profesionales
          de la salud mental. Si experimentás síntomas persistentes o
          preocupantes, te recomendamos buscar ayuda especializada.
        </p>
        <p style={{ margin: "0.5rem 0 0 0" }}>
          Si conocés a alguien que le pueda interesar este tema, compartile este
          post. Además, te invito a descargar la guía gratuita en PDF sobre la
          introducción de IA en la parte de abajo 👇
        </p>
      </div>

      <div
        style={{
          borderLeft: "30px solid #42a5f5",
          backgroundColor: " #194542",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "6px",
          padding: "0.75rem 1rem",
          marginBottom: "3rem",
          fontSize: "1.5rem",
          fontWeight: "500",
          display: "flex",
        }}
      >
        <a
          style={{
            borderBottom: "2px solid white",
            borderRadius: "6px",
            padding: "0.75rem 1rem",
            marginBottom: "0.5rem",
            fontSize: "1.5rem",
            fontWeight: "500",
            display: "flex",
            textDecoration: "none",
            color: "white",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
          href={`https://empatiadigital.com.ar/descargas`}
        >
          Descarga la guía PDF GRATIS
        </a>
      </div>

      {postsRelacionados.length > 0 && (
        <div className="contenido-interes-section" style={{ marginTop: "3rem", borderTop: "2px solid #eaeaea", paddingTop: "2rem" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "#1a1a1a" }}>
            🎯 Artículos relacionados de {post.categoria}:
          </h3>
          <div 
            className="relacionados-grid" 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
              gap: "1.5rem" 
            }}
          >
            {postsRelacionados.map((relPost) => (
              <div
                key={relPost._id}
                onClick={() => {
                  navigate(`/post/${relPost._id}`);
                  window.scrollTo(0, 0);
                }}
                style={{
                  cursor: "pointer",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease",
                  display: "flex",
                  flexDirection: "column"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <img
                  src={relPost.portada ? optimizarPortada(relPost.portada) : fondo}
                  alt={relPost.titulo}
                  style={{ width: "100%", height: "150px", objectFit: "cover" }}
                  loading="lazy"
                />
                <div style={{ padding: "1rem", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", margin: "0 0 0.5rem 0", color: "#2d3748", lineBreak: "anywhere" }}>
                    {relPost.titulo.length > 60 ? `${relPost.titulo.substring(0, 60)}...` : relPost.titulo}
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "#718096", margin: "auto 0 0 0", fontStyle: "italic" }}>
                    Por: {relPost.autor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCompleto;
