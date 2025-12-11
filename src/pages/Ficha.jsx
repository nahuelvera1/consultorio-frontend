import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import './Ficha.css';

function Ficha() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

  // Estados de datos
  const [paciente, setPaciente] = useState(null)
  const [historia, setHistoria] = useState([])
  const [archivos, setArchivos] = useState([])
  
  // ESTADO DE EDICIÓN (Nuevo)
  const [editando, setEditando] = useState(false)
  const [datosEditables, setDatosEditables] = useState({}) // Aquí guardamos los cambios temporales

  // Estados auxiliares
  const [nuevaNota, setNuevaNota] = useState({ observacion: '', diente: '' })
  const [archivoSelect, setArchivoSelect] = useState(null)
  const [tipoArchivo, setTipoArchivo] = useState('Radiografia')

  // --- CARGAS ---
  const cargarHistoria = () => {
    fetch(`https://api-consultorio-usf9.onrender.com/historia/${id}`).then(res => res.json()).then(setHistoria);
  }
  const cargarArchivos = () => {
    fetch(`https://api-consultorio-usf9.onrender.com/archivos/${id}`).then(res => res.json()).then(setArchivos);
  }

  useEffect(() => {
    // Cargar PACIENTE
    fetch(`https://api-consultorio-usf9.onrender.com/usuarios/${id}`)
      .then(res => {
          if (!res.ok) throw new Error("Paciente no encontrado");
          return res.json();
      })
      .then(data => {
          setPaciente(data);
          setDatosEditables(data); // Inicializamos el formulario de edición con los datos actuales
      })
      .catch(() => navigate('/admin'));

    cargarHistoria();
    cargarArchivos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]) 

  // --- GUARDAR CAMBIOS DE EDICIÓN ---
  const guardarEdicion = () => {
    fetch(`https://api-consultorio-usf9.onrender.com/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEditables)
    }).then(res => {
        if(res.ok) {
            alert("✅ Datos actualizados correctamente");
            setPaciente(datosEditables); // Actualizamos la vista normal
            setEditando(false); // Salimos del modo edición
        } else {
            alert("Error al guardar cambios");
        }
    })
  }

  // --- OTROS MANEJADORES ---
  const handleGuardarNota = (e) => {
    e.preventDefault();
    fetch('https://api-consultorio-usf9.onrender.com/historia', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente_id: id, dentista_id: doctor.id, observaciones: nuevaNota.observacion, diente: nuevaNota.diente })
    }).then(() => { setNuevaNota({ observacion: '', diente: '' }); cargarHistoria(); })
  }

  const handleSubirArchivo = (e) => {
    e.preventDefault();
    if (!archivoSelect) return alert("Selecciona un archivo");
    const formData = new FormData();
    formData.append('archivo', archivoSelect); formData.append('paciente_id', id); formData.append('tipo', tipoArchivo);
    fetch('https://api-consultorio-usf0.onrender.com/subir-archivo', { method: 'POST', body: formData })
    .then(() => { alert("Archivo subido!"); setArchivoSelect(null); document.getElementById('fileInput').value = ""; cargarArchivos(); })
  }

  if (!paciente) return <p style={{textAlign:'center', marginTop:'50px'}}>Cargando...</p>

  // --- ESTILOS DE INPUT ---
  const inputEditStyle = {
      padding: '5px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginBottom: '5px'
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      
      <button onClick={() => navigate(-1)} style={{marginBottom: '20px', cursor:'pointer', padding:'8px 12px', background:'#eee', border:'none', borderRadius:'5px'}}>⬅ Volver</button>
      
      {/* --- SECCIÓN DATOS DEL PACIENTE (EDITABLE) --- */}
      <div style={{background: 'white', padding: '25px', borderRadius: '10px', borderLeft: '6px solid #007bff', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position:'relative'}}>
        
        {/* Botón de Editar / Guardar (Arriba a la derecha) */}
        <div style={{position:'absolute', top:'20px', right:'20px'}}>
            {!editando ? (
                <button onClick={() => setEditando(true)} style={{background:'#ffc107', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>✏️ Editar Datos</button>
            ) : (
                <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={() => setEditando(false)} style={{background:'#ccc', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>Cancelar</button>
                    <button onClick={guardarEdicion} style={{background:'#28a745', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>💾 Guardar Cambios</button>
                </div>
            )}
        </div>

        {/* Formulario o Vista */}
        {!editando ? (
            // VISTA NORMAL (SOLO LECTURA)
            <>
                <h1 style={{margin: '0 0 10px 0', color: '#333'}}>{paciente.apellido}, {paciente.nombre}</h1>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px', color: '#555', fontSize:'14px'}}>
                    <div><strong>DNI:</strong> {paciente.dni || '-'}</div>
                    <div><strong>Fecha Nac:</strong> {paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString() : '-'}</div>
                    <div><strong>Teléfono:</strong> {paciente.telefono}</div>
                    <div><strong>Email:</strong> {paciente.email}</div>
                    <div><strong>Domicilio:</strong> {paciente.domicilio || '-'}</div>
                    <div><strong>Obra Social:</strong> {paciente.obra_social || '-'} ({paciente.numero_afiliado || ''})</div>
                </div>
            </>
        ) : (
            // VISTA DE EDICIÓN (INPUTS)
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                <div>
                    <label style={{fontSize:'12px', fontWeight:'bold'}}>Nombre</label>
                    <input style={inputEditStyle} value={datosEditables.nombre} onChange={e => setDatosEditables({...datosEditables, nombre: e.target.value})} />
                </div>
                <div>
                    <label style={{fontSize:'12px', fontWeight:'bold'}}>Apellido</label>
                    <input style={inputEditStyle} value={datosEditables.apellido} onChange={e => setDatosEditables({...datosEditables, apellido: e.target.value})} />
                </div>
                <div>
                    <label style={{fontSize:'12px', fontWeight:'bold'}}>DNI</label>
                    <input style={inputEditStyle} value={datosEditables.dni} onChange={e => setDatosEditables({...datosEditables, dni: e.target.value})} />
                </div>
                <div>
                    <label style={{fontSize:'12px', fontWeight:'bold'}}>Fecha Nacimiento</label>
                    {/* Truco para manejar la fecha en el input date */}
                    <input type="date" style={inputEditStyle} value={datosEditables.fecha_nacimiento ? datosEditables.fecha_nacimiento.split('T')[0] : ''} onChange={e => setDatosEditables({...datosEditables, fecha_nacimiento: e.target.value})} />
                </div>
                <div>
                    <label style={{fontSize:'12px', fontWeight:'bold'}}>Teléfono</label>
                    <input style={inputEditStyle} value={datosEditables.telefono} onChange={e => setDatosEditables({...datosEditables, telefono: e.target.value})} />
                </div>
                <div>
                    <label style={{fontSize:'12px', fontWeight:'bold'}}>Email</label>
                    <input style={inputEditStyle} value={datosEditables.email} onChange={e => setDatosEditables({...datosEditables, email: e.target.value})} />
                </div>
                <div>
                    <label style={{fontSize:'12px', fontWeight:'bold'}}>Domicilio</label>
                    <input style={inputEditStyle} value={datosEditables.domicilio} onChange={e => setDatosEditables({...datosEditables, domicilio: e.target.value})} />
                </div>
                <div>
                    <label style={{fontSize:'12px', fontWeight:'bold'}}>Obra Social</label>
                    <input style={inputEditStyle} value={datosEditables.obra_social} onChange={e => setDatosEditables({...datosEditables, obra_social: e.target.value})} />
                </div>
            </div>
        )}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
        {/* COLUMNA IZQUIERDA: HISTORIA CLÍNICA */}
        <div>
            <h3 style={{borderBottom:'2px solid #28a745', paddingBottom:'10px'}}>📝 Evolución Clínica</h3>
            <form onSubmit={handleGuardarNota} style={{background: '#f1f8e9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border:'1px solid #c8e6c9'}}>
                <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                    <input placeholder="Pieza (Ej: 24)" value={nuevaNota.diente} onChange={e => setNuevaNota({...nuevaNota, diente: e.target.value})} style={{padding: '8px', width: '30%', border:'1px solid #ccc', borderRadius:'4px'}} />
                    <input placeholder="Evolución / Tratamiento" value={nuevaNota.observacion} onChange={e => setNuevaNota({...nuevaNota, observacion: e.target.value})} required style={{padding: '8px', flex:1, border:'1px solid #ccc', borderRadius:'4px'}} />
                </div>
                <button type="submit" style={{width:'100%', padding: '8px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight:'bold'}}>+ Agregar Nota</button>
            </form>
            <div style={{height: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', background:'white'}}>
                {historia.map(h => (
                    <div key={h.id} style={{padding: '15px', borderBottom: '1px solid #eee'}}>
                        <small style={{color: '#888'}}>{new Date(h.fecha).toLocaleDateString()} - Dr. {h.dentista}</small>
                        <div style={{fontWeight: 'bold', marginTop: '5px', color:'#333'}}>
                            {h.diente && <span style={{background:'#e8f5e9', color:'#2e7d32', padding:'2px 6px', borderRadius:'4px', marginRight:'5px', fontSize:'12px'}}>#{h.diente}</span>} 
                            {h.observaciones}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* COLUMNA DERECHA: ARCHIVOS */}
        <div>
            <h3 style={{borderBottom:'2px solid #007bff', paddingBottom:'10px'}}>📁 Estudios Adjuntos</h3>
            <form onSubmit={handleSubirArchivo} style={{background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px', border:'1px solid #bbdefb'}}>
                <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                    <select value={tipoArchivo} onChange={e => setTipoArchivo(e.target.value)} style={{padding: '8px', borderRadius:'4px', border:'1px solid #90caf9'}}>
                        <option>Radiografia</option><option>Foto</option><option>Estudio</option>
                    </select>
                    <input id="fileInput" type="file" onChange={e => setArchivoSelect(e.target.files[0])} required style={{fontSize:'12px'}} />
                </div>
                <button type="submit" style={{width:'100%', padding: '8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight:'bold'}}>⬆ Subir Archivo</button>
            </form>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px'}}>
                {archivos.map(a => (
                    <div key={a.id} style={{border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden', background:'white'}}>
                        <a href={`https://api-consultorio-usf0.onrender.com/uploads/${a.ruta_archivo}`} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
                            {a.nombre_archivo.match(/\.(jpg|jpeg|png)$/i) ? <img src={`https://api-consultorio-usf0.onrender.com/uploads/${a.ruta_archivo}`} style={{width: '100%', height: '100px', objectFit: 'cover'}} /> : <div style={{height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color:'#555'}}>📄</div>}
                            <div style={{padding: '5px', fontSize: '10px', textAlign: 'center'}}>{a.tipo}</div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}


export default Ficha
