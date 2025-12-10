import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import './Pacientes.css';

function Pacientes() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState([])
  const [busqueda, setBusqueda] = useState("") 
  
  const doctor = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

  const [modalAbierto, setModalAbierto] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  
  // AHORA INCLUIMOS DURACIÓN (Por defecto 40)
  const [datosTurno, setDatosTurno] = useState({
      fecha: '', hora: '', motivo: '', duracion: 40
  })

  const cargarPacientes = () => {
    fetch('https://api-consultorio-usf0.onrender.com/usuarios')
      .then(res => res.json())
      .then(data => {
        const soloPacientes = data.filter(u => u.rol_id === 3);
        setPacientes(soloPacientes)
      })
      .catch(err => console.error("Error cargando pacientes", err))
  }

  useEffect(() => {
    cargarPacientes()
  }, [])

  const abrirModalTurno = (paciente) => {
      setPacienteSeleccionado(paciente);
      setDatosTurno({ fecha: '', hora: '', motivo: '', duracion: 40 }); 
      setModalAbierto(true);
  }

  const confirmarAsignacion = (e) => {
      e.preventDefault();
      if(!datosTurno.fecha || !datosTurno.hora || !datosTurno.motivo) return alert("Faltan datos");

    fetch('https://api-consultorio-usf0.onrender.com/crear-turno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              paciente_id: pacienteSeleccionado.id,
              dentista_id: doctor.id, 
              fecha: datosTurno.fecha,
              hora: datosTurno.hora,
              motivo_consulta: `[Asignado] ${datosTurno.motivo}`,
              duracion: datosTurno.duracion // <--- ENVIAMOS LA DURACIÓN PERSONALIZADA
          })
      }).then(res => {
          if(res.ok) {
              alert(`✅ Turno de ${datosTurno.duracion} min asignado a ${pacienteSeleccionado.nombre}.`);
              setModalAbierto(false);
          } else {
              alert("Error al asignar turno.");
          }
      })
  }

  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      
      {modalAbierto && (
          <div style={estiloOverlay}>
              <div style={estiloModal}>
                  <h3 style={{margin:'0 0 20px 0', color:'#007bff'}}>📅 Agendar a {pacienteSeleccionado.nombre}</h3>
                  <form onSubmit={confirmarAsignacion} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                      <div>
                          <label style={{fontSize:'12px', fontWeight:'bold', display:'block'}}>Fecha:</label>
                          <input type="date" required value={datosTurno.fecha} onChange={e => setDatosTurno({...datosTurno, fecha: e.target.value})} style={estiloInput}/>
                      </div>
                      
                      {/* FILA DE HORA Y DURACIÓN */}
                      <div style={{display:'flex', gap:'10px'}}>
                        <div style={{flex:1}}>
                            <label style={{fontSize:'12px', fontWeight:'bold', display:'block'}}>Hora:</label>
                            <input type="time" required value={datosTurno.hora} onChange={e => setDatosTurno({...datosTurno, hora: e.target.value})} style={estiloInput}/>
                        </div>
                        <div style={{flex:1}}>
                            <label style={{fontSize:'12px', fontWeight:'bold', display:'block'}}>Duración (min):</label>
                            <input type="number" required value={datosTurno.duracion} onChange={e => setDatosTurno({...datosTurno, duracion: e.target.value})} style={estiloInput}/>
                        </div>
                      </div>

                      <div>
                          <label style={{fontSize:'12px', fontWeight:'bold', display:'block'}}>Motivo:</label>
                          <input placeholder="Tratamiento..." required value={datosTurno.motivo} onChange={e => setDatosTurno({...datosTurno, motivo: e.target.value})} style={estiloInput}/>
                      </div>
                      <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                          <button type="button" onClick={() => setModalAbierto(false)} style={{flex:1, padding:'10px', background:'#ccc', border:'none', borderRadius:'5px', cursor:'pointer'}}>Cancelar</button>
                          <button type="submit" style={{flex:1, padding:'10px', background:'#28a745', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Confirmar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <button onClick={() => navigate('/admin')} style={{cursor:'pointer', padding:'10px', background:'#eee', border:'none', borderRadius:'5px'}}>⬅ Volver al Panel</button>
        <h2 style={{margin:0, color:'#007bff'}}>Gestión de Pacientes</h2>
      </div>

      <div style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)', marginBottom:'20px'}}>
        <input type="text" placeholder="🔍 Buscar por nombre o email..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{width:'100%', padding:'12px', fontSize:'16px', borderRadius:'5px', border:'1px solid #ccc', boxSizing:'border-box'}}/>
      </div>

      <div style={{background:'white', borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead style={{background:'#f8f9fa', color:'#555'}}>
                <tr>
                    <th style={{padding:'15px', textAlign:'left'}}>Paciente</th>
                    <th style={{padding:'15px', textAlign:'left'}}>Datos</th>
                    <th style={{padding:'15px', textAlign:'center'}}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {pacientesFiltrados.map(p => (
                    <tr key={p.id} style={{borderBottom:'1px solid #eee'}}>
                        <td style={{padding:'15px'}}><strong>{p.apellido}, {p.nombre}</strong></td>
                        <td style={{padding:'15px', color:'#666'}}><div>{p.email}</div><div>{p.telefono}</div></td>
                        <td style={{padding:'15px', textAlign:'center'}}>
                            <div style={{display:'flex', justifyContent:'center', gap:'10px'}}>
                                <button onClick={() => abrirModalTurno(p)} style={{background:'#28a745', color:'white', border:'none', padding:'8px 12px', borderRadius:'5px', cursor:'pointer'}}>📅 Agendar</button>
                                <button onClick={() => navigate(`/ficha/${p.id}`)} style={{background:'#007bff', color:'white', border:'none', padding:'8px 12px', borderRadius:'5px', cursor:'pointer'}}>📂 Ficha</button>
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

const estiloOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
const estiloModal = { background: 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }
const estiloInput = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }

export default Pacientes