// MyPost.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import fondo from "../assets/Juego.jpeg";
import "../style/MyPost.css";

export default function MyPost() {
  const [publicaciones, setPublicaciones] = useState([]);
  const { user } = useAuth();
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/64/64572.png";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/posts");
        const data = await res.json();
        const userId = localStorage.getItem("userId");

        const publicacionesFiltradas = data.filter(
          (item) => String(item.PostId) === String(userId)
        );

        setPublicaciones(publicacionesFiltradas);
        setCargando(false);
      } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        setCargando(false);
      }
    };

    fetchPosts();
  }, []);

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Querés eliminar esta publicación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) throw new Error("No se pudo eliminar la publicación");

        Swal.fire("Eliminado", "La publicación fue eliminada correctamente", "success");

        setPublicaciones(publicaciones.filter((item) => item._id !== id));
      } catch (error) {
        Swal.fire(
          "Error",
          error.message || "No se pudo eliminar la publicación",
          "error"
        );
      }
    }
  };

  if (!user) return <p>Debés iniciar sesión para ver tus publicaciones.</p>;
  if (cargando) return <p>Cargando publicaciones...</p>;

  return (
    <div className="contenedor-publicaciones">
      <h2 className="titulo-publicaciones">Mis Publicaciones</h2>
      {publicaciones.length === 0 ? (
        <p>No tenés publicaciones aún.</p>
      ) : (
        <div className="grid-publicaciones">
          {publicaciones.map((item) => {
            const bg = item.portada ? `url(${item.portada})` : `url(${fondo})`;

            return (
              <div
                key={item._id}
                className="card-publicacion"
                style={{
                  backgroundImage: bg,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="contenido-card">
                  <div className="cabecera">
                    <img
                      src={item.avatar || DEFAULT_AVATAR}
                      alt="avatar"
                      className="avatar-img"
                    />
                    <div>
                      <h3>{item.titulo}</h3>
                      <h4 className="autor">Por: {item.autor}</h4>
                    </div>
                  </div>
                </div>
                <div className="acciones">
                  <button className="btn-my-post-editar" onClick={() => navigate(`/editar/${item._id}`)}>
                    Editar
                  </button>
                  <button className="btn-my-post-eliminar" onClick={() => handleEliminar(item._id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
