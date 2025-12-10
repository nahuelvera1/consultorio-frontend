import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Registro.css';

function Registro() {
  const navigate = useNavigate()
  
  const [formulario, setFormulario] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    dni: '', obra_social: '', numero_afiliado: '', fecha_nacimiento: '', domicilio: ''
  })

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
  // Enviamos los datos (el backend verificará si ya existen)
  fetch('https://api-consultorio-usf0.onrender.com/crear-paciente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formulario)
    })
    .then(async response => {
      const mensaje = await response.text();
      
      if(response.ok) {
        alert("✅ ¡Cuenta creada con éxito!\n\nRecuerda:\nUsuario: " + formulario.email + "\nContraseña: " + formulario.dni);
        navigate('/login');
      } else {
        // Aquí mostramos el error si el DNI o Email ya existen
        alert("❌ No se pudo registrar: " + mensaje);
      }
    })
    .catch(() => alert("Error de conexión con el servidor"))
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2 style={{textAlign: 'center', color: '#007bff'}}>Crear Cuenta Nueva</h2>
      
      {/* --- CARTEL DE ADVERTENCIA NUEVO --- */}
      <div style={{ background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba', fontSize: '14px' }}>
        <strong>⚠️ ATENCIÓN MUY IMPORTANTE:</strong><br/>
        Por favor escribe tu <strong>Email</strong> y <strong>DNI</strong> correctamente.
        <br/>
        Serán tus datos obligatorios para iniciar sesión en el futuro.
      </div>

      <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <input name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={handleChange} required style={estiloInput} />
          <input name="apellido" placeholder="Apellido" value={formulario.apellido} onChange={handleChange} required style={estiloInput} />
          
          <input name="dni" type="number" placeholder="DNI (Sin puntos)" value={formulario.dni} onChange={handleChange} required style={estiloInput} />
          
          <div style={{display:'flex', flexDirection:'column'}}>
            <label style={{fontSize:'12px', color:'#666', marginBottom:'2px'}}>Fecha de Nacimiento:</label>
            <input name="fecha_nacimiento" type="date" value={formulario.fecha_nacimiento} onChange={handleChange} required style={estiloInput} />
          </div>
          
          <input name="domicilio" placeholder="Dirección completa" value={formulario.domicilio} onChange={handleChange} required style={{...estiloInput, gridColumn: 'span 2'}} />

          <input name="telefono" placeholder="Teléfono" value={formulario.telefono} onChange={handleChange} required style={estiloInput} />
          <input name="email" type="email" placeholder="Email (Será tu Usuario)" value={formulario.email} onChange={handleChange} required style={estiloInput} />
          
          {/* --- SECCIÓN OBRA SOCIAL (OPCIONAL) --- */}
          <div style={{gridColumn: 'span 2', marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '10px'}}>
            <label style={{fontSize: '14px', color: '#555', fontWeight: 'bold'}}>Datos de Obra Social (Opcional)</label>
            <p style={{fontSize: '12px', color: '#888', margin: '2px 0 10px 0'}}>Si no tienes, deja estos campos vacíos.</p>
          </div>
          
          {/* Quitamos el 'required' de aquí */}
          <input name="obra_social" placeholder="Nombre Obra Social" value={formulario.obra_social} onChange={handleChange} style={estiloInput} />
          <input name="numero_afiliado" placeholder="N° Credencial / Afiliado" value={formulario.numero_afiliado} onChange={handleChange} style={estiloInput} />
          
          <button type="submit" style={{ gridColumn: 'span 2', padding: '15px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontSize: '16px', marginTop: '10px', fontWeight: 'bold' }}>
            Confirmar Registro
          </button>

        </form>

        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <Link to="/login" style={{color: '#007bff'}}>¿Ya tienes cuenta? Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  )
}

const estiloInput = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }


export default Registro
