import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import './Admin.css'

function Admin() {
  const navigate = useNavigate()
  
  // --- ESTADOS ---
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuarioLogueado');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [turnos, setTurnos] = useState([])
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0])
  
  // Estados para Cobrar
  const [modalCobro, setModalCobro] = useState(false)
  const [turnoACobrar, setTurnoACobrar] = useState(null)
  const [catalogo, setCatalogo] = useState([])
  const [seleccionados, setSeleccionados] = useState([]) 
  const [totalCalculado, setTotalCalculado] = useState(0)

  // --- CARGA DE DATOS ---
  const cargarAgenda = () => {
   fetch('https://api-consultorio-usf9.onrender.com/turnos')
      .then(res => res.json())
      .then(data => setTurnos(data))
      .catch(err => console.error("Error agenda:", err))
  }

   useEffect(() => {
   fetch('https://api-consultorio-usf9.onrender.com/tratamientos').then(res => res.json()).then(setCatalogo)
   }, [])

  useEffect(() => {
    if (!usuario) { navigate('/login'); } 
    else if (usuario.rol_id !== 1 && usuario.rol_id !== 2) { navigate('/panel'); } 
    else { cargarAgenda(); }
    // (eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, navigate]) 

  // --- FUNCIONES LOGICAS ---
  const cancelarTurno = (id) => {
    if(!window.confirm("¿Cancelar turno?")) return;
   fetch(`https://api-consultorio-usf9.onrender.com/cancelar-turno/${id}`, { method: 'PUT' })
      .then(() => { cargarAgenda(); })
  }

  const abrirCobro = (turno) => {
      setTurnoACobrar(turno);
      setSeleccionados([]); 
      setTotalCalculado(0);
      setModalCobro(true);
  }

  const toggleTratamiento = (item) => {
      const yaExiste = seleccionados.find(t => t.id === item.id);
      let nuevos = yaExiste ? seleccionados.filter(t => t.id !== item.id) : [...seleccionados, item];
      setSeleccionados(nuevos);
      setTotalCalculado(nuevos.reduce((sum, i) => sum + parseFloat(i.precio), 0));
  }

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('usuarioLogueado');
    navigate('/login');
  }

  // --- PDF ---
  const generarReciboPDF = () => {
    const doc = new jsPDF();
    // (Configuración simplificada del PDF para ahorrar espacio visual, la lógica es la misma)
    doc.text("Recibo de Pago", 14, 20);
    doc.text(`Paciente: ${turnoACobrar.p_nombre}`, 14, 30);
    autoTable(doc, { 
        startY: 40,
        head: [["Servicio", "Precio"]],
        body: seleccionados.map(i => [i.nombre, `$${i.precio}`]),
    });
    doc.save(`Recibo_${turnoACobrar.p_apellido}.pdf`);
  }

  const confirmarCobro = (e) => {
      e.preventDefault();
   fetch('https://api-consultorio-usf9.onrender.com/cobrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ turno_id: turnoACobrar.id, total: totalCalculado, items: seleccionados, notas: 'Admin' })
      }).then(res => {
          if(res.ok) {
              setModalCobro(false);
              generarReciboPDF(); 
              cargarAgenda();
          }
      })
  }

  if (!usuario) return <div className="loading">Cargando...</div>

  const turnosDelDia = turnos.filter(t => t.fecha.startsWith(fechaFiltro));
  const totalHoy = turnosDelDia.filter(t => t.estado !== 'Cancelado').length;

  return (
    <div className="dashboard-layout">
      
      {/* --- SIDEBAR IZQUIERDA (NUEVO) --- */}
      <aside className="sidebar">
        <div className="sidebar-brand">
           <div className="brand-icon">🦷</div>
           <h3>Dr. Saira</h3>
        </div>
        
        <nav className="sidebar-nav">
           <button className="nav-item active">📅 Agenda</button>
           <button onClick={() => navigate('/pacientes')} className="nav-item">👥 Pacientes</button>
           <button onClick={() => navigate('/precios')} className="nav-item">💰 Precios</button>
           <button onClick={() => navigate('/reportes')} className="nav-item">📈 Finanzas</button>
           <button onClick={() => navigate('/configuracion')} className="nav-item">⚙️ Config</button>
        </nav>

        <div className="sidebar-footer">
           <button onClick={cerrarSesion} className="btn-logout-sidebar">Cerrar Sesión ➝</button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL (DERECHA) --- */}
      <main className="main-content">
         
         {/* Top Header */}
         <header className="top-header">
            <h2 className="page-title">Panel de Control</h2>
            <div className="user-profile">
               <span>Hola, Dr/a. {usuario.apellido}</span>
               <div className="avatar-circle">D</div>
            </div>
         </header>

         {/* Área de Trabajo */}
         <div className="content-body">
            
            {/* Filtros y Stats */}
            <div className="controls-row">
               <div className="date-picker-container">
                  <label>Fecha de Agenda:</label>
                  <input type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
               </div>
               <div className="kpi-card">
                  <span className="kpi-value">{totalHoy}</span>
                  <span className="kpi-label">Pacientes Hoy</span>
               </div>
            </div>

            {/* Tabla Moderna Full Width */}
            <div className="table-card">
               <table className="modern-table">
                  <thead>
                     <tr>
                        <th>Hora</th>
                        <th>Paciente</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                     </tr>
                  </thead>
                  <tbody>
                     {turnosDelDia.length === 0 ? (
                        <tr><td colSpan="5" className="empty-state">No hay turnos para esta fecha.</td></tr>
                     ) : (
                        turnosDelDia.map(t => {
                           const yaPago = t.pagos_realizados > 0;
                           const statusColor = t.estado === 'Cancelado' ? 'red' : (t.estado === 'Confirmado' ? 'green' : 'orange');
                           
                           return (
                              <tr key={t.id} className={t.estado === 'Cancelado' ? 'row-canceled' : ''}>
                                 <td className="time-cell">{t.hora.slice(0,5)}</td>
                                 <td className="patient-cell">{t.p_nombre} {t.p_apellido}</td>
                                 <td>{t.motivo_consulta}</td>
                                 <td><span className={`badge badge-${statusColor}`}>{t.estado}</span></td>
                                 <td>
                                    <div className="actions-cell">
                                       {t.estado !== 'Cancelado' && (
                                          yaPago ? <span className="paid-tag">Pagado</span> : 
                                          <button onClick={() => abrirCobro(t)} className="btn-icon btn-pay" title="Cobrar">💵</button>
                                       )}
                                       <button onClick={() => navigate(`/ficha/${t.paciente_id}`)} className="btn-icon btn-view" title="Ver Ficha">📄</button>
                                       {t.estado !== 'Cancelado' && !yaPago && (
                                          <button onClick={() => cancelarTurno(t.id)} className="btn-icon btn-delete" title="Cancelar">✕</button>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                           )
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </main>

      {/* --- MODAL (Misma lógica) --- */}
      {modalCobro && (
         <div className="modal-backdrop">
            <div className="modal-box">
               <h3>Cobrar a {turnoACobrar.p_nombre}</h3>
               <div className="modal-list">
                  {catalogo.map(item => (
                     <label key={item.id} className="modal-item">
                        <input type="checkbox" checked={seleccionados.some(s => s.id === item.id)} onChange={() => toggleTratamiento(item)} />
                        <span>{item.nombre}</span>
                        <b>${item.precio}</b>
                     </label>
                  ))}
               </div>
               <div className="modal-total">Total: ${totalCalculado}</div>
               <div className="modal-buttons">
                  <button onClick={() => setModalCobro(false)} className="btn-cancel">Cancelar</button>
                  <button onClick={confirmarCobro} className="btn-confirm">Cobrar</button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

export default Admin