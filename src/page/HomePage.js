// HomePage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/HomePage.css";
import ModalActividades from "../components/ModalActividades";
import PostStatsMini from "../components/PostStatsMini";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";

// ── Dimensiones fijas del carrusel reservadas antes de cualquier fetch ────────
// Esto elimina el CLS del hero: el browser reserva el espacio exacto desde el inicio
const CAROUSEL_STYLE = {
  height: "clamp(320px, 55vw, 600px)",
  minHeight: "320px",
  background: "#111827",
  position: "relative",
  overflow: "hidden",
};

export default function HomePage() {
  const [posts, setPosts]           = useState(Array.isArray(window.__INITIAL_POSTS__) ? window.__INITIAL_POSTS__ : []);
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando]     = useState(!window.__INITIAL_POSTS__);
  const navigate                    = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const fetchPostsContingencia = async () => {
    try {
      // Un solo fetch con los 6 posts — los 3 más votados los derivamos localmente
      // Evita el cold start doble de Vercel que costaba ~2-3s extra en LCP
      const res = await fetch("https://empatia-dominio-back.vercel.app/api/posts?limit=6");

      if (!res.ok) throw new Error(`Error de red: ${res.status}`);

      const data = await res.json();
      const final = Array.isArray(data) ? data : (data && Array.isArray(data.posts) ? data.posts : []);

      setPosts(final);
      // Derivamos los destacados localmente sin un segundo fetch
      const votados = [...final].sort((a, b) => (b.votos || b.likes || 0) - (a.votos || a.likes || 0)).slice(0, 3);
      setDestacados(votados);
      setCargando(false);
    } catch (error) {
      console.error("Error controlado al obtener posts:", error);
      setPosts((prev) => (Array.isArray(prev) ? prev : []));
      setDestacados([]);
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!window.__INITIAL_POSTS__ || window.__INITIAL_POSTS__.length === 0) {
      fetchPostsContingencia();
    }
  }, []);

  const topSlides = window.__INITIAL_POSTS__ && Array.isArray(window.__INITIAL_POSTS__) && window.__INITIAL_POSTS__.length > 0
    ? [...posts].sort((a, b) => (b.votos || b.likes || 0) - (a.votos || a.likes || 0)).slice(0, 3)
    : destacados;

  useEffect(() => {
    if (topSlides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % topSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [topSlides.length]);

  const handlePrev = () => setSlideIndex((prev) => (prev - 1 + topSlides.length) % topSlides.length);
  const handleNext = () => setSlideIndex((prev) => (prev + 1) % topSlides.length);

  const postsToShow      = Array.isArray(posts) ? posts.slice(0, 6) : [];
  const currentSlidePost = topSlides[slideIndex];

  return (
    <>
      <ModalActividades />

      <div className="homepage">

        {/* ── CARRUSEL ─────────────────────────────────────────────────────────── */}
        {/* style inline garantiza que el espacio está reservado ANTES del JS     */}
        <div className="carousel-wrapper" style={CAROUSEL_STYLE}>

          {cargando ? (
            // Skeleton con altura heredada del padre — sin colapso ni re-expansión
            <div style={{ position: "absolute", inset: 0, background: "#1e293b" }} />
          ) : topSlides.length === 0 ? (
            <div className="carousel-empty">No hay publicaciones destacadas.</div>
          ) : (
            <>
              {topSlides.map((post, i) => {
                let imgSrc = post.portada || post.imagen || post.img || FALLBACK_COVER;
                if (i === 0 && window.innerWidth <= 768 && typeof imgSrc === "string") {
                  imgSrc = imgSrc.replace('/w_800/', '/w_450/');
                }
                return (
                  <img
                    key={post._id || i}
                    src={imgSrc}
                    // width/height explícitos para que el browser calcule aspect-ratio
                    // sin esperar a que descargue la imagen → elimina CLS
                    width={1200}
                    height={600}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding={i === 0 ? "sync" : "async"}
                    className={`carousel-image ${i === slideIndex ? "active" : ""}`}
                    alt={post.titulo || "Publicación destacada"}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                );
              })}

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

              <button className="carousel-btn left"  onClick={handlePrev} aria-label="Anterior">❮</button>
              <button className="carousel-btn right" onClick={handleNext} aria-label="Siguiente">❯</button>

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

        {/* ── POSTS RECIENTES ──────────────────────────────────────────────────── */}
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

                const bgUrl = post.portada || FALLBACK_COVER;

                return (
                  <div
                    key={post._id}
                    className={`post-card${idx === 0 ? " post-card--featured" : ""}`}
                    onClick={() => navigate(`/post/${post._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/post/${post._id}`)}
                  >
                    {/* ── Imagen como <img> en vez de backgroundImage ────────────────
                        El browser puede calcular dimensiones y reservar espacio
                        antes de descargar → elimina el CLS de las cards           */}
                    <img
                      src={bgUrl}
                      alt={post.titulo || "Portada del artículo"}
                      className="post-card-img"
                      loading={idx === 0 ? "eager" : "lazy"}
                      fetchPriority={idx === 0 ? "high" : "low"}
                      width={600}
                      height={400}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        zIndex: 0,
                      }}
                    />

                    <span className="card-badge">{categoria}</span>

                    <div className="post-content-overlay-home">
                      <div className="card-meta">
                        <img
                          src={post.avatar || DEFAULT_AVATAR}
                          alt={`Avatar de ${post.autor}`}
                          className="avatar"
                          loading="lazy"
                          width={32}
                          height={32}
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
