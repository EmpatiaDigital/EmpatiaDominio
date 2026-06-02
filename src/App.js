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
import Inscription from './page/Inscription.js';
import Informacion from './page/Informacion.js';

//COMPONENTES DE ACA PARA ABAJO
import Descargo from './components/Descargo.js';
import Cursantes from './components/Cursantes.js';
import SuperAdminCourses from './components/SuperAdminCourses.js';
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
import Error404 from "./components/Error404.js";

const MySwal = withReactContent(Swal);

// ── ErrorBoundary: atrapa errores de render en cualquier ruta ──
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) return <Error404 />;
    return this.props.children;
  }
}

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

  const datos = [
    {
      texto: (
        <>
          La <strong>empatía digital</strong> no se trata solo de entender al otro, sino de{" "}
          <strong>actuar con respeto</strong> en cada mensaje, comentario o reacción.
        </>
      ),
    },
    {
      texto: (
        <>
          Pasar tiempo de calidad <strong>sin pantallas</strong> también es una forma de{" "}
          <strong>cuidar el vínculo</strong> con quienes más querés.
        </>
      ),
    },
    {
      texto: (
        <>
          En el mundo digital, un simple <strong>"visto" sin respuesta</strong> puede tener un impacto emocional.{" "}
          <strong>Responder con empatía</strong> también es cuidar.
        </>
      ),
    },
    {
      texto: (
        <>
          <strong>Compartir fotos o datos de otros sin permiso</strong> rompe la confianza. La empatía digital comienza por{" "}
          <strong>preguntar antes de publicar</strong>.
        </>
      ),
    },
    {
      texto: (
        <>
          Usar tecnología con conciencia es un acto de <strong>autocuidado</strong> y también de{" "}
          <strong>cuidado hacia los demás</strong>.
        </>
      ),
    },
  ];

  useEffect(() => {
    const itemRandom = datos[Math.floor(Math.random() * datos.length)];
    setLoading(true);
  
    MySwal.fire({
      title: 'Cargando Datos...',
      html: itemRandom.texto,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
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
    <ErrorBoundary>
      <UserActividad />
      <Navbar />

      {/* El SweetAlert se muestra sin bloquear el render de las rutas */}
      <Routes>
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
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/informacion" element={<Informacion />} />
        <Route path="/superadmincourses" element={<SuperAdminCourses />} />
        <Route path="/cursantes" element={<Cursantes />} />
        <Route path="/congelar" element={<CongelarUsuarios />} />
        <Route path="/post" element={<Post />} />
        <Route path="/descargo-de-responsabilidad" element={<Descargo />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Error404 />} />
      </Routes>

      <Footer />
    </ErrorBoundary>
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
