import React, { useEffect, useState } from "react";
import "../style/UserData.css";

// ── helpers ────────────────────────────────────────────────────────────────────

const fmtDuracion = (seg) => {
  if (seg >= 3600) return `${Math.floor(seg / 3600)}h ${Math.floor((seg % 3600) / 60)}m`;
  if (seg >= 60)   return `${Math.floor(seg / 60)}m ${seg % 60}s`;
  return `${seg}s`;
};

const getTituloDesdeURL = (url) => {
  if (!url) return null;
  try {
    const path = new URL(url).pathname;
    const slug = path.split("/post/")[1];
    if (!slug) return null;
    return decodeURIComponent(slug)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return null;
  }
};

const calcularBalance = (actividades) => {
  const visitantesUnicos   = new Set(actividades.map((a) => a.visitorId)).size;
  const eventosTotales     = actividades.length;
  const postsCompartidos   = actividades.filter((a) => a.evento === "compartido").length;

  const visitasPorPost     = {};
  const permanenciaPorPost = {};
  const urlPorPost         = {};
  let descargasPDF   = 0;
  let descargasLibro = 0;

  actividades.forEach((a) => {
    if (a.evento === "visita" && a.postId) {
      visitasPorPost[a.postId] = (visitasPorPost[a.postId] || 0) + 1;
      if (a.url && !urlPorPost[a.postId]) urlPorPost[a.postId] = a.url;
    }
    if (a.evento === "permanencia" && a.postId && a.duracion) {
      if (!permanenciaPorPost[a.postId]) permanenciaPorPost[a.postId] = { total: 0, count: 0 };
      permanenciaPorPost[a.postId].total += a.duracion;
      permanenciaPorPost[a.postId].count += 1;
      if (a.url && !urlPorPost[a.postId]) urlPorPost[a.postId] = a.url;
    }
    if (a.evento === "PDFguiaDescarga")  descargasPDF++;
    if (a.evento === "PDFlibroDescarga") descargasLibro++;
  });

  const postsMasVisitados = Object.entries(visitasPorPost)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([postId, visitas]) => ({
      postId,
      visitas,
      url:    urlPorPost[postId] || `https://empatiadigital.com.ar/post/${postId}`,
      titulo: getTituloDesdeURL(urlPorPost[postId]) || postId,
    }));

  const postsMayorPermanencia = Object.entries(permanenciaPorPost)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 3)
    .map(([postId, { total, count }]) => ({
      postId,
      duracionTotal: total,
      duracionPromedio: Math.round(total / count),
      url:    urlPorPost[postId] || `https://empatiadigital.com.ar/post/${postId}`,
      titulo: getTituloDesdeURL(urlPorPost[postId]) || postId,
    }));

  return {
    visitantesUnicos,
    postsCompartidos,
    eventosTotales,
    postsMasVisitados,
    postsMayorPermanencia,
    descargasPDF,
    descargasLibro,
  };
};

// ── componente ─────────────────────────────────────────────────────────────────

const UserData = () => {
  const [balance, setBalance]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://empatia-dominio-back.vercel.app/api/user-actividad");
        if (!res.ok) throw new Error("Error al obtener datos");
        const actividades = await res.json();
        setBalance(calcularBalance(actividades));
      } catch (e) {
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="user-data-container"><p className="loading">Cargando datos…</p></div>;
  if (error)   return <div className="user-data-container"><p className="ud-error">{error}</p></div>;

  return (
    <div className="user-data-container">
      <h2>Resumen de Actividad</h2>

      {/* Stats rápidas */}
      <div className="ud-stats-grid">
        <div className="ud-stat-card">
          <span className="ud-stat-value">{balance.visitantesUnicos}</span>
          <span className="ud-stat-label">Visitantes únicos</span>
        </div>
        <div className="ud-stat-card">
          <span className="ud-stat-value">{balance.eventosTotales}</span>
          <span className="ud-stat-label">Eventos totales</span>
        </div>
        <div className="ud-stat-card">
          <span className="ud-stat-value">{balance.postsCompartidos}</span>
          <span className="ud-stat-label">Compartidos</span>
        </div>
      </div>

      {/* Posts más visitados */}
      <h3>Posts más visitados</h3>
      <ul>
        {balance.postsMasVisitados.length > 0 ? (
          balance.postsMasVisitados.map(({ postId, visitas, url, titulo }, i) => (
            <li key={postId} className="ud-item ud-item--green" style={{ "--delay": `${i * 0.08}s` }}>
              <span className="ud-rank">#{i + 1}</span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="ud-link ud-link--green">
                {titulo}
              </a>
              <span className="ud-badge ud-badge--green">{visitas} visitas</span>
            </li>
          ))
        ) : (
          <li className="ud-empty">No hay datos de visitas aún</li>
        )}
      </ul>

      {/* Mayor permanencia */}
      <h3>Mayor permanencia</h3>
      <ul>
        {balance.postsMayorPermanencia.length > 0 ? (
          balance.postsMayorPermanencia.map(({ postId, duracionPromedio, duracionTotal, url, titulo }, i) => (
            <li key={postId} className="ud-item ud-item--red" style={{ "--delay": `${i * 0.08}s` }}>
              <span className="ud-rank">#{i + 1}</span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="ud-link ud-link--red">
                {titulo}
              </a>
              <span className="ud-badge ud-badge--red">
                ⌀ {fmtDuracion(duracionPromedio)}
                <small> / total {fmtDuracion(duracionTotal)}</small>
              </span>
            </li>
          ))
        ) : (
          <li className="ud-empty">No hay datos de permanencia aún</li>
        )}
      </ul>

      {/* Descargas */}
      <h3>Descargas</h3>
      <ul>
        <li className="ud-item ud-item--purple" style={{ "--delay": "0s" }}>
          <span className="ud-icon">📄</span>
          <span className="ud-desc">PDF Guía descargado</span>
          <span className="ud-badge ud-badge--purple">{balance.descargasPDF}</span>
        </li>
        <li className="ud-item ud-item--blue" style={{ "--delay": "0.08s" }}>
          <span className="ud-icon">📘</span>
          <span className="ud-desc">Libro clickeado</span>
          <span className="ud-badge ud-badge--blue">{balance.descargasLibro}</span>
        </li>
      </ul>
    </div>
  );
};

export default UserData;
