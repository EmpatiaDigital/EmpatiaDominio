// HomePage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/HomePage.css";
import ModalActividades from "../components/ModalActividades";
import PostStatsMini from "../components/PostStatsMini";

// Dejamos un placeholder ligero o color de fondo por si un post no tiene imagen de portada
const FALLBACK_COVER = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";

export default function HomePage() {
  const [posts, setPosts]       = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate                = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  // Fetch de posts completo (asincrónico de fondo)
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

  useEffect(() => { 
    fetchPosts(); 
  }, []);

  // OBTENCIÓN DE SLIDES: Si React todavía no terminó su fetch,
  // usamos los datos del Early Fetch del index.html para no mostrar un bloque vacío.
  const topSlides = posts.length > 0
    ? [...posts].sort((a, b) => (b.votos || b.likes || 0) - (a.votos || a.likes || 0)).slice(0, 3)
    : (window.__INITIAL_TOP_POSTS__ || []);

  // Auto-avance del carrusel (solo si hay slides cargados)
  useEffect(() => {
    if (topSlides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % topSlides.length);
    }, 6000); // 6 segundos para dar tiempo a leer el título destacado
    return () => clearInterval(interval);
  }, [topSlides.length]);

  const handlePrev = () =>
    setSlideIndex((prev) => (prev - 1 + topSlides.length) % topSlides.length);
  const handleNext = () =>
    setSlideIndex((prev) => (prev + 1) % topSlides.length);

  const postsToShow = posts.slice(0, 6);

  // Post actualmente activo en el carrusel
  const currentSlidePost = topSlides[slideIndex];

  return (
    <>
      <ModalActividades />

      <div className="homepage">

        {/* ── CARRUSEL DINÁMICO DE POSTS MÁS VOTADOS ─────────────────────────────── */}
        <div className="carousel-wrapper">
          
          {/* Si está cargando pero ya tenemos el Early Fetch en window, evitamos el skeleton */}
          {cargando && topSlides.length === 0 ? (
            <div className="carousel-skeleton" style={{ height: "100%", background: "#222" }} />
          ) : topSlides.length === 0 ? (
            <div className="carousel-empty">No hay publicaciones destacadas.</div>
          ) : (
            <>
              {topSlides.map((post, i) => {
                let imgSrc = post.portada || post.imagen || post.img || FALLBACK_COVER;
                
                // Mismo truco del index.html: si es mobile y viene de Cloudinary, machacamos el string
                // para que coincida exactamente con la precarga del navegador
                if (i === 0 && window.innerWidth <= 768 && typeof imgSrc === "string") {
                  imgSrc = imgSrc.replace('/w_800/', '/w_450/');
                }

                return (
                  <img
                    key={post._id || i}
                    src={imgSrc}
                    // TRUCO DE RENDIMIENTO: El primer slide se descarga de inmediato, los demás esperan
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    className={`carousel-image ${i === slideIndex ? "active" : ""}`}
                    alt={post.titulo}
                  />
                );
              })}

              {/* Overlay dinámico basado en el Post activo */}
              {currentSlidePost && (
                <div className="overlay">
                  <span className="overlay-eyebrow">
                    Destacado · {Array.isArray(currentSlidePost.categoria) ? currentSlidePost.categoria[0] : currentSlidePost.categoria || "General"}
                  </span>
                  <h1>{currentSlidePost.titulo}</h1>
                  
                  <button 
                    className="btn-hero" 
                    onClick={() => navigate(`/post/${currentSlidePost._id}`)}
                  >
                    Leer artículo completo
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Controles */}
              <button className="carousel-btn left"  onClick={handlePrev} aria-label="Anterior">❮</button>
              <button className="carousel-btn right" onClick={handleNext} aria-label="Siguiente">❯</button>

              {/* Dots */}
              <div className="carousel-dots" role="tablist">
                {topSlides.map((_, i) => (
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
            </>
          )}
        </div>

        {/* ── SECCIÓN DE POSTS RECIENTES ─────────────────────── */}
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

          {/* Estados del listado inferior */}
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

                let categoria = "Sentidos";
                if (Array.isArray(post.categoria) && post.categoria.length > 0 && typeof post.categoria[0] === "string") {
                  categoria = post.categoria[0].trim();
                } else if (typeof post.categoria === "string" && post.categoria.trim() !== "") {
                  categoria = post.categoria.trim();
                }

                const backgroundImage = post.portada
                  ? `url(${post.portada})`
                  : `url(${FALLBACK_COVER})`;

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
                    <span className="card-badge">{categoria}</span>

                    <div className="post-content-overlay-home">
                      <div className="card-meta">
                        <img
                          src={post.avatar || DEFAULT_AVATAR}
                          alt={`Avatar de ${post.autor}`}
                          className="avatar"
                          loading="lazy"
                        />
                        <span className="autor">Por {post.autor}</span>
                      </div>

                      <h3>{post.titulo}</h3>

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

                        <PostStatsMini postId={post._id} />
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
