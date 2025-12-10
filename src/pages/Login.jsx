import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css';

function Login() {
  const navigate = useNavigate()
  
  const [datos, setDatos] = useState({
    email: '',
    password: ''
  })

  // Estado para alternar la visibilidad de la contraseña
  const [verPassword, setVerPassword] = useState(false)

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    .then(async response => {
      if (response.ok) {
        const usuario = await response.json();
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

        if (usuario.rol_id === 1 || usuario.rol_id === 2) {
            navigate('/admin'); 
        } else {
            navigate('/panel');
        }

      } else {
        const mensaje = await response.text();
        alert("❌ Error: " + mensaje);
      }
    })
    .catch(() => alert("Error al intentar conectar con el servidor"))
  }

  return (
    <div className="login-wrapper">
      
      <Link to="/" className="btn-back-home">
        ← Volver al Inicio
      </Link>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">🦷</div>
          <h2>Bienvenido</h2>
          <p>Ingresa tus datos para gestionar tu salud.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              name="email" 
              type="email" 
              placeholder="ejemplo@correo.com" 
              value={datos.email} 
              onChange={handleChange} 
              required 
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            {/* Wrapper relativo para posicionar el ojito */}
            <div className="password-wrapper">
                <input 
                  name="password" 
                  // Aquí cambiamos el tipo dinámicamente
                  type={verPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={datos.password} 
                  onChange={handleChange} 
                  required 
                  className="input-field password-input"
                />
                
                {/* Botón del Ojito */}
                <button 
                  type="button" // Importante: type="button" para que no envíe el formulario
                  className="btn-eye"
                  onClick={() => setVerPassword(!verPassword)}
                >
                  {verPassword ? "🙈" : "👁️"} 
                </button>
            </div>
          </div>

          <button type="submit" className="btn-login-submit">Ingresar</button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta?</p>
          <Link to="/registro" className="link-register">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  )
}

export default Login