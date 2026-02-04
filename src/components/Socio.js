import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import Logo from "../assets/Portada1.jpg";
import LogoSentidos from "../assets/Portada2.jpg";
import "../style/Socio.css";
import html2canvas from "html2canvas";



const SocioDashboard = () => {
  const { user } = useAuth();
  const [socioData, setSocioData] = useState(null);
  const [cuotaStatus, setCuotaStatus] = useState("No pagada");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isNearEndOfMonth, setIsNearEndOfMonth] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const sendWhatsAppMessage = () => {
    const phoneNumber = "3462529718";
    const message =
      "Hola, me sale un mensaje que dice, estas inhabilitado, ¿a qué se debe, esto?";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const showInactiveAlert = useCallback(() => {
    Swal.fire({
      title: "Cuenta Inactiva",
      html: `
        <div style="text-align: center;">
          <p style="color: red; font-weight: bold; margin-bottom: 20px;">
            Estás inhabilitado para usar las funciones del sistema.
          </p>
          <p style="margin-bottom: 20px;">
            Para más información, envía un WhatsApp haciendo clic en el botón de abajo.
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Enviar WhatsApp",
      cancelButtonText: "Cerrar",
      confirmButtonColor: "#25D366",
      cancelButtonColor: "#d33",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        sendWhatsAppMessage();
      }
    });
  }, []);

  const handleCaptureCarnet = () => {
    const carnetElement = document.getElementById("carnet-socio");
    if (!carnetElement) return;

    const allImgs = carnetElement.querySelectorAll("img");
    for (let img of allImgs) {
      if (!img.complete) {
        img.onload = () => handleCaptureCarnet();
        return;
      }
    }

    html2canvas(carnetElement, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#b30000",
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Carnet Socio:${socioData.nombre}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSocioData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          "https://empatia-dominio-back.vercel.app/api/socios/obtener",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Correo: user.username,
            },
          }
        );

        const data = await res.json();

        if (data.success && data.socio) {
          setSocioData(data.socio);
          setCuotaStatus(data.socio.cuotaEstado);
          setIsNearEndOfMonth(new Date().getDate() > 25);
          setEditedData(data.socio);

          if (data.socio.avatar) {
            setPreviewImage(data.socio.avatar);
          }

          if (!data.socio.active) {
            showInactiveAlert();
          }
        } else {
          setError("Socio no encontrado");
        }
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al obtener los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchSocioData();
  }, [user, showInactiveAlert]);

  const handleFunctionBlocked = () => {
    Swal.fire({
      title: "Función Bloqueada",
      text: "Estás inactivo. Contacta con soporte.",
      icon: "error",
      confirmButtonText: "Enviar WhatsApp",
    }).then(() => sendWhatsAppMessage());
  };

  const handleEditClick = () => {
    if (!socioData?.active) return handleFunctionBlocked();
    setIsEditing(true);
    setEditedData({ ...socioData });
  };

  const handleChange = (e) => {
    if (!socioData?.active) return handleFunctionBlocked();
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (!socioData?.active) return handleFunctionBlocked();
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!socioData?.active) return handleFunctionBlocked();

    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Error", "No autenticado", "error");

    try {
      const formData = new FormData();
      Object.entries(editedData).forEach(([k, v]) =>
        formData.append(k, v)
      );
      if (selectedImage) formData.append("avatar", selectedImage);

      const res = await fetch(
        "https://empatia-dominio-back.vercel.app/api/socios/editar",
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        Swal.fire("Success", "Datos actualizados", "success");
        setSocioData(data.socio);
        setIsEditing(false);
        setSelectedImage(null);
      } else {
        Swal.fire("Error", "Error al actualizar", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error del servidor", "error");
    }
  };

  const handleConfirmPasswordChange = () => {
    if (!socioData?.active) return handleFunctionBlocked();

    Swal.fire({
      title: "Cambiar contraseña",
      input: "password",
      inputPlaceholder: "Nueva contraseña",
      showCancelButton: true,
      preConfirm: async (password) => {
        if (!password || password.length < 6) {
          Swal.showValidationMessage("Mínimo 6 caracteres");
          return;
        }
      },
    }).then((r) => {
      if (r.isConfirmed) {
        Swal.fire("Éxito", "Contraseña cambiada", "success");
      }
    });
  };

  const handleConfirmPayQuota = () => {
    if (!socioData?.active) return handleFunctionBlocked();

    Swal.fire({
      title: "¿Confirmar pago?",
      showCancelButton: true,
      confirmButtonText: "Pagar",
    }).then((r) => {
      if (r.isConfirmed) {
        Swal.fire("Success", "Cuota pagada", "success");
      }
    });
  };

  if (loading) return <p>Cargando datos del socio...</p>;
  if (error) return <p>{error}</p>;
  if (!socioData) return <p>No se encontraron datos.</p>;

  return (
    <div className="socio-dashboard-container">
      {/* Overlay completo para bloquear interfaz si está inactivo */}
      {!socioData.active && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
              maxWidth: "400px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h2 style={{ color: "red", marginBottom: "20px" }}>
              ⚠️ Cuenta Inactiva
            </h2>
            <p
              style={{
                color: "red",
                fontWeight: "bold",
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              Estás inhabilitado para usar las funciones del sistema.
            </p>
            <p style={{ marginBottom: "30px", color: "#666" }}>
              Para más información y reactivar tu cuenta, envía un WhatsApp.
            </p>
            <button
              onClick={sendWhatsAppMessage}
              style={{
                backgroundColor: "#25D366",
                color: "white",
                border: "none",
                padding: "15px 30px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              📱 Enviar WhatsApp a Soporte
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de alerta para usuarios inactivos */}
      {!socioData.active && (
        <div
          style={{
            backgroundColor: "#ffebee",
            border: "2px solid #f44336",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "red",
              fontWeight: "bold",
              fontSize: "18px",
              margin: "0 0 10px 0",
            }}
          >
            Estás inactivo. Contacta con soporte por favor.
          </p>
          <button
            onClick={sendWhatsAppMessage}
            style={{
              backgroundColor: "#25D366",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            📱 Enviar WhatsApp
          </button>
        </div>
      )}

      <div className="cards-container">
        <div className="card-header-modern-complete">
          <div className="card-header-modern" id="carnet-socio">
            <div className="card-header-orange">
              <img
                src={previewImage || Logo}
                alt="Foto de carnet"
                className="card-avatar"
              />
            </div>
            Socio:
            <strong className={socioData.numeroSocio ? "activo" : "inactivo"}>
              {socioData.numeroSocio}
            </strong>
            <h2>
              {socioData.nombre} {socioData.apellido}
            </h2>
            Localidad:
            <strong className={socioData.ciudad ? "activo" : "inactivo"}>
            {socioData.ciudad || "No disponible"}
            </strong>
            <img
              src={LogoSentidos || Logo}
              alt="Logo Sentidos"
              className="logo-cuadrado"
            />
            {/* <h3 className="circuit-line"></h3> */}
            <h1 >Carnet de Socio</h1>

          </div>

          {/* Botón de captura fuera del div */}
          <button className="btn-captura" onClick={handleCaptureCarnet}>
            Capturar Carnet
          </button>

          <div className="card-body">
            {isEditing ? (
              <>
                <div style={{ textAlign: "center", color: "red" }}>
                  <h3 style={{ color: "red" }}>Nombre</h3>
                  <input
                    type="text"
                    name="nombre"
                    value={editedData.nombre || ""}
                    onChange={handleChange}
                    disabled={!socioData.active}
                    style={{ opacity: socioData.active ? 1 : 0.5 }}
                  />
                  <h3 style={{ color: "red" }}>Apellido</h3>
                  <input
                    type="text"
                    name="apellido"
                    value={editedData.apellido || ""}
                    onChange={handleChange}
                    disabled={!socioData.active}
                    style={{ opacity: socioData.active ? 1 : 0.5 }}
                  />
                  <h3 style={{ color: "red" }}>Telefono</h3>
                  <input
                    type="text"
                    name="telefono"
                    value={editedData.telefono || ""}
                    onChange={handleChange}
                    disabled={!socioData.active}
                    style={{ opacity: socioData.active ? 1 : 0.5 }}
                  />
                  <h3 style={{ color: "red" }}>Cambiar Foto de Perfil</h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={!socioData.active}
                    style={{ opacity: socioData.active ? 1 : 0.5 }}
                  />
                </div>

                <p
                  style={{
                    marginTop: "20px",
                    textAlign: "center",
                    fontSize: "14px",
                    color: "red",
                  }}
                >
                  Para solicitar otros cambios, por favor comuníquese con el
                  administrador de la página.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Correo:</strong> {socioData.correo || "No disponible"}
                </p>
                <p>
                  <strong>Teléfono:</strong>{" "}
                  {socioData.telefono || "No disponible"}
                </p>
                <p>
                  <strong>Provincia:</strong>{" "}
                  {socioData.provincia || "No disponible"}
                </p>
                <p>
                  <strong>Ciudad:</strong> {socioData.ciudad || "No disponible"}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="card-header-modern-complete">
          <div className="card-header card-header-green">
            <h1>Estado de la Cuota</h1>
            <img src={Logo} alt="Foto de carnet" className="card-avatar" />
          </div>
          <div className="card-body">
            <p>
              <strong>Cuota:</strong>{" "}
              {cuotaStatus === "pagada" ? "Pagada" : "No pagada"}
            </p>
            {cuotaStatus === "pagada" ? (
              <p>
                <strong>Pagadas:</strong> 1 de 12
              </p>
            ) : (
              <p>
                <strong>Cuota estándar:</strong> 0 de 12
              </p>
            )}
            {isNearEndOfMonth && cuotaStatus === "no pagada" && (
              <p className="alert-red">
                ¡Falta pocos días para el vencimiento!
              </p>
            )}
          </div>
          <div className="card-footer">
            <button
              onClick={handleConfirmPayQuota}
              disabled={!socioData.active}
              style={{
                opacity: socioData.active ? 1 : 0.5,
                cursor: socioData.active ? "pointer" : "not-allowed",
              }}
            >
              Pagar Cuota
            </button>
          </div>
        </div>

        <div className="card-header-modern-complete">
          <div className="card-header card-header-blue">
            <h1>Card de Cambios</h1>
            <img src={Logo} alt="Foto de carnet" className="card-avatar" />
            <p>
              <strong>ID de Socio:</strong> {socioData._id || "No disponible"}
            </p>
          </div>
          <div className="card-body">
            <button
              className="card-changes"
              onClick={handleEditClick}
              disabled={!socioData.active}
              style={{
                opacity: socioData.active ? 1 : 0.5,
                cursor: socioData.active ? "pointer" : "not-allowed",
              }}
            >
              Editar Datos
            </button>
            <button
              className="card-changes"
              onClick={handleConfirmPasswordChange}
              disabled={!socioData.active}
              style={{
                opacity: socioData.active ? 1 : 0.5,
                cursor: socioData.active ? "pointer" : "not-allowed",
              }}
            >
              Cambiar Contraseña
            </button>
            {isEditing && (
              <button
                className="card-changes"
                onClick={handleSaveChanges}
                disabled={!socioData.active}
                style={{
                  backgroundColor: socioData.active ? "green" : "gray",
                  color: "white",
                  opacity: socioData.active ? 1 : 0.5,
                  cursor: socioData.active ? "pointer" : "not-allowed",
                }}
              >
                Guardar Cambios
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocioDashboard;



