// HomePageOptimizado.js
import React, { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import "../style/HomePage.css";
import fondo1 from "../assets/Portada1.jpg";
import fondo2 from "../assets/Portada2.jpg";
import fondo3 from "../assets/Portada3.jpg";

const ModalActividades = lazy(() => import("../components/ModalActividades"));

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/64/64/64572.png";

export default function HomePageOptimizado() {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [fondo1, fondo2, fondo3];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 8000); // menos frecuencia
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("https://empatia-dominio-back.vercel.app/api/posts");
        const data = await res.json();
        setPosts(data);
        setCargando(false);
      } catch (error) {
        console.error("Error al obtener posts:", error);
        setCargando(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePrev = () => {
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const postsToShow = posts.slice(0, 6);

  return (
    <>
      <Suspense fallback={<div>Cargando actividades...</div>}>
        <ModalActividades />
      </Suspense>

      <div className="homepage">
        <div className="carousel-wrapper">
          <img
            src={slides[slideIndex]}
            className="carousel-image active"
            alt={`Slide ${slideIndex}`}
            loading="lazy"
          />

          <button className="carousel-btn left" onClick={handlePrev}>
            ❮
          </button>
          <button className="carousel-btn right" onClick={handleNext}>
            ❯
          </button>

          <div className="carousel-dots">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === slideIndex ? "active" : ""}`}
              ></span>
            ))}
          </div>

          <div className="overlay">
            <h1>Crianza Digital con Empatía</h1>
            <button className="btn-ver-mas" onClick={() => navigate("/post")}>Ver más</button>
          </div>
        </div>

        {/* SECCIÓN DE POSTS */}
        <section className="posts-section">
          <h2 className="titulo-principal">Publicaciones Recientes</h2>

          {cargando ? (
            <p>Cargando posts...</p>
          ) : postsToShow.length === 0 ? (
            <p>No hay posts para mostrar.</p>
          ) : (
            <div className="lista-posts-container">
              {postsToShow.map((post) => {
                let categoria = "Sentidos";
                if (Array.isArray(post.categoria) && post.categoria.length > 0) {
                  categoria = post.categoria[0].trim();
                } else if (typeof post.categoria === "string" && post.categoria.trim() !== "") {
                  categoria = post.categoria.trim();
                }

                return (
                  <div key={post._id} className="post-card">
                    <img
                      src={post.portada || fondo1}
                      alt={post.titulo}
                      className="post-img"
                      loading="lazy"
                    />
                    <div className="post-content-overlay-home">
                      <img
                        src={post.avatar || DEFAULT_AVATAR}
                        alt="avatar"
                        className="avatar"
                        width={40}
                        height={40}
                      />
                      <div className="autor-div">
                        <h3>{post.titulo}</h3>
                        <h4 className="autor">Por: {post.autor}</h4>
                      </div>
                      <button
                        className="btn-ver-mas"
                        onClick={() => navigate(`/post/${post._id}`)}
                      >
                        Ver más
                      </button>
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
