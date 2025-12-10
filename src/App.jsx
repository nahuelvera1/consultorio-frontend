import { Routes, Route } from 'react-router-dom'

// --- TUS PÁGINAS (IMPORTS) ---
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Panel from './pages/Panel'
import Admin from './pages/Admin'
import Ficha from './pages/Ficha'
import Pacientes from './pages/Pacientes'
import Precios from './pages/Precios'
import Reportes from './pages/Reportes' // <--- 1. AQUÍ IMPORTAMOS LA NUEVA PÁGINA
import Configuracion from './pages/Configuracion'

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      
      {/* Rutas Privadas (Paciente) */}
      <Route path="/panel" element={<Panel />} />
      
      {/* Rutas Privadas (Doctora/Admin) */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/pacientes" element={<Pacientes />} />
      <Route path="/ficha/:id" element={<Ficha />} />
      <Route path="/precios" element={<Precios />} />
      
      {/* 2. AQUÍ AGREGAMOS LA RUTA DE REPORTES */}
      <Route path="/reportes" element={<Reportes />} /> 
      {/* Ruta de Configuración (Cambiar Contraseña y Roles) */}
      <Route path="/configuracion" element={<Configuracion />} />
    </Routes>
  )
}

export default App