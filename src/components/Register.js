import React, { useState } from "react";
import Swal from "sweetalert2";
import "../style/Register.css";

const SocioRegister = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    ciudad: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://empatia-dominio-back.vercel.app/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // ✅ Siempre leer el JSON antes de chequear el status
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          html: `Tu usuario y contraseña fueron enviados a <b>${form.correo}</b>.`,
        }).then(() => {
          window.location.href = "/login";
        });
        setForm({ nombre: "", apellido: "", correo: "", telefono: "", ciudad: "" });
      } else {
        // ✅ Muestra el mensaje real del backend (ej: "ya existe un socio con ese correo")
        Swal.fire("Error", data.message || "Fallo en el registro", "error");
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
      <form onSubmit={handleSubmit} className="socio-form no-provincia">
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
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
};

export default SocioRegister;
