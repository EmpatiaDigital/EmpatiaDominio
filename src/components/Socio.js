import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Logo from "../assets/empatialog.jpeg";
import LogoSentidos from "../assets/empatialog.jpeg";

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

    // Clonar el elemento para aplicar estilos inline sin afectar el DOM real
    const clone = carnetElement.cloneNode(true);

    // Wrapper temporal fuera de pantalla
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 320px;
      z-index: -1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    // Estilos del carnet completo (card-header-modern)
    clone.style.cssText = `
      background: linear-gradient(155deg, #111827 0%, #1a2e4a 45%, #7f1d1d 100%);
      padding: 20px 20px 16px;
      color: white;
      text-align: center;
      position: relative;
      overflow: hidden;
      width: 320px;
      box-sizing: border-box;
      border-radius: 0;
    `;

    // Aplicar estilos inline a los hijos del clon
    const applyChildStyles = (cloneEl, originalEl) => {
      const cloneChildren = cloneEl.children;
      const origChildren = originalEl.children;

      for (let i = 0; i < cloneChildren.length; i++) {
        const cloneChild = cloneChildren[i];
        const origChild = origChildren[i];
        if (!origChild) continue;

        const tag = cloneChild.tagName;
        const classes = origChild.className || "";

        // card-avatar (foto de perfil)
        if (classes.includes("card-avatar") && tag === "IMG") {
          cloneChild.style.cssText = `
            width: 90px;
            height: 90px;
            border-radius: 10px;
            object-fit: cover;
            border: 2px solid rgba(255,255,255,0.25);
            background: #1e2d45;
            margin: 12px auto 10px;
            display: block;
          `;
        }

        // logo-cuadrado
        if (classes.includes("logo-cuadrado") && tag === "IMG") {
          cloneChild.style.cssText = `
            width: 100px;
            height: 64px;
            object-fit: contain;
            margin: 10px auto 8px;
            display: block;
            opacity: 0.9;
          `;
        }

        // h1 -> "Carnet de Socio"
        if (tag === "H1") {
          cloneChild.style.cssText = `
            font-size: 13px;
            font-weight: 500;
            padding: 7px 14px;
            border-radius: 7px;
            background: #991b1b;
            color: #ffffff;
            margin: 10px auto 4px;
            letter-spacing: 0.5px;
            display: inline-block;
          `;
        }

        // h2 -> nombre del socio
        if (tag === "H2") {
          cloneChild.style.cssText = `
            font-size: 17px;
            font-weight: 500;
            margin: 6px 0 4px;
            color: #f1f5f9;
          `;
        }

        // strong activo/inactivo
        if (tag === "STRONG") {
          const cls = origChild.className || "";
          cloneChild.style.cssText = `
            font-size: 13px;
            font-weight: 500;
            color: ${cls.includes("activo") ? "#34d399" : "#f87171"};
            display: inline;
          `;
        }

        // card-header-orange wrapper (foto)
        if (classes.includes("card-header-orange")) {
          cloneChild.style.cssText = `
            text-align: center;
            padding: 4px 0 0;
          `;
          const innerImg = cloneChild.querySelector("img");
          if (innerImg) {
            innerImg.style.cssText = `
              width: 90px;
              height: 90px;
              border-radius: 10px;
              object-fit: cover;
              border: 2px solid rgba(255,255,255,0.25);
              background: #1e2d45;
              margin: 12px auto 10px;
              display: block;
            `;
          }
        }

        // Texto suelto (nodos de texto no aplican, pero los spans/strong ya cubiertos)
      }
    };

    applyChildStyles(clone, carnetElement);

    // Textos sueltos tipo "Socio:" y "Localidad:" quedan en nodos de texto nativos,
    // html2canvas los lee bien si el color del padre está seteado.
    // Forzamos color blanco en el wrapper del clone
    clone.querySelectorAll("*").forEach((el) => {
      if (!el.style.color && el.tagName !== "IMG") {
        el.style.color = "#cbd5e1";
      }
    });

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    html2canvas(clone, {
      useCORS: true,
      scale: 3,
      backgroundColor: null,
      logging: false,
      width: 320,
      windowWidth: 320,
    }).then((canvas) => {
      document.body.removeChild(wrapper);

      // Agregar borde redondeado en el canvas final
      const finalCanvas = document.createElement("canvas");
      const radius = 14;
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const ctx = finalCanvas.getContext("2d");

      ctx.beginPath();
      ctx.moveTo(radius * 3, 0);
      ctx.lineTo(finalCanvas.width - radius * 3, 0);
      ctx.quadraticCurveTo(finalCanvas.width, 0, finalCanvas.width, radius * 3);
      ctx.lineTo(finalCanvas.width, finalCanvas.height - radius * 3);
      ctx.quadraticCurveTo(finalCanvas.width, finalCanvas.height, finalCanvas.width - radius * 3, finalCanvas.height);
      ctx.lineTo(radius * 3, finalCanvas.height);
      ctx.quadraticCurveTo(0, finalCanvas.height, 0, finalCanvas.height - radius * 3);
      ctx.lineTo(0, radius * 3);
      ctx.quadraticCurveTo(0, 0, radius * 3, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(canvas, 0, 0);

      const link = document.createElement("a");
      link.download = `Carnet_Socio_${socioData.nombre}.png`;
      link.href = finalCanvas.toDataURL("image/png");
      link.click();
    }).catch(() => {
      document.body.removeChild(wrapper);
      Swal.fire("Error", "No se pudo capturar el carnet. Intentá de nuevo.", "error");
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
          const res = await fetch("https://empatia-dominio-back.vercel.app/api/socios/obtener", {
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
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        Swal.fire("Error", "Por favor selecciona una imagen válida (JPG, PNG, GIF, WEBP)", "error");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        Swal.fire("Error", "La imagen no puede superar los 5MB", "error");
        return;
      }

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

    Swal.fire({
      title: 'Guardando cambios...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const formData = new FormData();

      formData.append('_id', socioData._id);
      formData.append('nombre', editedData.nombre || socioData.nombre || '');
      formData.append('apellido', editedData.apellido || socioData.apellido || '');
      formData.append('telefono', editedData.telefono || socioData.telefono || '');
      formData.append('provincia', editedData.provincia || socioData.provincia || '');
      formData.append('ciudad', editedData.ciudad || socioData.ciudad || '');

      if (selectedImage) {
        formData.append("avatar", selectedImage);
      }

      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await fetch("https://empatia-dominio-back.vercel.app/api/socios/editar", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Datos actualizados correctamente",
          confirmButtonColor: "#3085d6"
        });

        const updatedSocio = {
          ...socioData,
          ...editedData,
          avatar: data.socio?.avatar || socioData.avatar
        };

        setSocioData(updatedSocio);
        setEditedData(updatedSocio);
        setIsEditing(false);
        setSelectedImage(null);

        if (data.socio?.avatar) {
          setPreviewImage(data.socio.avatar);
        }

      } else {
        throw new Error(data.message || data.error || "Error al actualizar los datos");
      }

    } catch (error) {
      console.error("Error al editar datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error al actualizar los datos",
        confirmButtonColor: "#d33"
      });
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
          const res = await fetch("https://empatia-dominio-back.vercel.app/api/cambiar-password-logueado", {
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
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Cargando datos del socio...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#d33'
      }}>
        {error}
      </div>
    );
  }

  if (!socioData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        No se encontraron datos del socio que se busca.
      </div>
    );
  }

  return (
    <div className="socio-dashboard-container">
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
                crossOrigin="anonymous"
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
              crossOrigin="anonymous"
            />
            <h1>Carnet de Socio</h1>
          </div>

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
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    disabled={!socioData.active}
                    style={{ 
                      opacity: socioData.active ? 1 : 0.5,
                      marginTop: '10px'
                    }}
                  />
                  {previewImage && selectedImage && (
                    <div style={{ marginTop: '15px' }}>
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>Vista previa:</p>
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '150px', 
                          maxHeight: '150px', 
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }} 
                      />
                    </div>
                  )}
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
