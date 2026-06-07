// HomePage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/HomePage.css";
import ModalActividades from "../components/ModalActividades";
import PostStatsMini from "../components/PostStatsMini";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";

export default function HomePage() {
  const [posts, setPosts]       = useState(Array.isArray(window.__INITIAL_POSTS__) ? window.__INITIAL_POSTS__ : []);
  const [destacados, setDestacados] = useState([]); // Estado para carrusel optimizado en contingencia
  const [cargando, setCargando] = useState(!window.__INITIAL_POSTS__);
  const navigate                = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  // Fetch de contingencia optimizado: Blindado contra respuestas HTML 503 de Vercel
  const fetchPostsContingencia = async () => {
    try {
      const [resRecientes, resVotados] = await Promise.all([
        fetch("https://empatia-dominio-back.vercel.app/api/posts?limit=6"),
        fetch("https://empatia-dominio-back.vercel.app/api/posts?limit=3&sort=votos")
      ]);

      // Si el backend da 503, res.ok es false. Tiramos error para saltar directo al catch
      if (!resRecientes.ok || !resVotados.ok) {
        throw new Error(`Error de red: Recientes (${resRecientes.status}) | Votados (${resVotados.status})`);
      }

      const dataRecientes = await resRecientes.json();
      const dataVotados   = await resVotados.json();

      // Validación defensiva de formato: detecta si viene array directo o propiedad .posts
      const finalRecientes = Array.isArray(dataRecientes) 
        ? dataRecientes 
        : (dataRecientes && Array.isArray(dataRecientes.posts) ? dataRecientes.posts : []);

      const finalVotados = Array.isArray(dataVotados) 
        ? dataVotados 
        : (dataVotados && Array.isArray(dataVotados.posts) ? dataVotados.posts : []);

      setPosts(finalRecientes);
      setDestacados(finalVotados);
      setCargando(false);
    } catch (error) {
      console.error("Error controlado al obtener posts en contingencia:", error);
      // Forzamos a que mantengan el tipo array para que no rompa el renderizado
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

  // Variables de mapeo aseguradas como arrays legítimos
  const topSlides = window.__INITIAL_POSTS__ && Array.isArray(window.__INITIAL_POSTS__) && window.__INITIAL_POSTS__.length > 0
    ? (Array.isArray(posts) ? [...posts].sort((a, b) => (b.votos || b.likes || 0) - (a.votos || a.likes || 0)).slice(0, 3) : [])
    : (Array.isArray(destacados) ? destacados : []);

  // Auto-avance del carrusel
  useEffect(() => {
    if (topSlides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % topSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [topSlides.length]);

  const handlePrev = () =>
    setSlideIndex((prev) => (prev - 1 + topSlides.length) % topSlides.length);
  const handleNext = () =>
    setSlideIndex((prev) => (prev + 1) % topSlides.length);

  // Garantía absoluta de que hereda un método .slice válido
  const postsToShow = Array.isArray(posts) ? posts.slice(0, 6) : [];
  const currentSlidePost = topSlides[slideIndex];

  return (
    <>
      <ModalActividades />

      <div className="homepage">

        {/* ── CARRUSEL DINÁMICO DE POSTS MÁS VOTADOS ─────────────────────────────── */}
        <div className="carousel-wrapper">
          
          {cargando ? (
            <div className="carousel-skeleton" style={{ height: "100%", background: "#222" }} />
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
