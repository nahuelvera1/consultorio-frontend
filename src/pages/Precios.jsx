
import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Precios.css';

function Precios() {
  const navigate = useNavigate()
  const [lista, setLista] = useState([])
  const [nuevo, setNuevo] = useState({ nombre: '', precio: '' })

  // 1. PRIMERO DEFINIMOS LA FUNCIÓN (Así React ya la conoce)
  const cargarPrecios = () => {
    fetch('https://api-consultorio-usf9.onrender.com/tratamientos')
      .then(res => res.json())
      .then(setLista)
      .catch(err => console.error("Error cargando precios:", err))
  }

  // 2. DESPUÉS USAMOS EL EFECTO
  useEffect(() => { 
    cargarPrecios() 
  }, [])

  // --- RESTO DE LA LÓGICA ---

  const guardar = (e) => {
    e.preventDefault();
    if(!nuevo.nombre || !nuevo.precio) return;
    
  fetch('https://api-consultorio-usf9.onrender.com/tratamientos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(nuevo)
    }).then(() => {
        setNuevo({nombre:'', precio:''});
        cargarPrecios();
    })
  }

  const borrar = (id) => {
    if(window.confirm("¿Borrar de la lista?")) {
  fetch(`https://api-consultorio-usf9.onrender.com/tratamientos/${id}`, { method: 'DELETE' })
        .then(() => cargarPrecios())
    }
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <button onClick={() => navigate('/admin')} style={{marginBottom:'20px', cursor:'pointer', padding:'8px 12px', border:'none', borderRadius:'5px', background:'#eee'}}>⬅ Volver al Panel</button>
      
      <h2 style={{color: '#007bff'}}>💰 Lista de Precios y Tratamientos</h2>

      {/* FORMULARIO DE CARGA */}
      <form onSubmit={guardar} style={{background: '#f8f9fa', padding: '20px', borderRadius: '10px', display: 'flex', gap: '10px', marginBottom: '20px', border:'1px solid #ddd'}}>
        <input placeholder="Nombre (Ej: Consulta)" value={nuevo.nombre} onChange={e=>setNuevo({...nuevo, nombre:e.target.value})} style={{flex: 2, padding: '10px', border:'1px solid #ccc', borderRadius:'5px'}} required />
        <input type="number" placeholder="Precio ($)" value={nuevo.precio} onChange={e=>setNuevo({...nuevo, precio:e.target.value})} style={{flex: 1, padding: '10px', border:'1px solid #ccc', borderRadius:'5px'}} required />
        <button type="submit" style={{background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', fontWeight:'bold'}}>+ Agregar</button>
      </form>

      {/* LISTA */}
      <div style={{background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderRadius:'10px', overflow:'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead><tr style={{background:'#333', color:'white', textAlign:'left'}}><th style={{padding:'10px'}}>Tratamiento</th><th style={{padding:'10px'}}>Precio Base</th><th style={{padding:'10px'}}></th></tr></thead>
            <tbody>
                {lista.map(item => (
                    <tr key={item.id} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding:'10px'}}>{item.nombre}</td>
                        <td style={{padding:'10px', fontWeight: 'bold'}}>${item.precio}</td>
                        <td style={{padding:'10px', textAlign:'right'}}>
                            <button onClick={() => borrar(item.id)} style={{color:'white', background:'#dc3545', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', fontSize:'12px'}}>Eliminar</button>
                        </td>
                    </tr>
                ))}
                {lista.length === 0 && <tr><td colSpan="3" style={{padding:'20px', textAlign:'center', color:'#777'}}>No hay precios cargados aún.</td></tr>}
            </tbody>
        </table>
      </div>
    </div>
  )
}


export default Precios
