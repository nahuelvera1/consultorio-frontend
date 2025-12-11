import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import './Panel.css';

function Panel() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuarioLogueado');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [misTurnos, setMisTurnos] = useState([])
  const [dentistas, setDentistas] = useState([])
  const [horariosLibres, setHorariosLibres] = useState([])

  const [nuevoTurno, setNuevoTurno] = useState({
    dentista_id: '', fecha: '', hora: '', motivo: '', tipo: ''
  })

  // Estado para el modal de cancelación
  const [modalVisible, setModalVisible] = useState(false)
  const [turnoParaCancelar, setTurnoParaCancelar] = useState(null)

  // NUEVO: Estado para mostrar/ocultar el historial
  const [verHistorial, setVerHistorial] = useState(false)

  const TELEFONO_DENTISTA = "5493815555555"; 

  // --- FUNCIONES AUXILIARES ---
  const esTurnoFuturo = (fecha, hora) => {
    if (!fecha || !hora) return false;
    const fechaTurno = new Date(`${fecha.split('T')[0]}T${hora}`);
    return fechaTurno > new Date(); 
  };

  // --- LÓGICA DE FILTRADO ---
  // 1. Turnos Futuros (Programados)
  const turnosFuturos = misTurnos.filter(t => esTurnoFuturo(t.fecha, t.hora));

  // 2. Historial (Pasados): Filtramos los viejos y tomamos SOLO LOS PRIMEROS 10
  const historial = misTurnos
    .filter(t => !esTurnoFuturo(t.fecha, t.hora))
    .slice(0, 10); // <--- AQUÍ ESTÁ EL LÍMITE DE 10

  // 3. Bloqueo si ya tiene uno futuro activo
  const tieneTurnoPendiente = misTurnos.some(t => 
    esTurnoFuturo(t.fecha, t.hora) && t.estado !== 'Cancelado'
  );

  // --- CARGAS ---
  const cargarMisTurnos = (id) => {
  fetch(`https://api-consultorio-usf9.onrender.com/turnos-paciente/${id}`).then(res => res.json()).then(setMisTurnos)
  }
  const cargarDentistas = () => {
  fetch('https://api-consultorio-usf9.onrender.com/usuarios').then(res => res.json()).then(data => setDentistas(data.filter(u => u.rol_id === 2)))
  }

  useEffect(() => {
    if (!usuario) navigate('/login'); else { cargarMisTurnos(usuario.id); cargarDentistas(); }
  }, [usuario, navigate]) 

  useEffect(() => {
    if (nuevoTurno.dentista_id && nuevoTurno.fecha) {
  fetch(`https://api-consultorio-usf9.onrender.com/horarios-disponibles?fecha=${nuevoTurno.fecha}&dentista_id=${nuevoTurno.dentista_id}`)
            .then(res => res.json()).then(setHorariosLibres)
    }
  }, [nuevoTurno.dentista_id, nuevoTurno.fecha])

  const handleReservar = (e) => {
    e.preventDefault();
    if(!nuevoTurno.hora) return alert("Selecciona un horario.");
    const motivoCompleto = `[${nuevoTurno.tipo}] ${nuevoTurno.motivo}`;
  fetch('https://api-consultorio-usf9.onrender.com/crear-turno', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente_id: usuario.id, dentista_id: nuevoTurno.dentista_id, fecha: nuevoTurno.fecha, hora: nuevoTurno.hora, motivo_consulta: motivoCompleto })
    }).then(res => {
        if(res.ok) { alert("✅ Turno confirmado."); cargarMisTurnos(usuario.id); setNuevoTurno({ dentista_id: '', fecha: '', hora: '', motivo: '', tipo: '' }); setHorariosLibres([]); }
    })
  }

  const abrirModalCancelar = (turno) => { setTurnoParaCancelar(turno); setModalVisible(true); }
  const confirmarCancelacion = () => {
    if (!turnoParaCancelar) return;
  fetch(`https://api-consultorio-usf9.onrender.com/cancelar-turno/${turnoParaCancelar.id}`, { method: 'PUT' }).then(() => { cargarMisTurnos(usuario.id); setModalVisible(false); setTurnoParaCancelar(null); })
  }

  const handleReconfirmar = (turno) => {
    const textoWsp = `Hola, soy ${usuario.nombre}. Confirmo asistencia a mi turno de HOY ${turno.hora.slice(0,5)}.`;
    window.open(`https://wa.me/${TELEFONO_DENTISTA}?text=${encodeURIComponent(textoWsp)}`, '_blank');
  }

  const cerrarSesion = () => { setUsuario(null); localStorage.removeItem('usuarioLogueado'); navigate('/login'); }

  if (!usuario) return <p>Cargando...</p>

  const turnoDeHoy = turnosFuturos.find(t => {
    const esHoy = new Date().toDateString() === new Date(`${t.fecha.split('T')[0]}T${t.hora}`).toDateString();
    return esHoy && t.estado === 'Confirmado';
  });

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      
      {modalVisible && (
        <div style={estiloOverlay}>
            <div style={estiloModal}>
                <h3>⚠️ Cancelar Turno</h3>
                <p>¿Confirmas la cancelación?</p>
                <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                    <button onClick={() => setModalVisible(false)}>Volver</button>
                    <button onClick={confirmarCancelacion} style={{background:'#dc3545', color:'white'}}>Sí, Cancelar</button>
                </div>
            </div>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Hola, {usuario.nombre} 👋</h2>
        <button onClick={cerrarSesion} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px', borderRadius: '5px' }}>Salir</button>
      </header>

      {turnoDeHoy && (
        <div style={{ background: '#d4edda', border: '2px solid #28a745', color: '#155724', padding: '20px', borderRadius: '10px', marginBottom: '30px', textAlign: 'center' }}>
            <h2>🔔 Tienes un turno HOY a las {turnoDeHoy.hora.slice(0,5)}</h2>
            <button onClick={() => handleReconfirmar(turnoDeHoy)} style={{ padding: '10px', background: '#25D366', color: 'white', border: 'none', borderRadius: '20px', cursor:'pointer' }}>Confirmar Asistencia</button>
        </div>
      )}

      {/* FORMULARIO O BLOQUEO */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3 style={{marginTop:0}}>📅 Nuevo Turno</h3>
        
        {tieneTurnoPendiente ? (
            <div style={{textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px', color: '#666'}}>
                <div style={{fontSize: '40px', marginBottom: '10px'}}>🚫</div>
                <h4 style={{margin: '0 0 10px 0'}}>Ya tienes un turno programado</h4>
                <p>No puedes solicitar otro hasta que asistas o canceles el actual.</p>
            </div>
        ) : (
            <form onSubmit={handleReservar} style={{ display: 'grid', gap: '15px' }}>
                <select value={nuevoTurno.dentista_id} onChange={e => setNuevoTurno({...nuevoTurno, dentista_id: e.target.value})} required style={estiloInput}>
                    <option value="">Seleccionar Doctor...</option>
                    {dentistas.map(d => <option key={d.id} value={d.id}>Dr. {d.apellido}</option>)}
                </select>
                <input type="date" min={new Date().toLocaleDateString('en-CA')} value={nuevoTurno.fecha} onChange={e => setNuevoTurno({...nuevoTurno, fecha: e.target.value, hora: ''})} required style={estiloInput} />
                {nuevoTurno.fecha && (
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        {horariosLibres.map(h => <button key={h} type="button" onClick={() => setNuevoTurno({...nuevoTurno, hora: h})} style={{padding:'5px', background: nuevoTurno.hora===h?'blue':'white', color:nuevoTurno.hora===h?'white':'blue', border:'1px solid blue', borderRadius:'3px', cursor:'pointer'}}>{h.slice(0,5)}</button>)}
                    </div>
                )}
                <select value={nuevoTurno.tipo} onChange={e => setNuevoTurno({...nuevoTurno, tipo: e.target.value})} required style={estiloInput}>
                    <option value="">Tipo...</option><option>Consulta</option><option>Tratamiento</option>
                </select>
                <input placeholder="Motivo" value={nuevoTurno.motivo} onChange={e => setNuevoTurno({...nuevoTurno, motivo: e.target.value})} required style={estiloInput} />
                <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius:'5px', cursor:'pointer' }}>CONFIRMAR</button>
            </form>
        )}
      </div>

      {/* --- LISTA DE TURNOS FUTUROS (SIEMPRE VISIBLE) --- */}
      <h3>Mis Turnos Programados</h3>
      {turnosFuturos.length === 0 ? (
          <p style={{color: '#777', fontStyle:'italic'}}>No tienes turnos próximos.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }}>
            <thead style={{ background: '#333', color: 'white' }}>
                <tr><th>Fecha</th><th>Hora</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
                {turnosFuturos.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <td style={{ padding: '10px' }}>{t.fecha.split('T')[0]}</td>
                    <td style={{ padding: '10px' }}>{t.hora.slice(0,5)}</td>
                    <td style={{ padding: '10px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', background: t.estado==='Cancelado'?'#ffebee':'#d4edda', color: t.estado==='Cancelado'?'#c62828':'#155724' }}>{t.estado}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                        {t.estado !== 'Cancelado' && <button onClick={() => abrirModalCancelar(t)} style={{color:'red', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}>X</button>}
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
      )}

      {/* --- SECCIÓN HISTORIAL DESPLEGABLE --- */}
      <div style={{marginTop: '40px'}}>
          <button 
            onClick={() => setVerHistorial(!verHistorial)} 
            style={{background:'none', border:'none', color:'#555', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'16px', fontWeight:'bold'}}
          >
              {verHistorial ? '▼ Ocultar Historial' : '▶ Ver Historial Anterior'}
          </button>

          {verHistorial && (
            <div style={{marginTop: '10px', opacity: verHistorial ? 1 : 0, transition: 'opacity 0.3s'}}>
                {historial.length === 0 ? (
                    <p style={{color: '#999', marginLeft:'20px'}}>No hay historial disponible.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f9f9f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <thead><tr style={{background:'#eee', color:'#777'}}><th>Fecha</th><th>Hora</th><th>Estado</th></tr></thead>
                        <tbody>
                            {historial.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #e0e0e0', textAlign: 'center', color: '#888' }}>
                                <td style={{ padding: '10px' }}>{t.fecha.split('T')[0]}</td>
                                <td style={{ padding: '10px' }}>{t.hora.slice(0,5)}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '10px', fontSize: '11px', background: '#eee' }}>{t.estado}</span>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {/* Nota aclaratoria */}
                <p style={{textAlign:'center', fontSize:'12px', color:'#aaa', marginTop:'5px'}}>* Mostrando los últimos 10 registros pasados.</p>
            </div>
          )}
      </div>

    </div>
  )
}

const estiloOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
const estiloModal = { background: 'white', padding: '30px', borderRadius: '10px', width: '300px', textAlign: 'center' }
const estiloInput = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }
export default Panel