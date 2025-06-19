import React, { useEffect, useState } from "react";
import "../style/UserData.css";

const UserData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({
    visitantesUnicos: 0,
    postsCompartidos: 0,
    eventosTotales: 0,
    postsMasVisitados: [],
    postsMayorPermanencia: [],
    descargasPDF: 0,
    descargasLibro: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://empatia-dominio-back.vercel.app/api/user-actividad");
        if (!res.ok) throw new Error("Error al obtener datos");
        const actividades = await res.json();
        setData(actividades);
        calcularBalance(actividades);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calcularBalance = (actividades) => {
    const visitantesUnicos = new Set(actividades.map((a) => a.visitorId)).size;
    const eventosTotales = actividades.length;
    const postsCompartidos = actividades.filter(
      (a) => a.evento === "compartido"
    ).length;

    const visitasPorPost = {};
    const permanenciaPorPost = {};
    let descargasPDF = 0;
    let descargasLibro = 0;

    actividades.forEach((a) => {
      // Visitas
      if (a.evento === "visita" && a.postId) {
        visitasPorPost[a.postId] = (visitasPorPost[a.postId] || 0) + 1;
      }

      // Permanencia
      if (a.evento === "permanencia" && a.postId && a.duracion) {
        permanenciaPorPost[a.postId] =
          (permanenciaPorPost[a.postId] || 0) + a.duracion;
      }

      // Descargas
      if (a.evento === "PDFguiaDescarga") descargasPDF++;
      if (a.evento === "PDFlibroDescarga") descargasLibro++;
    });

    const postsMasVisitados = Object.entries(visitasPorPost)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([postId, visitas]) => ({ postId, visitas }));

    const postsMayorPermanencia = Object.entries(permanenciaPorPost)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([postId, duracion]) => ({ postId, duracion }));

    setBalance({
      visitantesUnicos,
      postsCompartidos,
      eventosTotales,
      postsMasVisitados,
      postsMayorPermanencia,
      descargasPDF,
      descargasLibro,
    });
  };

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="user-data-container">
      <h2>Resumen de Actividad de Usuarios</h2>
      <p>
        <strong>Visitantes únicos:</strong> {balance.visitantesUnicos}
      </p>
      <p>
        <strong>Total de eventos registrados:</strong> {balance.eventosTotales}
      </p>
      <p>
        <strong>Posts compartidos:</strong> {balance.postsCompartidos}
      </p>

      <h3>Posts más visitados (Top 3)</h3>
      <ul style={{ paddingLeft: 0 }}>
        {balance.postsMasVisitados.length > 0 ? (
          balance.postsMasVisitados.map(({ postId, visitas}, index) => {
        

            // Mostrar todo el array data legible
            console.log(
              "Data completa desde backend:",
              JSON.stringify(data, null, 2)
            );

            // Buscar el objeto correspondiente en data
            const actividad = data.find((a) => a.postId === postId && a.url);

            return (
              <li
              key={`${postId}`}
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "0.75rem 1rem",
                  borderLeft: "5px solid #4caf50",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href={
                    actividad?.url || `https://empatiadigital.com.ar/post/${postId}`
                  } // si no hay `actividad.url`, usar un fallback por id
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#2196f3",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    transition: "color 0.2s ease-in-out",
                  }}
                  onMouseOver={(e) => (e.target.style.color = "#1769aa")}
                  onMouseOut={(e) => (e.target.style.color = "#2196f3")}
                >
                  {index + 1}. Ir al post 
                </a>
                <span
                  style={{
                    color: "#555",
                    fontWeight: "500",
                    fontSize: "1.5rem",
                    marginLeft: "auto",
                  }}
                >
                  - Visitas: {visitas}
                </span>
              </li>
            );
          })
        ) : (
          <li style={{ fontStyle: "italic", color: "#999" }}>
            No hay datos de visitas
          </li>
        )}
      </ul>

      <h3>Posts con más permanencia (Top 3)</h3>
      <ul style={{ paddingLeft: 0 }}>
        {balance.postsMayorPermanencia.length > 0 ? (
          balance.postsMayorPermanencia.map(({ postId, duracion }, index) => {
            const actividad = data.find((a) => a.postId === postId && a.url);
            return (
              <li
                key={postId}
                style={{
                  backgroundColor: "#fff5f5",
                  padding: "0.75rem 1rem",
                  borderLeft: "5px solid #f44336",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href={actividad?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#f44336",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    transition: "color 0.2s ease-in-out",
                  }}
                  onMouseOver={(e) => (e.target.style.color = "#d32f2f")}
                  onMouseOut={(e) => (e.target.style.color = "#f44336")}
                >
                  {index + 1}. Tiempo
                </a>
                <span
                  style={{
                    color: "#555",
                    fontSize: "1.5rem",
                    fontWeight: "500",
                    marginLeft: "auto",
                  }}
                >
                  {duracion} seg.
                </span>
              </li>
            );
          })
        ) : (
          <li style={{ fontStyle: "italic", color: "#999" }}>
            No hay datos de permanencia
          </li>
        )}
      </ul>

      <h3>Descargas</h3>
      <ul style={{ paddingLeft: 0, backgroundColor: "#f5f5f5" }}>
        <li
          style={{
            borderLeft: "30px solid #66bb6a",
            borderRadius: "6px",
            padding: "0.75rem 1rem",
            marginBottom: "0.5rem",
            color: "white",
            fontSize: "1.5rem",
            fontWeight: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          📄 PDF Guía descargado:{" "}
          <span
            style={{
              backgroundColor: "#f5f5f5", // fondo del LI completo
              padding: "0.25rem 0.75rem",
              borderRadius: "6px",
              fontWeight: "bold",
              color: "#000",
              fontSize: "1.5rem",
            }}
          >
            {balance.descargasPDF}
          </span>
        </li>
        <li
          style={{
            borderLeft: "30px solid #42a5f5",
            borderRadius: "6px",
            padding: "0.75rem 1rem",
            marginBottom: "0.5rem",
            fontSize: "1.5rem",
            fontWeight: "500",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          📘 Libro clickeado:{" "}
          <span
            style={{
              backgroundColor: "#f5f5f5", // fondo del LI completo
              padding: "0.25rem 0.75rem",
              borderRadius: "6px",
              fontWeight: "bold",
              color: "#000",
              fontSize: "1.5rem",
            }}
          >
            {balance.descargasLibro}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default UserData;
