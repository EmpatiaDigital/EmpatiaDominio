// src/components/PostDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

// Reemplaza todos los src de imágenes Cloudinary dentro del HTML del contenido
const optimizarImagenesEnHtml = (html) => {
  if (!html) return html;
  return html.replace(
    /(src=")(https:\/\/res\.cloudinary\.com\/[^"]+)(")/g,
    (match, pre, url, post) => {
      // Evitar doble transformación
      if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto")) {
        return match;
      }
      const urlOptimizada = url.replace("/upload/", "/upload/f_auto,q_auto,w_1200/");
      return `${pre}${urlOptimizada}${post}`;
    }
  );
};
// ──────────────────────────────────────────────────────────────────────────────

const PostCompleto = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [cargando, setCargando] = useState(true);

  const shareUrl = `https://empatia-dominio-back.vercel.app/api/posts/${id}/preview`;
  const currentUrl = `${window.location.origin}/post/${id}`;

  const mensaje = post
    ? encodeURIComponent(`${post.titulo} – Leé este post en Empatía Digital este es lo nuevo: ${shareUrl} `)
    : "";

  useEffect(() => {
    const enlaces = document.querySelectorAll(".post-content a");
    enlaces.forEach((a) => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("http")) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `https://empatia-dominio-back.vercel.app/api/posts/${id}`
        );
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

  // Aplicar lazy loading a las imágenes del contenido HTML una vez que el post carga
  useEffect(() => {
    if (!post) return;
    const imgs = document.querySelectorAll(".imagen-fija-1200 img, .post-content img");
    imgs.forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    });
  }, [post]);

  if (cargando) return <p>Cargando post...</p>;
  if (!post) return <p>No se encontró el post.</p>;

  // Contenido con URLs de imágenes optimizadas
  const contenidoOptimizado = optimizarImagenesEnHtml(post.contenido);
  // Portada optimizada
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
          marginBottom: "0.5rem",
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
    </div>
  );
};

export default PostCompleto;
