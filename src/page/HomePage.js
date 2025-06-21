// HomePage.js (con lazy loading agregado, sin cambiar diseño)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/HomePage.css";
import fondo1 from "../assets/Portada1.jpg";
import fondo2 from "../assets/Portada2.jpg";
import fondo3 from "../assets/conexion.jpg";
import ModalActividades from "../components/ModalActividades";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";
export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [fondo1, fondo2, fondo3];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

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

  useEffect(() => {
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
      <ModalActividades />

      <div className="homepage">
        <div className="carousel-wrapper">
          {slides.map((slide, i) => (
            <img
              key={i}
              src={slide}
              loading="lazy"
              className={`carousel-image ${i === slideIndex ? "active" : ""}`}
              alt={`Slide ${i}`}
            />
          ))}
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
          <div>
            <h2 className="titulo-principal">Publicaciones Recientes</h2>
          </div>
          {cargando ? (
            <p>Cargando posts...</p>
          ) : postsToShow.length === 0 ? (
            <p>No hay posts para mostrar.</p>
          ) : (
            <div className="lista-posts-container">
              {postsToShow.map((post) => {
                let categoria = "Sentidos";
                if (
                  Array.isArray(post.categoria) &&
                  post.categoria.length > 0 &&
                  typeof post.categoria[0] === "string"
                ) {
                  categoria = post.categoria[0].trim();
                } else if (
                  typeof post.categoria === "string" &&
                  post.categoria.trim() !== ""
                ) {
                  categoria = post.categoria.trim();
                }

                const backgroundImage = post.portada
                  ? `url(${post.portada})`
                  : `url(${fondo1})`;

                return (
                  <div
                    key={post._id}
                    className="post-card"
                    style={{
                      backgroundImage: backgroundImage,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <div className="post-content-overlay-home">
                      <img
                        src={post.avatar || DEFAULT_AVATAR}
                        alt="avatar"
                        className="avatar"
                        loading="lazy"
                      />
                      <div className="autor-div">
                        <h3>{post.titulo}</h3>
                        <h4 className="autor">Por: {post.autor}</h4>
                      </div>
                      <div>
                        <button
                          className="btn-ver-mas"
                          onClick={() => navigate(`/post/${post._id}`)}
                        >
                          Ver más
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
