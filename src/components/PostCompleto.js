// src/components/PostDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import fondo from "../assets/Juego.jpeg";
import "../style/PostCompleto.css";
import { FaFacebook, FaWhatsapp, FaInstagram } from "react-icons/fa";
import Swal from "sweetalert2";


const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";

const PostCompleto = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [cargando, setCargando] = useState(true);

  const currentUrl = `${window.location.origin}/post/${id}`;
  const mensaje = post
  ? encodeURIComponent(`\`\`\`${post.titulo}\`\`\` – Leé este post en Empatía Digital: ${currentUrl}`)
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

  if (cargando) return <p>Cargando post...</p>;
  if (!post) return <p>No se encontró el post.</p>;

  return (
    <div className="post-detalle">
      <h2 className="post-completo-title">{post.titulo}</h2>

      <div className="post-header">
        <img
          src={post.avatar || DEFAULT_AVATAR}
          alt="avatar"
          className="avatar"
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
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              currentUrl
            )}`}
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
      {post.portada && (
        <img src={post.portada} alt="portada" className="preview-portada" />
      )}
      <p>
        <i>{post.epigrafe}</i>
      </p>

      <div
        className="imagen-fija-1200"
        dangerouslySetInnerHTML={{ __html: post.contenido }}
      />
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
          justifyContent: "center", // Centra horizontalmente el contenido
          alignItems: "center", // Centra verticalmente
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
            borderBottom: "2px solid white", // Línea inferior blanca
            borderRadius: "6px",
            padding: "0.75rem 1rem",
            marginBottom: "0.5rem",
            fontSize: "1.5rem",
            fontWeight: "500",
            display: "flex",
            textDecoration: "none", // Sin subrayado clásico
            color: "white", // Color de texto blanco
            backgroundColor: "transparent", // Fondo transparente
            cursor: "pointer", // Cursor tipo manito
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
