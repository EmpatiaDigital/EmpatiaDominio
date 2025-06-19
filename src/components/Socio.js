import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Logo from "../assets/Portada1.jpg";
import LogoSentidos from "../assets/Portada2.jpg";

import "../style/Socio.css";
import html2canvas from "html2canvas";

const provincias = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const SocioDashboard = () => {
  const { user } = useAuth();
  const [socioData, setSocioData] = useState(null);
  const [cuotaStatus, setCuotaStatus] = useState("No pagada");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isAdmin, setIsAdmin] = useState(user?.role === "superadmin");
  const [isNearEndOfMonth, setIsNearEndOfMonth] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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
    if (user) {
      const fetchSocioData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const res = await fetch("https://empatia-back.vercel.app/api/socios/obtener", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Correo: user.username,
            },
          });

          const data = await res.json();
          if (data.success && data.socio) {
            setSocioData({
              ...data.socio,
              _id: data.socio._id,
            });
            setCuotaStatus(data.socio.cuotaEstado);
            setIsNearEndOfMonth(new Date().getDate() > 25);

            localStorage.setItem("nombre", data.socio.nombre);

            // Set initial editedData
            setEditedData(data.socio);

            // Set preview image if user has one
            if (data.socio.avatar) {
              setPreviewImage(data.socio.avatar);
            }

            // Verificar si el socio está inactivo y mostrar alerta
            if (!data.socio.active) {
              showInactiveAlert();
            }
          } else {
            setError("Socio no encontrado");
          }
        } catch (error) {
          console.error("Error al obtener datos del socio:", error);
          setError("Ocurrió un error al obtener los datos");
        } finally {
          setLoading(false);
        }
      };

      fetchSocioData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const showInactiveAlert = () => {
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
  };

  const sendWhatsAppMessage = () => {
    const phoneNumber = "3462529718";
    const message =
      "Hola, me sale un mensaje que dice, estas inhabilitado, ¿a qué se debe, esto?";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleFunctionBlocked = () => {
    Swal.fire({
      title: "Función Bloqueada",
      html: `
        <div style="text-align: center;">
          <p style="color: red; font-weight: bold; margin-bottom: 20px;">
            Estás inactivo. Contacta con soporte por favor.
          </p>
        </div>
      `,
      icon: "error",
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
  };

  const handleEditClick = () => {
    if (!socioData?.active) {
      handleFunctionBlocked();
      return;
    }
    setIsEditing(true);
    setEditedData({ ...socioData });
  };

  const handleChange = (e) => {
    if (!socioData?.active) {
      handleFunctionBlocked();
      return;
    }
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (!socioData?.active) {
      handleFunctionBlocked();
      return;
    }
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!socioData?.active) {
      handleFunctionBlocked();
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return Swal.fire("Error", "No estás autenticado", "error");
    }

    try {
      const formData = new FormData();

      // Agregar campos editados
      for (const key in editedData) {
        if (Object.hasOwnProperty.call(editedData, key)) {
          formData.append(key, editedData[key]);
        }
      }

      // Agregar imagen si hay
      if (selectedImage) {
        formData.append("avatar", selectedImage);
      }

      const res = await fetch("http://localhost:5000/api/socios/editar", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // No poner Content-Type aquí para que fetch maneje el multipart boundary
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire("Success", "Datos actualizados correctamente", "success");
        setIsEditing(false);
        setSocioData(data.socio); // actualizar con la data nueva del backend
        setSelectedImage(null);
        if (data.socio.fotoPerfilUrl) {
          setPreviewImage(data.socio.fotoPerfilUrl);
        }
      } else {
        Swal.fire("Error", "Ocurrió un error al actualizar los datos", "error");
      }
    } catch (error) {
      console.error("Error al editar datos:", error);
      Swal.fire("Error", "Ocurrió un error en el servidor", "error");
    }
  };


  
  const MySwal = withReactContent(Swal);
  
  const handleConfirmPasswordChange = () => {
    if (!socioData?.active) {
      handleFunctionBlocked();
      return;
    }
  
    let showPassword = false;
  
    Swal.fire({
      title: "¿Seguro que quieres cambiar la contraseña?",
      html: `
        <input id="swal-input-password" type="password" class="swal2-input" placeholder="Nueva contraseña" />
        <button type="button" id="toggle-password" class="swal2-styled" style="margin-top: 10px;">
          👁️ Mostrar
        </button>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Cambiar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      didOpen: () => {
        const passwordInput = Swal.getPopup().querySelector("#swal-input-password");
        const toggleBtn = Swal.getPopup().querySelector("#toggle-password");
  
        toggleBtn.addEventListener("click", () => {
          showPassword = !showPassword;
          passwordInput.type = showPassword ? "text" : "password";
          toggleBtn.textContent = showPassword ? "🙈 Ocultar" : "👁️ Mostrar";
        });
      },
      preConfirm: async () => {
        const newPassword = Swal.getPopup().querySelector("#swal-input-password").value;
  
        if (!newPassword || newPassword.length < 6) {
          Swal.showValidationMessage("La contraseña debe tener al menos 6 caracteres");
          return false;
        }
  
        const token = localStorage.getItem("token");
  
        try {
          const res = await fetch("http://localhost:5000/api/cambiar-password-logueado", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nuevaPassword: newPassword }),
          });
  
          const data = await res.json();
  
          if (!res.ok || !data.success) {
            throw new Error(data.error || "Error al cambiar la contraseña");
          }
  
          return true;
        } catch (error) {
          Swal.showValidationMessage(`Error: ${error.message}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Éxito", "Contraseña cambiada correctamente", "success");
      }
    });
  };
  
  const handleConfirmPayQuota = () => {
    if (!socioData?.active) {
      handleFunctionBlocked();
      return;
    }

    Swal.fire({
      title: "¿Confirmas el pago de la cuota?",
      showCancelButton: true,
      confirmButtonText: "Pagar cuota",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Success", "Cuota pagada correctamente", "success");
      }
    });
  };

  if (loading) {
    return <p>Cargando datos del socio...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!socioData) {
    return <p>No se encontraron datos del socio que se busca.</p>;
  }

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
