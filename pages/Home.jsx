import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// Puedes instalar react-icons si quieres iconos SVG: npm install react-icons
// O usar emojis/imágenes como hago aquí para que funcione directo.

function Home() {
  return (
    <div className="main-wrapper">
      
      {/* --- TOPBAR: Redes y Contacto Rápido --- */}
      <div className="topbar">
        <div className="container top-inner">
          <div className="top-left">
            <span>📍 Av. Maipú 675, Tucumán</span>
            <span className="separator">|</span>
            <span>🕒 Lun a Vie: 8:00 - 20:00</span>
          </div>
          <div className="top-right">
            <a href="https://wa.me/5493816517865" target="_blank" rel="noreferrer" className="top-social">
              <i className="fab fa-whatsapp"></i> WhatsApp
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="top-social">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="top-social">
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <div className="container nav-inner">
          <Link to="/" className="brand">
            <div className="logo-icon">🦷</div>
            <div className="brand-text">
              <span className="brand-title">Consultorio</span>
              <span className="brand-name">Dr. Saira</span>
            </div>
          </Link>

          <div className="nav-links">
            <a href="#servicios">Tratamientos</a>
            <a href="#nosotros">Especialistas</a>
            <a href="#ubicacion">Ubicación</a>
            {/* Botones de Acción */}
            <div className="auth-buttons">
                <Link to="/login" className="btn-login">Ingresar</Link>
                <Link to="/registro" className="btn-register">Turnos Online</Link>
            </div>
          </div>

          {/* Menú Móvil (Hamburguesa - Solo visual por ahora) */}
          <div className="mobile-menu-icon">☰</div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="hero-section">
        <div className="container hero-container">
            <div className="hero-card">
                <h1>Tu sonrisa, <br/> <span className="text-highlight">nuestra pasión.</span></h1>
                <p>
                    Odontología integral de vanguardia en un ambiente relajado y seguro. 
                    Recupera la confianza en tu sonrisa hoy mismo.
                </p>
                <div className="hero-btns">
                    <a href="#contacto" className="btn btn-primary">Agendar Cita</a>
                    <a href="#servicios" className="btn btn-outline">Ver Servicios</a>
                </div>
                
                {/* Badges de confianza */}
                <div className="trust-badges">
                    <div className="badge">⭐ +15 Años de Exp.</div>
                    <div className="badge">🏥 Tecnología 3D</div>
                </div>
            </div>
        </div>
      </header>

      {/* --- SERVICIOS DESTACADOS --- */}
      <section id="servicios" className="section-padding bg-gray">
        <div className="container">
            <div className="section-title text-center">
                <h2>Nuestras Especialidades</h2>
                <div className="divider"></div>
                <p>Tratamientos personalizados para cada miembro de la familia.</p>
            </div>
            
            <div className="services-grid">
                {/* Card 1 */}
                <div className="service-card">
                    <div className="card-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=2070&auto=format&fit=crop')"}}></div>
                    <div className="card-content">
                        <h3>Ortodoncia Invisible</h3>
                        <p>Alinea tus dientes sin que nadie lo note. Tecnología Invisalign y brackets estéticos.</p>
                        <a href="#" className="read-more">Saber más ➝</a>
                    </div>
                </div>

                {/* Card 2 */}
        <div className="service-card">
          <div className="card-image" style={{backgroundImage: "url('/hero/saira-ia-atendiendo.png')"}}></div>
                    <div className="card-content">
                        <h3>Implantes Dentales</h3>
                        <p>Recupera la funcionalidad y estética completa con implantes de titanio de alta gama.</p>
                        <a href="#" className="read-more">Saber más ➝</a>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="service-card">
                    <div className="card-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop')"}}></div>
                    <div className="card-content">
                        <h3>Estética Dental</h3>
                        <p>Diseño de sonrisa digital, carillas y blanqueamiento láser en una sola sesión.</p>
                        <a href="#" className="read-more">Saber más ➝</a>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- POR QUÉ ELEGIRNOS (Info extra) --- */}
      <section className="section-padding info-section">
        <div className="container split-container">
            <div className="info-text">
                <h2>Experiencia y Tecnología</h2>
                <p>En Consultorio Dr. Saira entendemos que visitar al dentista puede generar ansiedad. Por eso hemos diseñado nuestra clínica para que te sientas como en casa.</p>
                <ul className="feature-list">
                    <li>✅ <strong>Profesionales Especializados:</strong> Un equipo para cada necesidad.</li>
                    <li>✅ <strong>Equipamiento Digital:</strong> Escáner intraoral y radiografía digital.</li>
                    <li>✅ <strong>Financiación:</strong> Aceptamos todas las obras sociales y tarjetas.</li>
                </ul>
            </div>
            <div className="info-image">
                <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop" alt="Consultorio Moderno" />
            </div>
        </div>
      </section>

      {/* --- UBICACIÓN --- */}
      <section id="ubicacion" className="map-section">
        <iframe 
            title="mapa"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3560.1060679461427!2d-65.20720192496556!3d-26.836578076692697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225d3ad7f30f1d%3A0xf8606cd659b24396!2sSan%20Miguel%20de%20Tucum%C3%A1n%2C%20Tucum%C3%A1n!5e0!3m2!1ses!2sar!4v1715000000000!5m2!1ses!2sar" 
            width="100%" 
            height="450" 
            style={{border:0}} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
        </iframe>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contacto" className="footer">
        <div className="container footer-content">
            <div className="footer-brand">
                <h3>Dr. Saira</h3>
                <p>Tu salud bucal en las mejores manos.</p>
                <div className="footer-socials">
                    <a href="#" className="social-circle">IG</a>
                    <a href="#" className="social-circle">FB</a>
                    <a href="#" className="social-circle">WA</a>
                </div>
            </div>
            <div className="footer-links">
                <h4>Enlaces</h4>
                <ul>
                    <li><a href="#">Inicio</a></li>
                    <li><a href="#">Especialidades</a></li>
                    <li><a href="#">Staff Médico</a></li>
                    <li><a href="#">Contacto</a></li>
                </ul>
            </div>
            <div className="footer-contact">
                <h4>Contacto</h4>
                <p>📍 Maipú 675, San Miguel de Tucumán</p>
                <p>📞 (381) 651-7865</p>
                <p>✉️ info@drsaira.com.ar</p>
            </div>
        </div>
        <div className="footer-bottom">
            © {new Date().getFullYear()} Consultorio Dr. Saira. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default Home;