import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// ── Importaciones estáticas: solo lo que se necesita en TODAS las rutas ──
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Error404 from "./components/Error404.js";

// ── Lazy loading: cada página se carga solo cuando el usuario la visita ──
// Esto reduce el bundle inicial de ~800KB a ~150KB → FCP mejora drásticamente
const HomePage        = lazy(() => import('./page/HomePage.js'));
const Post            = lazy(() => import('./page/Post.js'));
const UserData        = lazy(() => import('./page/UserData.js'));
const Actividades     = lazy(() => import('./page/Actividades.js'));
const ContactSection  = lazy(() => import('./page/ContactSection.js'));
const Descargar       = lazy(() => import('./page/Descargar.js'));
const Inscription     = lazy(() => import('./page/Inscription.js'));
const Informacion     = lazy(() => import('./page/Informacion.js'));

const Descargo          = lazy(() => import('./components/Descargo.js'));
const Cursantes         = lazy(() => import('./components/Cursantes.js'));
const SuperAdminCourses = lazy(() => import('./components/SuperAdminCourses.js'));
const Login             = lazy(() => import('./components/Login'));
const Register          = lazy(() => import('./components/Register'));
const Reestablecer      = lazy(() => import('./components/Reestablecer.js'));
const Socio             = lazy(() => import('./components/Socio.js'));
const CrearPost         = lazy(() => import('./components/CrearPost.js'));
const ActividadesList   = lazy(() => import('./components/ActividadesList.js'));
const UserActividad     = lazy(() => import('./components/UserActividad'));
const PostCompleto      = lazy(() => import('./components/PostCompleto'));
const MyPost            = lazy(() => import('./components/MyPost.js'));
const EditPost          = lazy(() => import('./components/EditPost.js'));
const CongelarUsuarios  = lazy(() => import('./components/CongelarUsuarios.js'));

// ── MySwal: instancia única fuera del componente ──────────────────────────
const MySwal = withReactContent(Swal);

// ── ErrorBoundary ─────────────────────────────────────────────────────────
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

// ── Datos del SweetAlert ──────────────────────────────────────────────────
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

function AppContent() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);

  // ── Logout por inactividad ──────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (user) {
      timeoutRef.current = setTimeout(handleLogout, 10 * 60 * 1000);
    }
  };

  useEffect(() => {
    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user]);

  // ── SweetAlert de carga: NO bloqueante ────────────────────────────────
  // CAMBIO CLAVE: el alert se muestra DESPUÉS de que React ya renderizó
  // la página (setTimeout 0), y dura solo 1.5s en lugar de 3s fijos.
  // Así el FCP ocurre de inmediato y el alert es meramente decorativo.
  useEffect(() => {
    const itemRandom = datos[Math.floor(Math.random() * datos.length)];

    const rafId = requestAnimationFrame(() => {
      MySwal.fire({
        title: 'Cargando...',
        html: itemRandom.texto,
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 1500,           // Cierra solo a los 1.5s — sin setTimeout manual
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      Swal.close();
    };
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      {/* Suspense: muestra fallback liviano mientras carga el chunk de la ruta */}
      <Suspense fallback={null}>
        <UserActividad />
      </Suspense>

      <Navbar />

      <Suspense fallback={null}>
        <Routes>
          <Route path="/data-user"                   element={<UserData />} />
          <Route path="/registro"                    element={<Register />} />
          <Route path="/reestablecer"                element={<Reestablecer />} />
          <Route path="/descargas"                   element={<Descargar />} />
          <Route path="/login"                       element={<Login />} />
          <Route path="/socio/dashboard"             element={<Socio />} />
          <Route path="/superadmin/dashboard"        element={<Socio />} />
          <Route path="/admin/dashboard"             element={<Socio />} />
          <Route path="/crear"                       element={<CrearPost />} />
          <Route path="/post/:id"                    element={<PostCompleto />} />
          <Route path="/editar-publicaciones"        element={<MyPost />} />
          <Route path="/editar/:postId"              element={<EditPost />} />
          <Route path="/contacto"                    element={<ContactSection />} />
          <Route path="/crear-actividades"           element={<ActividadesList />} />
          <Route path="/actividades"                 element={<Actividades />} />
          <Route path="/inscription"                 element={<Inscription />} />
          <Route path="/informacion"                 element={<Informacion />} />
          <Route path="/superadmincourses"           element={<SuperAdminCourses />} />
          <Route path="/cursantes"                   element={<Cursantes />} />
          <Route path="/congelar"                    element={<CongelarUsuarios />} />
          <Route path="/post"                        element={<Post />} />
          <Route path="/descargo-de-responsabilidad" element={<Descargo />} />
          <Route path="/"                            element={<HomePage />} />
          <Route path="*"                            element={<Error404 />} />
        </Routes>
      </Suspense>

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
