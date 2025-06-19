import React, { useState } from "react";
import Swal from "sweetalert2";
import "../style/Reestablecer.css";
import { useNavigate } from 'react-router-dom';

const Reestablecer = () => {
  const [correo, setCorreo] = useState("");
  const [code, setCode] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    if (!correo) return;

    try {
      const response = await fetch("https://empatia-dominio-back.vercel.app/api/sendCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      if (!response.ok) {
        throw new Error("Error de servidor");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.message) {
          setCodigoEnviado(true);
          Swal.fire({
            title: "Código enviado",
            text: data.message,
            icon: "info",
            confirmButtonColor: "#3085d6",
          })
        } else {
          throw new Error("No se recibió mensaje en la respuesta");
        }
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !code || !nuevaPassword) return;

    try {
      const response = await fetch("https://empatia-dominio-back.vercel.app/api/changePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, code, nuevaPassword }),
      });

      if (!response.ok) {
        throw new Error("Error de servidor");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.message) {
          Swal.fire("¡Éxito!", data.message, "success").then(() => {
            navigate('/login'); // Redirige después del OK (cambiar la ruta si querés)
          });;
        } else {
          throw new Error("No se recibió mensaje en la respuesta");
        }
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="reestablecer-container">
      <form onSubmit={handleSubmit} className="reestablecer-form">
        <h2>Reestablecer Contraseña</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        {!codigoEnviado && (
          <button type="button" onClick={handleSendCode}>
            Enviar Código
          </button>
        )}

        {codigoEnviado && (
          <>
            <input
              type="text"
              placeholder="Código de verificación"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
            />
            <button type="submit">Actualizar contraseña</button>
          </>
        )}
      </form>
    </div>
  );
};

export default Reestablecer;
