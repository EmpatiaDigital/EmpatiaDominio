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
  const [totalPaginas, setTotalPaginas] = useState(1); // Controlado ahora por el Servidor
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostsPaginados = async () => {
      setCargando(true); // Activamos el loader en cada transición de página
      try {
        // Le pegamos al nuevo flujo del controlador usando Query Params
        const res = await fetch(
          `https://empatia-dominio-back.vercel.app/api/posts?page=${paginaActual}&limit=${POSTS_PER_PAGE}`
        );
        const data = await res.json();

        // Mapeamos la respuesta estructurada del Backend
        setPosts(data.posts || []);
        setTotalPaginas(data.totalPaginas || 1);
        setCargando(false);
      } catch (error) {
        console.error("Error al obtener posts paginados:", error);
        setCargando(false);
      }
    };

    fetchPostsPaginados();
  }, [paginaActual]); // Cada vez que cambie la página, ejecuta el fetch automáticamente

  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
      // Opcional: Hace scroll suave hacia arriba al cambiar de página para mejorar la UX
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="post-page">
      <h2 className="titulo-principal">Todas las Publicaciones</h2>

      {/* Bloque superior de paginación para facilitar la navegación rápida */}
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
            {posts.map((post) => {
              // Limpieza y formateo de la categoría antes de renderizar
              let categoria = "Sentidos";
              if (Array.isArray(post.categoria) && post.categoria.length > 0 && typeof post.categoria[0] === "string") {
                categoria = post.categoria[0].trim();
              } else if (typeof post.categoria === "string" && post.categoria.trim() !== "") {
                categoria = post.categoria.trim();
              }

              const backgroundImage = post.portada
                ? `url(${post.portada})`
                : `url(${fondo})`;

              return (
                <div
                  key={post._id}
                  className="post-card"
                  style={{ backgroundImage }}
                >
                  <div className="post-card-overlay">
                    
                    <div className="post-header">
                      {/* Corregido: Ahora usa la variable 'categoria' parseada arriba de forma segura */}
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

          {/* Bloque inferior de paginación */}
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
