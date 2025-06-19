import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Post.css";
import fondo from "../assets/Juego.jpeg";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";
const POSTS_PER_PAGE = 6;

export default function Post() {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/posts");
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
  
  const totalPaginas = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (paginaActual - 1) * POSTS_PER_PAGE;
  const postsActuales = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
    }
  };

  return (
    <div className="post-page">
      <h2 className="titulo-principal">Todas las Publicaciones</h2>

      {cargando ? (
        <p className="post-loading">Cargando posts...</p>
      ) : posts.length === 0 ? (
        <p className="post-no-data">No hay posts disponibles.</p>
      ) : (
        <>
         <div className="post-paginacion">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="paginacion-btn"
            >
              {"<"}
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                className={`paginacion-btn ${
                  paginaActual === i + 1 ? "activo" : ""
                }`}
                onClick={() => cambiarPagina(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="paginacion-btn"
            >
              {">"}
            </button>
          </div>
          <div className="lista-posts-container">
            {postsActuales.map((post) => {
              const categoria = Array.isArray(post.categoria)
                ? post.categoria[0]
                : post.categoria || "Sentidos";

              const backgroundImage = post.portada
                ? `url(${post.portada})`
                : `url(${fondo})`;

              return (
                <div
                  key={post._id}
                  className="post-card"
                  style={{
                    backgroundImage,
                  }}
                >
                  <div className="post-card-overlay">
                    <div className="post-header">
                      <img
                        src={post.avatar || DEFAULT_AVATAR}
                        alt="avatar"
                        className="avatar"
                      />
                      <div className="post-header-content">
                        <h3 className="post-title">{post.titulo}</h3>
                        <p className="post-autor">Por: {post.autor}</p>
                      </div>
                    </div>
                     <div><button
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

          <div className="post-paginacion">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="paginacion-btn"
            >
              {"<"}
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                className={`paginacion-btn ${
                  paginaActual === i + 1 ? "activo" : ""
                }`}
                onClick={() => cambiarPagina(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="paginacion-btn"
            >
              {">"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}