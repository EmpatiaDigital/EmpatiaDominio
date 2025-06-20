import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Importaciones de páginas y componentes
import HomePage from './page/HomePage.js'; 
import Post from './page/Post.js'; 
import UserData from './page/UserData.js'; 
import Actividades from './page/Actividades.js';
import ContactSection from './page/ContactSection.js';
import Descargar from './page/Descargar.js';

//COMPONENTES DE ACA PARA ABAJO
import Descargo from './components/Descargo.js';
import Login from './components/Login';
import Register from './components/Register';
import Reestablecer from './components/Reestablecer.js';
import Socio from './components/Socio.js';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CrearPost from './components/CrearPost.js';
import ActividadesList from './components/ActividadesList.js';
import UserActividad from './components/UserActividad';
import PostCompleto from "./components/PostCompleto";
import MyPost from "./components/MyPost.js";
import EditPost from "./components/EditPost.js";
import CongelarUsuarios from "./components/CongelarUsuarios.js";

const MySwal = withReactContent(Swal);

function AppContent() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Manejo del logout por inactividad
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (user) {
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, 10 * 60 * 1000); // 10 minutos
    }
  };


  
  const MySwal = withReactContent(Swal);
  
  const imagenes = [
    "https://www.empatiadigital.com.ar/LibroPortada.jpg",
    "https://www.empatiadigital.com.ar/Portada1.jpg",
    "https://www.empatiadigital.com.ar/Portada2.jpg",
    "https://www.empatiadigital.com.ar/Portada3.jpg",
    "https://www.empatiadigital.com.ar/Portada4.jpg",
  ];
  
  useEffect(() => {
    const imagenRandom = imagenes[Math.floor(Math.random() * imagenes.length)];
    setLoading(true);
  
    MySwal.fire({
      title: 'Cargando Datos...',
      imageUrl: imagenRandom,
      imageWidth: 200,
      imageHeight: 150,
      imageAlt: 'Imagen de carga',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    // Simulación de carga (ajustalo según tu fetch real)
    const timeout = setTimeout(() => {
      Swal.close();
      setLoading(false);
    }, 3000);
  
    return () => clearTimeout(timeout);
  }, [location.pathname]);
  

  // Reiniciar temporizador por actividad
  useEffect(() => {
    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user]);

  return (
    <>
     <UserActividad />
      <Navbar />
      {!loading && (
        <Routes>
          {/* <Route path="/reestablecer" element={<Reestablecer />} /> */}
          <Route path="/data-user" element={<UserData />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/reestablecer" element={<Reestablecer />} />
          <Route path="/descargas" element={<Descargar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/socio/dashboard" element={<Socio />} />
          <Route path="/superadmin/dashboard" element={<Socio />} />
          <Route path="/admin/dashboard" element={<Socio />} />
          <Route path="/crear" element={<CrearPost />} />
          <Route path="/post/:id" element={<PostCompleto />} />
          <Route path="/editar-publicaciones" element={<MyPost />} />
          <Route path="/editar/:postId" element={<EditPost />} />
          <Route path="/contacto" element={<ContactSection />} />
          <Route path="/crear-actividades" element={<ActividadesList />} />
          <Route path="/actividades" element={<Actividades />} />
          <Route path="/congelar" element={<CongelarUsuarios />} />
          <Route path="/post" element={<Post />} />
          <Route path="/descargo-de-responsabilidad" element={<Descargo />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      )}
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
