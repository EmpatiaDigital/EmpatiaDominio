import React from "react";
import { FaInstagram, FaWhatsapp, FaFacebook } from "react-icons/fa";
import "../style/Footer.css";

export default function Footer() {
  const whatsappNumber = "3413559329";
  const whatsappMessage = encodeURIComponent("Me interesa comunicarme con vos");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-links">
        <a href="#" className="footer-link">
          Nosotros
        </a>
        <a href="/descargo-de-responsabilidad" className="footer-link">
         Descargo de responsabilidad
        </a>
        <a href="#" className="footer-link">
          Regístrate
        </a>
      </div>
      <div className="footer-socials">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label="WhatsApp"
        >
          <FaWhatsapp className="social-icon" />
        </a>
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label="Facebook"
        >
          <FaFacebook className="social-icon" />
        </a>
        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label="Instagram"
        >
          <FaInstagram className="social-icon" />
        </a>
      </div>
      <p className="footer-copy">© {currentYear} Empatia Digital. Todos los derechos reservados.</p>
    </footer>
  );
}
