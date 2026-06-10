import React, { useState } from "react";
import Swal from "sweetalert2";
import "../style/Register.css";

const SocioRegister = () => {
  const [step, setStep] = useState(1); // 1 = form datos, 2 = confirmar código
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    ciudad: "",
  });
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // PASO 1: enviar código al correo
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!form.correo) return;
    setLoading(true);
    try {
      const res = await fetch("https://empatia-dominio-back.vercel.app/api/sendCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: form.correo }),
      });
      const data = await res.json();

      if (res.ok && (data.success || data.message)) {
        setStep(2);
        Swal.fire({
          icon: "info",
          title: "Código enviado",
          text: `Revisá tu correo ${form.correo} e ingresá el código para continuar.`,
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo enviar el código.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Fallo de conexión con el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: verificar código y registrar
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    try {
      // Primero verificamos el código
      const resVerify = await fetch("https://empatia-dominio-back.vercel.app/api/changePassword", {
        // ⚠️ Reemplazá esta URL si tenés un endpoint específico para verificar código de registro
        // Por ejemplo: /api/verifyCode
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: form.correo, code }),
      });

      // Si no tenés endpoint de sola verificación, registramos directamente
      const resRegister = await fetch("https://empatia-dominio-back.vercel.app/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, code }),
      });
      const dataRegister = await resRegister.json();

      if (resRegister.ok && dataRegister.success) {
        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          html: `Tu usuario y contraseña fueron enviados a <b>${form.correo}</b>.`,
        }).then(() => {
          window.location.href = "/login";
        });
        setForm({ nombre: "", apellido: "", correo: "", telefono: "", ciudad: "" });
        setCode("");
        setStep(1);
      } else {
        Swal.fire("Error", dataRegister.message || "No se pudo completar el registro.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Fallo de conexión con el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="socio-form-container no-provincia">
      <h2>Registro</h2>

      {step === 1 && (
        <form onSubmit={handleSendCode} className="socio-form no-provincia">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            required
            value={form.nombre}
            onChange={handleChange}
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            required
            value={form.apellido}
            onChange={handleChange}
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            required
            value={form.correo}
            onChange={handleChange}
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono (opcional)"
            value={form.telefono}
            onChange={handleChange}
          />
          <input
            type="text"
            name="ciudad"
            placeholder="Ciudad"
            value={form.ciudad}
            onChange={handleChange}
          />
          <br />
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Continuar"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyAndRegister} className="socio-form no-provincia">
          <p style={{ textAlign: "center", marginBottom: "12px" }}>
            Ingresá el código que enviamos a <b>{form.correo}</b>
          </p>
          <input
            type="text"
            placeholder="Código de verificación"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <br />
          <button type="submit" disabled={loading}>
            {loading ? "Verificando..." : "Confirmar y registrarse"}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{ marginTop: "8px", background: "transparent", color: "#555", border: "1px solid #ccc" }}
          >
            ← Volver
          </button>
        </form>
      )}
    </div>
  );
};

export default SocioRegister;
