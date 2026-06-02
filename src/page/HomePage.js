// HomePage.js — rediseño visual, lógica 100% intacta
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/HomePage.css";
import fondo1 from "../assets/Portada1.jpg";
import fondo2 from "../assets/Portada2.jpg";
import fondo3 from "../assets/conexion.jpg";
import ModalActividades from "../components/ModalActividades";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";

export default function HomePage() {
  const [posts, setPosts]       = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate                = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [fondo1, fondo2, fondo3];

  // Auto-avance del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Fetch de posts
  const fetchPosts = async () => {
    try {
      const res  = await fetch("https://empatia-dominio-back.vercel.app/api/posts");
      const data = await res.json();
      setPosts(data);
      setCargando(false);
    } catch (error) {
      console.error("Error al obtener posts:", error);
      setCargando(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePrev = () =>
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const handleNext = () =>
    setSlideIndex((prev) => (prev + 1) % slides.length);

  const postsToShow = posts.slice(0, 6);

  return (
    <>
      <ModalActividades />

      <div className="homepage">

        {/* ── CARRUSEL ─────────────────────────────── */}
        <div className="carousel-wrapper">

          {slides.map((slide, i) => (
            <img
              key={i}
              src={slide}
              loading="lazy"
              className={`carousel-image ${i === slideIndex ? "active" : ""}`}
              alt={`Slide ${i + 1}`}
            />
          ))}

          {/* Overlay con eyebrow + título + CTA */}
          <div className="overlay">
            <span className="overlay-eyebrow">Comunidad · Familia · Tecnología</span>
            <h1>Crianza Digital<br />con Empatía</h1>
            <button className="btn-hero" onClick={() => navigate("/post")}>
              Ver publicaciones
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>

          {/* Controles */}
          <button className="carousel-btn left"  onClick={handlePrev} aria-label="Anterior">❮</button>
          <button className="carousel-btn right" onClick={handleNext} aria-label="Siguiente">❯</button>

          <div className="carousel-dots" role="tablist">
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === slideIndex}
                className={`dot ${i === slideIndex ? "active" : ""}`}
                onClick={() => setSlideIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── SECCIÓN DE POSTS ───────────────────────<p className="section-eyebrow">Blog</p> */}
        <section className="posts-section">

          <div className="posts-section-header">
            <div>
              
              <h2 className="titulo-principal">Publicaciones recientes</h2>
            </div>
            <button className="section-ver-todas" onClick={() => navigate("/post")}>
              Ver todas
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>

          {/* Estados */}
          {cargando ? (
            <div className="posts-skeleton">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : postsToShow.length === 0 ? (
            <p className="posts-empty">No hay publicaciones para mostrar.</p>
          ) : (
            <div className="lista-posts-container">
              {postsToShow.map((post, idx) => {

                // Resolución de categoría (lógica original intacta)
                let categoria = "Sentidos";
                if (Array.isArray(post.categoria) && post.categoria.length > 0 && typeof post.categoria[0] === "string") {
                  categoria = post.categoria[0].trim();
                } else if (typeof post.categoria === "string" && post.categoria.trim() !== "") {
                  categoria = post.categoria.trim();
                }

                const backgroundImage = post.portada
                  ? `url(${post.portada})`
                  : `url(${fondo1})`;

                return (
                  <div
                    key={post._id}
                    className={`post-card${idx === 0 ? " post-card--featured" : ""}`}
                    style={{ backgroundImage, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
                    onClick={() => navigate(`/post/${post._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/post/${post._id}`)}
                  >
                    {/* Badge categoría */}
                    <span className="card-badge">{categoria}</span>

                    {/* Overlay de contenido */}
                    <div className="post-content-overlay-home">

                      {/* Fila: avatar + autor */}
                      <div className="card-meta">
                        <img
                          src={post.avatar || DEFAULT_AVATAR}
                          alt={`Avatar de ${post.autor}`}
                          className="avatar"
                          loading="lazy"
                        />
                        <span className="autor">Por {post.autor}</span>
                      </div>

                      {/* Título */}
                      <h3>{post.titulo}</h3>

                      {/* Botón */}
                      <div className="card-footer">
                        <button
                          className="btn-ver-mas"
                          onClick={(e) => { e.stopPropagation(); navigate(`/post/${post._id}`); }}
                        >
                          Leer artículo
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" />
                          </svg>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
