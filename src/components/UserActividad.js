import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const UserActividad = () => {
  const location = useLocation();
  const visitStartRef = useRef(Date.now());

  const sendActivity = async (data) => {
    try {
      await fetch("https://empatia-dominio-back.vercel.app/api/user-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error al enviar actividad:", error);
    }
  };

  useEffect(() => {
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
      visitorId = uuidv4();
      localStorage.setItem("visitorId", visitorId);
    }

    const pathname = location.pathname;
    const fullUrl = window.location.href;
    const isPost = pathname.startsWith("/post/");

    const actividad = {
      visitorId,
      ruta: pathname,
      url: fullUrl, // ✅ Agregamos la URL completa
      timestamp: new Date().toISOString(),
      evento: "visita",
    };

    if (isPost) {
      actividad.tipo = "post";
      actividad.postId = pathname.split("/post/")[1];
    }

    sendActivity(actividad);

    visitStartRef.current = Date.now();

    return () => {
      if (isPost) {
        const duracionMs = Date.now() - visitStartRef.current;
        sendActivity({
          visitorId,
          postId: pathname.split("/post/")[1],
          url: fullUrl, // ✅ También en evento "permanencia"
          evento: "permanencia",
          duracion: Math.round(duracionMs / 1000),
        });
      }
    };
  }, [location]);

  return null;
};

export default UserActividad;
