import React, { useEffect, useState } from "react";
import { FiEye, FiThumbsUp } from "react-icons/fi";
import "../style/PostStatsMini.css";

const API = "https://empatia-dominio-back.vercel.app/api";

const PostStatsMini = ({ postId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!postId) return;
    
    let isMounted = true; // Control para evitar fugas de memoria

    const cargar = async () => {
      try {
        const res = await fetch(`${API}/posts/${postId}/stats`);
        
        // ── BLINDAJE 1: Si el servidor devuelve 503, 404 o cae, frena acá en silencio ──
        if (!res.ok) return;

        const data = await res.json();
        
        // ── BLINDAJE 2: Validar que sea un objeto válido antes de guardar ──
        if (isMounted && data && typeof data === "object") {
          setStats(data);
        }
      } catch (_) {
        // Silencio absoluto ante fallos de red o si res.json() procesa el HTML de error de Vercel
      }
    };
    
    cargar();
    return () => { isMounted = false; };
  }, [postId]);

  const fmt = (n) => {
    // Protección contra valores indefinidos, nulos o que no sean números
    if (n === undefined || n === null || isNaN(n)) return "—";
    return n >= 1000 ? (n / 1000).toFixed(1) + "k" : n;
  };

  return (
    <div className="psm-bar">
      <span className="psm-item">
        <FiEye className="psm-icon psm-eye" />
        <span>{stats ? fmt(stats.vistas) : "—"}</span>
      </span>
      <span className="psm-sep" />
      <span className="psm-item">
        <FiThumbsUp className="psm-icon psm-like" />
        <span>{stats ? fmt(stats.likes) : "—"}</span>
      </span>
    </div>
  );
};

export default PostStatsMini;
