// import "../style/PostStats.css"; src/components/PostStats.jsx


import React, { useEffect, useState, useCallback } from "react";
import { FiThumbsUp, FiThumbsDown, FiEye } from "react-icons/fi";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";


const API = "https://empatia-dominio-back.vercel.app/api";

// ─── Genera o recupera un fingerprint persistente para visitantes anónimos ──
const getVisitorId = () => {
  // Prioridad: usuario logueado → visitante con fingerprint
  const token = localStorage.getItem("token");
  if (token) {
    try {
      // Decodifica el payload del JWT para obtener el userId
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.userId) return `user_${payload.userId}`;
    } catch (_) {}
  }

  // Visitante anónimo: fingerprint basado en propiedades del browser + localStorage
  let fp = localStorage.getItem("empatia_fp");
  if (!fp) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("fingerprint_empatia", 2, 2);
    const canvasData = canvas.toDataURL();

    const raw = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvasData.slice(-50),
    ].join("|");

    // Hash simple
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
    }
    fp = `anon_${Math.abs(hash)}_${Date.now()}`;
    localStorage.setItem("empatia_fp", fp);
  }
  return fp;
};

// ─── Componente principal ───────────────────────────────────────────────────
const PostStats = ({ postId, postTitulo }) => {
  const [stats, setStats] = useState({ vistas: 0, likes: 0, dislikes: 0, miVoto: null });
  const [relacionados, setRelacionados] = useState([]);
  const [cargandoStats, setCargandoStats] = useState(true);
  const [cargandoRel, setCargandoRel] = useState(true);
  const [votando, setVotando] = useState(false);
  const visitorId = getVisitorId();

  // Registra vista única y carga stats
  useEffect(() => {
    if (!postId) return;

    const registrarVista = async () => {
      try {
        await fetch(`${API}/posts/${postId}/vista`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });
      } catch (_) {}
    };

    const cargarStats = async () => {
      try {
        const res = await fetch(
          `${API}/posts/${postId}/stats?visitorId=${encodeURIComponent(visitorId)}`
        );
        const data = await res.json();
        setStats(data);
      } catch (_) {}
      setCargandoStats(false);
    };

    registrarVista().then(cargarStats);
  }, [postId]);

  // Carga posts relacionados
  useEffect(() => {
    if (!postId) return;
    const cargarRelacionados = async () => {
      try {
        const res = await fetch(`${API}/posts/${postId}/relacionados`);
        const data = await res.json();
        setRelacionados(Array.isArray(data) ? data : []);
      } catch (_) {
        setRelacionados([]);
      }
      setCargandoRel(false);
    };
    cargarRelacionados();
  }, [postId]);

  // Maneja el voto (like / dislike con toggle y cambio)
  const handleVoto = useCallback(
    async (tipo) => {
      if (votando) return;
      setVotando(true);

      // Optimistic update
      setStats((prev) => {
        const quitandoActual = prev.miVoto === tipo;
        const cambiando = prev.miVoto !== null && prev.miVoto !== tipo;

        let nuevoLikes = prev.likes;
        let nuevoDislikes = prev.dislikes;

        if (quitandoActual) {
          if (tipo === "like") nuevoLikes--;
          else nuevoDislikes--;
        } else if (cambiando) {
          if (tipo === "like") { nuevoLikes++; nuevoDislikes--; }
          else { nuevoDislikes++; nuevoLikes--; }
        } else {
          if (tipo === "like") nuevoLikes++;
          else nuevoDislikes++;
        }

        return {
          ...prev,
          likes: Math.max(0, nuevoLikes),
          dislikes: Math.max(0, nuevoDislikes),
          miVoto: quitandoActual ? null : tipo,
        };
      });

      try {
        const res = await fetch(`${API}/posts/${postId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, tipo }),
        });
        const data = await res.json();
        setStats((prev) => ({
          ...prev,
          likes: data.likes,
          dislikes: data.dislikes,
          miVoto: data.miVoto,
        }));
      } catch (_) {
        // Si falla, recarga desde servidor
        try {
          const res = await fetch(
            `${API}/posts/${postId}/stats?visitorId=${encodeURIComponent(visitorId)}`
          );
          const data = await res.json();
          setStats(data);
        } catch (__) {}
      }

      setVotando(false);
    },
    [postId, visitorId, votando]
  );

  const formatNum = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

  return (
    <div className="ps-wrapper">
      {/* ─── Barra de stats ──────────────────────────────────────────── */}
      <div className="ps-stats-bar">
        {/* Vistas */}
        <div className="ps-stat-item ps-vistas">
          <FiEye className="ps-icon ps-icon-eye" />
          <span className="ps-count">
            {cargandoStats ? "—" : formatNum(stats.vistas)}
          </span>
          <span className="ps-label">lecturas</span>
        </div>

        <div className="ps-divider" />

        {/* Like */}
        <button
          className={`ps-vote-btn ps-like ${stats.miVoto === "like" ? "ps-active" : ""}`}
          onClick={() => handleVoto("like")}
          disabled={votando}
          aria-label="Me gusta"
          title="Me gusta"
        >
          {stats.miVoto === "like" ? (
            <FaThumbsUp className="ps-icon" />
          ) : (
            <FiThumbsUp className="ps-icon" />
          )}
          <span className="ps-count">
            {cargandoStats ? "—" : formatNum(stats.likes)}
          </span>
        </button>

        {/* Dislike */}
        <button
          className={`ps-vote-btn ps-dislike ${stats.miVoto === "dislike" ? "ps-active" : ""}`}
          onClick={() => handleVoto("dislike")}
          disabled={votando}
          aria-label="No me gusta"
          title="No me gusta"
        >
          {stats.miVoto === "dislike" ? (
            <FaThumbsDown className="ps-icon" />
          ) : (
            <FiThumbsDown className="ps-icon" />
          )}
          <span className="ps-count">
            {cargandoStats ? "—" : formatNum(stats.dislikes)}
          </span>
        </button>
      </div>

      {/* ─── Relacionados ────────────────────────────────────────────── */}
      {(cargandoRel || relacionados.length > 0) && (
        <div className="ps-relacionados">
          <div className="ps-rel-header">
            <span className="ps-rel-linea" />
            <h3 className="ps-rel-titulo">También te puede interesar</h3>
            <span className="ps-rel-linea" />
          </div>

          {cargandoRel ? (
            <div className="ps-rel-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="ps-rel-card ps-rel-skeleton" />
              ))}
            </div>
          ) : (
            <div className="ps-rel-grid">
              {relacionados.map((rel) => (
                <a
                  key={rel._id}
                  href={`/post/${rel._id}`}
                  className="ps-rel-card"
                >
                  {rel.portada && (
                    <div className="ps-rel-img-wrap">
                      <img
                        src={rel.portada}
                        alt={rel.titulo}
                        className="ps-rel-img"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="ps-rel-body">
                    <span className="ps-rel-cat">{rel.categoria}</span>
                    <p className="ps-rel-post-titulo">{rel.titulo}</p>
                    {rel.epigrafe && (
                      <p className="ps-rel-epig">{rel.epigrafe}</p>
                    )}
                    <span className="ps-rel-fecha">
                      {new Date(rel.fecha).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostStats;
