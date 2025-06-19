import React from "react";
import { Mail, Phone, MessageCircle, UserPlus } from "lucide-react";
import "../style/ContactSection.css";
import contactImage from "../assets/familiaEMPATIA.jpg"; // Ajusta la ruta si hace falta

export default function ContactSection() {
  return (
    <section className="contact-section">
      <div className="contact-container">
        <div className="contact-text">
          <h2>¿Por qué contactarnos?</h2>
          <p>
            En <strong>Empatía Digital</strong> acompañamos el camino hacia una
            salud digital consciente en tiempos de inteligencia artificial. Como
            acompañante terapéutico formado en la Universidad Nacional de
            Rosario, ofrezco un espacio de escucha, contención y apoyo desde una
            mirada práctica y respetuosa, sin pretender diagnosticar ni
            sustituir roles clínicos.
          </p>
          <p>
            Contactarnos significa abrir un diálogo sincero para compartir
            inquietudes, encontrar herramientas y construir juntos estrategias
            que ayuden a cuidar el bienestar digital en el día a día. Tu
            experiencia y tu voz son el centro de este proceso.
          </p>

          <div className="contact-list">
            <div className="line"></div>
            <ul>
              <li>
                <MessageCircle className="icon" />
                <a
                  href="https://wa.me/5493411234567"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar WhatsApp
                </a>
              </li>
              <li>
                <Mail className="icon" />
                <a href="mailto:empatiadigital2025@gmail.com">
                  empatiadigital2025@gmail.com
                </a>
              </li>

              <li>
                <UserPlus className="icon" />
                <a href="/registro">Suscribite</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="contact-image">
          <img src={contactImage} alt="Contacto Empatía Digital" />
        </div>
      </div>
    </section>
  );
}
