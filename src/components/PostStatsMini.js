// src/components/PostStatsMini.jsx

import React, { useEffect, useState } from "react";
import { FiEye, FiThumbsUp } from "react-icons/fi";
import "../style/PostStatsMini.css";

const API = "https://empatia-dominio-back.vercel.app/api";

const PostStatsMini = ({ postId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!postId) return;
    const cargar = async () => {
      try {
        const res = await fetch(`${API}/posts/${postId}/stats`);
        const data = await res.json();
        setStats(data);
      } catch (_) {}
    };
    cargar();
  }, [postId]);

  const fmt = (n) => {
    if (n === undefined || n === null) return "—";
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
