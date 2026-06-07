// Post.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Post.css";
import fondo from "../assets/Juego.jpeg";
import PostStatsMini from "../components/PostStatsMini";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";
const POSTS_PER_PAGE = 6;

export default function Post() {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1); // Manejado por el Servidor
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostsPaginados = async () => {
      setCargando(true);
      try {
        const res = await fetch(
          `https://empatia-dominio-back.vercel.app/api/posts?page=${paginaActual}&limit=${POSTS_PER_PAGE}`
        );
        const data = await res.json();

        setPosts(data.posts || []);
        setTotalPaginas(data.totalPaginas || 1);
        setCargando(false);
      } catch (error) {
        console.error("Error al obtener posts paginados:", error);
        setCargando(false);
      }
    };

    fetchPostsPaginados();
  }, [paginaActual]);

  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Sube suave al cambiar de página
    }
  };

  return (
    <div className="post-page">
      <h2 className="titulo-principal">Todas las Publicaciones</h2>

      {/* Paginación Superior */}
      {!cargando && posts.length > 0 && (
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
      )}

      {cargando ? (
        <p className="post-loading">Cargando publicaciones...</p>
      ) : posts.length === 0 ? (
        <p className="post-no-data">No hay posts disponibles por el momento.</p>
      ) : (
        <>
          <div className="lista-posts-container">
            {posts.map((post, index) => {
              // Limpieza segura de la categoría
              let categoria = "Sentidos";
              if (Array.isArray(post.categoria) && post.categoria.length > 0 && typeof post.categoria[0] === "string") {
                categoria = post.categoria[0].trim();
              } else if (typeof post.categoria === "string" && post.categoria.trim() !== "") {
                categoria = post.categoria.trim();
              }

              // Definimos la URL de la imagen de portada
              const imageSrc = post.portada ? post.portada : fondo;

              return (
                <div key={post._id} className="post-card">
                  {/* Optimizador LCP: 
                    Si es el primer post de la página actual (index === 0), se precarga inmediatamente.
                    Si es cualquiera de los otros (index > 0), se les aplica lazy-load para ahorrar datos.
                  */}
                  <img
                    src={imageSrc}
                    alt={`Portada de ${post.titulo}`}
                    className="post-card-background-img"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                  />

                  <div className="post-card-overlay">
                    <div className="post-header">
                      <span className="card-badge">{categoria}</span>
                      <img
                        src={post.avatar || DEFAULT_AVATAR}
                        alt={`Avatar de ${post.autor}`}
                        className="avatar"
                        loading="lazy"
                      />
                      <div className="post-header-content">
                        <h3 className="post-title">{post.titulo}</h3>
                        <p className="post-autor">Por: {post.autor}</p>
                      </div> 
                    </div>

                    <div className="card-footer">
                      <button
                        className="btn-ver-mas"
                        onClick={() => navigate(`/post/${post._id}`)}
                      >
                        Ver más
                      </button>
                      <PostStatsMini postId={post._id} />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Paginación Inferior */}
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
