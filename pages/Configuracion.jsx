import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import './Configuracion.css';

function Configuracion() {
    const navigate = useNavigate()
  
  // Usuario logueado (La doctora)
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

  // --- ESTADOS ---
  const [passData, setPassData] = useState({ actual: '', nueva: '', confirmar: '' })
  const [usuarios, setUsuarios] = useState([]) // Lista para gestionar roles

  // --- CARGAR LISTA DE USUARIOS ---
    const cargarUsuarios = () => {
    fetch('https://api-consultorio-usf9.onrender.com/usuarios')
      .then(res => res.json())
      .then(data => {
        // Excluimos al usuario logueado para que no se cambie el rol a sí mismo por error
        setUsuarios(data.filter(u => u.id !== usuarioLogueado.id));
      })
  }

  useEffect(() => {
    if (!usuarioLogueado.id || usuarioLogueado.rol_id > 2) {
        navigate('/login'); // Seguridad básica
    } else {
        cargarUsuarios();
    }
    // eslint-disable-next-line
  }, [])

  // --- LÓGICA 1: CAMBIAR CONTRASEÑA ---
  const handleChangePassword = (e) => {
      e.preventDefault();
      if(passData.nueva !== passData.confirmar) return alert("Las contraseñas nuevas no coinciden");

    fetch('https://api-consultorio-usf9.onrender.com/cambiar-password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              id: usuarioLogueado.id,
              actual: passData.actual,
              nueva: passData.nueva
          })
      }).then(async res => {
          const msg = await res.text();
          if(res.ok) {
              alert("✅ " + msg);
              setPassData({ actual: '', nueva: '', confirmar: '' });
          } else {
              alert("❌ " + msg);
          }
      })
  }

  // --- LÓGICA 2: CAMBIAR ROL ---
  const cambiarRol = (idUsuario, nuevoRol, nombre) => {
      const roles = { 1: "ADMIN", 2: "DENTISTA", 3: "PACIENTE" };
      if(!window.confirm(`¿Estás segura de cambiar a ${nombre} al rol de ${roles[nuevoRol]}?`)) return;

    fetch('https://api-consultorio-usf9.onrender.com/cambiar-rol', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_id: idUsuario, nuevo_rol: nuevoRol })
      }).then(res => {
          if(res.ok) {
              alert("Rol actualizado.");
              cargarUsuarios();
          }
      })
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <button onClick={() => navigate('/admin')} style={{marginBottom:'20px', cursor:'pointer', padding:'8px 12px', background:'#eee', border:'none', borderRadius:'5px'}}>⬅ Volver al Panel</button>
      
      <h1 style={{color: '#333'}}>⚙️ Configuración del Sistema</h1>

      {/* SECCIÓN 1: MI CONTRASEÑA */}
      <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '30px'}}>
          <h3 style={{marginTop:0, color: '#007bff'}}>🔒 Mi Seguridad</h3>
          <form onSubmit={handleChangePassword} style={{display:'grid', gap:'15px', maxWidth:'400px'}}>
              <input type="password" placeholder="Contraseña Actual" value={passData.actual} onChange={e=>setPassData({...passData, actual:e.target.value})} required style={estiloInput}/>
              <input type="password" placeholder="Nueva Contraseña" value={passData.nueva} onChange={e=>setPassData({...passData, nueva:e.target.value})} required style={estiloInput}/>
              <input type="password" placeholder="Confirmar Nueva" value={passData.confirmar} onChange={e=>setPassData({...passData, confirmar:e.target.value})} required style={estiloInput}/>
              <button type="submit" style={{padding:'10px', background:'#28a745', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Actualizar Contraseña</button>
          </form>
      </div>

      {/* SECCIÓN 2: GESTIÓN DE EQUIPO */}
      <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
          <h3 style={{marginTop:0, color: '#6f42c1'}}>👩‍⚕️ Gestión de Equipo y Roles</h3>
          <p style={{fontSize:'14px', color:'#666'}}>Aquí puedes otorgar permisos de Doctora a otros usuarios registrados.</p>
          
          <table style={{width: '100%', borderCollapse: 'collapse', marginTop:'15px'}}>
              <thead>
                  <tr style={{background:'#f8f9fa', textAlign:'left'}}>
                      <th style={{padding:'10px'}}>Usuario</th>
                      <th style={{padding:'10px'}}>Rol Actual</th>
                      <th style={{padding:'10px'}}>Cambiar a</th>
                  </tr>
              </thead>
              <tbody>
                  {usuarios.map(u => (
                      <tr key={u.id} style={{borderBottom:'1px solid #eee'}}>
                          <td style={{padding:'10px'}}>
                              <strong>{u.apellido}, {u.nombre}</strong><br/>
                              <small>{u.email}</small>
                          </td>
                          <td style={{padding:'10px'}}>
                              {u.rol_id === 1 ? <span style={{color:'red', fontWeight:'bold'}}>ADMIN</span> : 
                               u.rol_id === 2 ? <span style={{color:'#007bff', fontWeight:'bold'}}>DOCTORA</span> : 
                               <span style={{color:'green'}}>PACIENTE</span>}
                          </td>
                          <td style={{padding:'10px'}}>
                              <div style={{display:'flex', gap:'5px'}}>
                                  {u.rol_id !== 2 && (
                                      <button onClick={() => cambiarRol(u.id, 2, u.nombre)} style={{padding:'5px 10px', background:'#007bff', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'12px'}}>
                                          Hacer Doctora
                                      </button>
                                  )}
                                  {u.rol_id !== 3 && (
                                      <button onClick={() => cambiarRol(u.id, 3, u.nombre)} style={{padding:'5px 10px', background:'#6c757d', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'12px'}}>
                                          Hacer Paciente
                                      </button>
                                  )}
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

    </div>
  )
}

const estiloInput = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }

export default Configuracion