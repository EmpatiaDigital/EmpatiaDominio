import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    // Cargo los datos del usuario desde localStorage, con fallback para avatar
    const storedUser = {
      username: localStorage.getItem("username") || "",
      role: localStorage.getItem("role") || "",
      id: localStorage.getItem("userId") || "",
      nombre: localStorage.getItem("nombre") || "Usuario",
      PostId: localStorage.getItem("PostId") || "No hay Post",
      avatar:
        localStorage.getItem("avatar") ||
        "https://cdn-icons-png.flaticon.com/512/64/64572.png", // fallback avatar
    };

    // Solo seteo user si existen datos esenciales
    if (storedUser.username && storedUser.role && storedUser.id) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = async (correo, password, username) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password, username }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error en el login");
    }

    const data = await res.json();

    // data.avatar tiene la URL completa del avatar, si no viene usamos fallback
    const avatarUrl =
      data.avatar && data.avatar.trim() !== ""
        ? data.avatar
        : "https://cdn-icons-png.flaticon.com/512/64/64572.png";

    // Guardo en localStorage todos los datos, incluido avatar
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", data.username);
    localStorage.setItem("nombre", data.nombre);
    localStorage.setItem("habilitado", data.active);
    localStorage.setItem("userId", data._id);
    localStorage.setItem("PostId", data.PostId);
    localStorage.setItem("avatar", avatarUrl);

    // Actualizo el estado del usuario
    const fetchedUser = {
      role: data.role,
      username: data.username,
      id: data._id,
      nombre: data.nombre,
      active: data.active,
      PostId: data.userId,
      avatar: avatarUrl,  
    };

    setUser(fetchedUser);

    // Redirijo según rol
    switch (data.role) {
      case "superadmin":
        navigate("/superadmin/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "socio":
        navigate("/socio/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
