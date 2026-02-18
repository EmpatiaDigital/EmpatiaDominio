import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../style/Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(correo, password);
      console.log('Respuesta del backend EN EL LOGIN:', response);

      Swal.fire({
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente.',
        icon: 'success',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Continuar'
      }).then(() => {
        // navigate('/'); // Redirige después del OK
      });

    } catch (err) {

      Swal.fire({
        title: 'Error',
        text: err.message || 'Hubo un problema al iniciar sesión.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Intentar de nuevo'
      });
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Iniciar sesión</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="input-password-container">
          <input
            type={mostrarPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {mostrarPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button type="submit" className="login-button">Entrar</button>

        <div className="login-links">
          <Link to="/registro" className="link-register"><strong>¿No tenés cuenta? Registrate</strong></Link>
          <Link to="/reestablecer" className="link-reset"><strong>¿Olvidaste tu contraseña?</strong></Link>
        </div>
      </form>
    </div>
  );
};

export default Login;

