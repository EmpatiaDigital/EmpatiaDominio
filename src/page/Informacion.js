import React, { useState } from 'react';
import '../style/Informacion.css';
import { useNavigate } from "react-router-dom";


const Informacion = () => {
  const [showModal, setShowModal] = useState(false);

  const scrollToPrivacy = (e) => {
    e.preventDefault();
    const privacySection = document.getElementById('privacy-section');
    if (privacySection) {
      privacySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navigate = useNavigate();
 
const handleInscription = () => {
  navigate("/inscription");
};

  return (
    <div className="informacion-container">
      {/* Header con aviso de privacidad */}
      <div className="privacy-banner">
        <a href="#privacy-section" onClick={scrollToPrivacy} className="privacy-link">
          <svg className="privacy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Uso de Datos Personales
        </a>
      </div>

      {/* Hero Section */}
<section className="hero-section">
  <div className="hero-content">

    {/* Sello de aval / certificación */}
    <div className="hero-badge">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="badge-icon"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
      <span>Certificación Avalada</span>
    </div>

    <h1 className="hero-title">
      Introducción a la Inteligencia Artificial y Cuidados Digitales
    </h1>

    <p className="hero-description">
      Vivimos en una época donde la tecnología avanza rápido, y muchas veces sentimos que quedamos afuera o no entendemos del todo qué está pasando.
    </p>

    <p className="hero-philosophy">
      Este curso nace con una idea simple:{" "}
      <strong>acercar la Inteligencia Artificial a las personas</strong>, sin miedo, sin tecnicismos y con sentido humano.
    </p>

  </div>
</section>
      {/* Course Content */}
      <section className="course-content">
        <div className="content-intro">
          <p className="no-requirements">No necesitás conocimientos previos. Está pensado para público en general, docentes, emprendedores, adultos y cualquier persona que quiera aprender a usar la tecnología con mayor conciencia.</p>
        </div>

        <div className="learning-section">
          <h2 className="section-title">Durante 4 semanas vas a aprender</h2>
          <div className="learning-grid">
            <div className="learning-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3>Fundamentos de IA</h3>
              <p>Qué es realmente la Inteligencia Artificial y cómo está presente en la vida diaria</p>
            </div>

            <div className="learning-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3>Límites y Riesgos</h3>
              <p>Cuáles son los límites reales de la IA y los riesgos a tener en cuenta</p>
            </div>

            <div className="learning-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3>Cuidados Digitales</h3>
              <p>Cómo cuidarte en el mundo digital: estafas, engaños y privacidad</p>
            </div>

            <div className="learning-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3>Uso Consciente</h3>
              <p>Cómo usar la IA como herramienta de apoyo, sin depender de ella</p>
            </div>

            <div className="learning-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>Práctica Real</h3>
              <p>Ejercicios prácticos simples para aplicar en estudio, trabajo o vida cotidiana</p>
            </div>
          </div>
        </div>

        <div className="philosophy-box">
          <p className="philosophy-text">
            El enfoque del curso es <strong>preventivo, educativo y comunitario</strong>: ponemos a la persona en el centro, no a la tecnología.
          </p>
        </div>
      </section>

      {/* Modalidad */}
      <section className="modality-section">
        <h2 className="section-title">Modalidad del Curso</h2>
        <div className="modality-grid">
          <div className="modality-item">
            <span className="modality-label">Duración</span>
            <span className="modality-value">4 semanas</span>
          </div>
          <div className="modality-item">
            <span className="modality-label">Clases</span>
            <span className="modality-value">Martes y Jueves</span>
          </div>
          <div className="modality-item">
            <span className="modality-label">Duración por encuentro</span>
            <span className="modality-value">2 horas</span>
          </div>
          <div className="modality-item">
            <span className="modality-label">Carga total</span>
            <span className="modality-value">24 horas cátedra</span>
          </div>
          <div className="modality-item">
            <span className="modality-label">Modalidad</span>
            <span className="modality-value">Teórico–práctica</span>
          </div>
          <div className="modality-item">
            <span className="modality-label">Nivel</span>
            <span className="modality-value">Introductorio</span>
          </div>
        </div>
        <div className="disclaimer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Carácter: No habilitante profesional</span>
        </div>
      </section>

      {/* Certificación */}
      <section className="certification-section">
        <h2 className="section-title">Certificación</h2>
        <div className="certification-content">
          <div className="certification-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div className="certification-details">
            <h3>Al finalizar el curso se entrega:</h3>

        <div className="certification-list">
  <p className="certificate-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v18m6-12H6"
      />
    </svg>
    Certificado de aprobación
  </p>

  <p className="certificate-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6l7 4-7 4-7-4 7-4z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 10v4c0 2.5 7 5 7 5s7-2.5 7-5v-4"
      />
    </svg>
    Avalado por la Comisión Psicosocial Latinoamericana (ONG)
  </p>

  <p className="certificate-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3l7 4v6c0 5-7 8-7 8s-7-3-7-8V7l7-4z"
      />
    </svg>
    Con sellos, firmas y verificación
  </p>
</div>
      
            <p className="certification-note">
              Este certificado funciona como constancia formal de capacitación y respaldo curricular.
              <strong> No habilita profesionalmente</strong>, pero acredita la formación realizada y suma valor al CV.
            </p>
          </div>
        </div>
      </section>

      {/* Para quién */}
      <section className="audience-section">
        <h2 className="section-title">¿Para quién es este curso?</h2>
        <p className="audience-intro">Este espacio está pensado especialmente para:</p>
        <div className="audience-tags">
          <span className="audience-tag">Personas que quieren entender la IA sin miedo</span>
          <span className="audience-tag">Adultos que desean actualizarse digitalmente</span>
          <span className="audience-tag">Docentes y acompañantes</span>
          <span className="audience-tag">Emprendedores</span>
          <span className="audience-tag">Personas interesadas en el cuidado digital y emocional</span>
        </div>
        <p className="audience-note">
          No se trata de volverse experto, sino de <strong>comprender, cuidarse y tomar mejores decisiones</strong>.
        </p>
      </section>

      {/* Precio y CTA */}
      <section className="pricing-section">
        <div className="pricing-card">
          <h2 className="pricing-title">Inversión en tu Aprendizaje</h2>
          <div className="price-amount">
            <span className="currency">$</span>
            <span className="amount">35.000</span>
          </div>
          <p className="price-description">Valor total por las 4 semanas</p>
        
   <div className="price-includes">

  <p className="price-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
    Todas las clases Online
  </p>

  <p className="price-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v12m6-6H6"
      />
    </svg>
    Material de estudio
  </p>

  <p className="price-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3l7 4v6c0 5-7 8-7 8s-7-3-7-8V7l7-4z"
      />
    </svg>
    Certificación avalada
  </p>
</div>
        
          <button className="cta-button" onClick={handleInscription}>
            Inscribirme Ahora
          </button>
          <p className="limited-spots">Cupos limitados</p>
        </div>
      </section>

      {/* Términos y Condiciones */}
      <section className="privacy-section" id="privacy-section">
        <div className="privacy-container">
          <h2 className="privacy-title">Términos y Condiciones de Uso de Datos Personales</h2>
          
          <div className="privacy-content">
            <div className="privacy-block">
              <h3>1. Recopilación de Datos</h3>
              <p>
                Al inscribirte en el curso "Introducción a la Inteligencia Artificial y Cuidados Digitales", 
                recopilamos información personal que incluye: nombre completo, documento de identidad, 
                dirección de correo electrónico, número de teléfono y cualquier otra información que 
                voluntariamente nos proporciones durante el proceso de inscripción.
              </p>
            </div>

            <div className="privacy-block">
              <h3>2. Uso de la Información</h3>
              <p>Los datos personales recopilados serán utilizados exclusivamente para:</p>
              <p>Gestionar tu inscripción y participación en el curso</p>
              <p>Emitir el certificado de aprobación al finalizar la capacitación</p>
              <p>Comunicarte información relevante sobre el desarrollo del curso</p>
              <p>Enviarte material educativo y recursos relacionados con el programa</p>
              <p>Mantener registros administrativos y estadísticos del curso</p>
            </div>

            <div className="privacy-block">
              <h3>3. Protección de Datos</h3>
              <p>
                Nos comprometemos a proteger tu información personal mediante medidas de seguridad 
                adecuadas para prevenir el acceso no autorizado, la divulgación, alteración o 
                destrucción de tus datos. La información será almacenada de forma segura y solo 
                tendrá acceso el personal autorizado.
              </p>
            </div>

            <div className="privacy-block">
              <h3>4. Compartición de Datos</h3>
              <p>
                Tus datos personales no serán vendidos, alquilados ni compartidos con terceros, 
                excepto en los siguientes casos:
              </p>
              <p>• Cuando sea necesario para la emisión del certificado avalado por la Comisión Psicosocial Latinoamericana</p>
              <p>• Cuando sea requerido por ley o por autoridades competentes</p>
              <p>• Con tu consentimiento expreso previo</p>
            </div>

            <div className="privacy-block">
              <h3>5. Derechos del Usuario</h3>
              <p>Como titular de tus datos personales, tenés derecho a:</p>
              <p>• Acceder a la información que tenemos sobre vos</p>
              <p>• Solicitar la corrección de datos incorrectos o desactualizados</p>
              <p>• Solicitar la eliminación de tus datos personales</p>
              <p>• Oponerte al tratamiento de tus datos para fines específicos</p>
              <p>• Revocar tu consentimiento en cualquier momento</p>
            </div>

            <div className="privacy-block">
              <h3>6. Retención de Datos</h3>
              <p>
                Conservaremos tus datos personales durante el tiempo necesario para cumplir con los 
                fines para los cuales fueron recopilados, incluyendo el período requerido para la 
                emisión y verificación de certificados. Posteriormente, los datos serán archivados 
                o eliminados de forma segura.
              </p>
            </div>

            <div className="privacy-block">
              <h3>7. Comunicaciones</h3>
              <p>
                Al inscribirte, aceptás recibir comunicaciones relacionadas con el curso a través de 
                correo electrónico, WhatsApp u otros medios de contacto proporcionados. Podés 
                solicitar dejar de recibir comunicaciones promocionales en cualquier momento.
              </p>
            </div>

            <div className="privacy-block">
              <h3>8. Cookies y Tecnologías Similares</h3>
              <p>
                Nuestro sitio web puede utilizar cookies y tecnologías similares para mejorar tu 
                experiencia de navegación. Podés configurar tu navegador para rechazar las cookies, 
                aunque esto puede afectar algunas funcionalidades del sitio.
              </p>
            </div>

            <div className="privacy-block">
              <h3>9. Menores de Edad</h3>
              <p>
                Este curso está dirigido a personas mayores de 18 años. Si sos menor de edad, 
                necesitás el consentimiento de un padre, madre o tutor legal para participar.
              </p>
            </div>

            <div className="privacy-block">
              <h3>10. Modificaciones</h3>
              <p>
                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. 
                Las modificaciones entrarán en vigor una vez publicadas en nuestro sitio web. Te 
                recomendamos revisar periódicamente esta sección.
              </p>
            </div>

            <div className="privacy-block">
              <h3>11. Consentimiento</h3>
              <p>
                Al inscribirte en el curso, declarás haber leído, comprendido y aceptado estos 
                Términos y Condiciones de Uso de Datos Personales.
              </p>
            </div>

            <div className="privacy-block">
              <h3>12. Contacto</h3>
              <p>
                Para ejercer tus derechos o realizar consultas sobre el tratamiento de tus datos 
                personales, podés contactarnos a través de los siguientes medios:
              </p>
             <p>
     • Email:{" "}
      <a className="linkCel" href="mailto:empatiadigital2025@gmail.com">
          empatiadigital2025@gmail.com
      </a>
     </p>
     <p>
    • Teléfono:{" "}
      <a className="linkCel"
      href="https://wa.me/5493413559329"
      target="_blank"
      rel="noopener noreferrer" >
          +54 3413 55-9329
      </a>
     </p>
    </div>

            <div className="privacy-footer">
              <p>Última actualización: Febrero 2026</p>
              <p>Empatía Digital</p>
            </div>
          </div>
        </div>
      </section>

      {/* Botón flotante de inscripción */}
      <button className="floating-inscription-btn" onClick={handleInscription}>
        Inscribirme
      </button>
    </div>
  );
};

export default Informacion;
