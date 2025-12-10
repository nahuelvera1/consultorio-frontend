import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import './Reportes.css';

function Reportes() {
  const navigate = useNavigate()
  const [pagos, setPagos] = useState([])
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')

  // Totales calculados
  const [totalHoy, setTotalHoy] = useState(0)
  const [totalMes, setTotalMes] = useState(0)
  const [totalAnio, setTotalAnio] = useState(0)

  // 1. DEFINIMOS LA FUNCIÓN PRIMERO (Para evitar el error)
  const calcularEstadisticas = (listaPagos) => {
    const hoy = new Date().toDateString();
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();

    let sumaHoy = 0;
    let sumaMes = 0;
    let sumaAnio = 0;

    listaPagos.forEach(p => {
        // Truco para evitar problemas de zona horaria
        const fechaPago = new Date(p.fecha_pago); 
        const monto = parseFloat(p.monto);

        // Sumar Hoy
        if (fechaPago.toDateString() === hoy) sumaHoy += monto;

        // Sumar Mes (mismo mes y mismo año)
        if (fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === anioActual) sumaMes += monto;

        // Sumar Año
        if (fechaPago.getFullYear() === anioActual) sumaAnio += monto;
    });

    setTotalHoy(sumaHoy);
    setTotalMes(sumaMes);
    setTotalAnio(sumaAnio);
  }

  // 2. AHORA SÍ EL EFECTO (Ya conoce la función de arriba)
  useEffect(() => {
    fetch('http://localhost:3000/pagos')
      .then(res => res.json())
      .then(data => {
        setPagos(data);
        calcularEstadisticas(data); // Ahora sí funciona
      })
      .catch(err => console.error(err))
  }, [])

  // 3. Filtrar tabla por fechas
  const pagosFiltrados = pagos.filter(p => {
      if (!filtroDesde && !filtroHasta) return true; 
      
      const fecha = new Date(p.fecha_pago).toISOString().split('T')[0];
      const desde = filtroDesde || '2000-01-01';
      const hasta = filtroHasta || '2100-01-01';

      return fecha >= desde && fecha <= hasta;
  });

  const totalBusqueda = pagosFiltrados.reduce((acc, p) => acc + parseFloat(p.monto), 0);

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial', background: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <button onClick={() => navigate('/admin')} style={{cursor:'pointer', padding:'10px', background:'#eee', border:'none', borderRadius:'5px'}}>⬅ Volver al Panel</button>
        <h2 style={{margin:0, color:'#007bff'}}>📈 Reportes Financieros</h2>
      </div>

      {/* DASHBOARD */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px'}}>
          
          <div style={estiloCard}>
              <h3 style={{margin:0, color:'#777', fontSize:'14px'}}>Ganancia HOY</h3>
              <div style={{fontSize:'32px', fontWeight:'bold', color:'#28a745'}}>${totalHoy.toLocaleString()}</div>
          </div>

          <div style={estiloCard}>
              <h3 style={{margin:0, color:'#777', fontSize:'14px'}}>Este MES</h3>
              <div style={{fontSize:'32px', fontWeight:'bold', color:'#007bff'}}>${totalMes.toLocaleString()}</div>
          </div>

          <div style={{...estiloCard, background: '#333', color:'white'}}>
              <h3 style={{margin:0, color:'#ccc', fontSize:'14px'}}>Acumulado AÑO</h3>
              <div style={{fontSize:'32px', fontWeight:'bold'}}>${totalAnio.toLocaleString()}</div>
          </div>

      </div>

      {/* FILTROS */}
      <div style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)', marginBottom:'20px', display:'flex', alignItems:'center', gap:'15px', flexWrap:'wrap'}}>
          <span style={{fontWeight:'bold'}}>📅 Filtrar movimientos:</span>
          <div>
            <span style={{fontSize:'12px', marginRight:'5px'}}>Desde:</span>
            <input type="date" value={filtroDesde} onChange={e=>setFiltroDesde(e.target.value)} style={estiloInput}/>
          </div>
          <div>
            <span style={{fontSize:'12px', marginRight:'5px'}}>Hasta:</span>
            <input type="date" value={filtroHasta} onChange={e=>setFiltroHasta(e.target.value)} style={estiloInput}/>
          </div>
          <div style={{marginLeft:'auto', fontWeight:'bold', fontSize:'18px'}}>
              Total del periodo: <span style={{color:'#28a745'}}>${totalBusqueda.toLocaleString()}</span>
          </div>
      </div>

      {/* TABLA DE MOVIMIENTOS */}
      <div style={{background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead style={{background:'#f8f9fa', color:'#555'}}>
                <tr style={{textAlign:'left'}}>
                    <th style={{padding:'15px'}}>Fecha</th>
                    <th style={{padding:'15px'}}>Paciente</th>
                    <th style={{padding:'15px'}}>Tratamiento / Nota</th>
                    <th style={{padding:'15px'}}>Monto</th>
                </tr>
            </thead>
            <tbody>
                {pagosFiltrados.map(p => (
                    <tr key={p.id} style={{borderBottom:'1px solid #eee'}}>
                        <td style={{padding:'15px'}}>
                            {new Date(p.fecha_pago).toLocaleDateString()} 
                            <small style={{color:'#888', marginLeft:'5px'}}>{new Date(p.fecha_pago).toLocaleTimeString().slice(0,5)}</small>
                        </td>
                        <td style={{padding:'15px', fontWeight:'bold'}}>{p.apellido}, {p.nombre}</td>
                        <td style={{padding:'15px', color:'#555'}}>{p.notas || p.motivo_consulta}</td>
                        <td style={{padding:'15px', fontWeight:'bold', color:'#28a745'}}>${p.monto}</td>
                    </tr>
                ))}
                {pagosFiltrados.length === 0 && <tr><td colSpan="4" style={{padding:'30px', textAlign:'center', color:'#999'}}>No hay movimientos en este rango.</td></tr>}
            </tbody>
        </table>
      </div>

    </div>
  )
}

const estiloCard = { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }
const estiloInput = { padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }

export default Reportes