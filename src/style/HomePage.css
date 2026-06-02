@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

/* =============================================
   BASE
   ============================================= */
* {
  box-sizing: border-box;
}

html {
  font-family: 'DM Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

main {
  flex-grow: 1;
}

/* =============================================
   HOMEPAGE WRAPPER
   ============================================= */
.homepage {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f2f5fa;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}

/* =============================================
   CAROUSEL
   ============================================= */
.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 540px;
  overflow: hidden;
  background: #1e3a5f;
}

.carousel-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
  z-index: 0;
}

.carousel-image.active {
  opacity: 1;
  z-index: 1;
}

/* Overlay gradiente editorial — más oscuro en la parte inferior-izquierda donde va el texto */
.carousel-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(to right, rgba(13, 35, 70, 0.82) 0%, rgba(13, 35, 70, 0.3) 60%, transparent 100%),
    linear-gradient(to top, rgba(13, 35, 70, 0.6) 0%, transparent 50%);
  pointer-events: none;
}

/* Botones prev/next */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.25s, border-color 0.25s;
  backdrop-filter: blur(4px);
}

.carousel-btn:hover {
  background: rgba(74, 144, 217, 0.5);
  border-color: rgba(107, 179, 240, 0.6);
}

.carousel-btn.left {
  left: 24px;
}

.carousel-btn.right {
  right: 24px;
}

/* Dots — líneas horizontales modernas */
.carousel-dots {
  position: absolute;
  bottom: 28px;
  right: 48px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 10;
}

.carousel-dots .dot {
  display: inline-block;
  width: 24px;
  height: 3px;
  background: rgba(255, 255, 255, 0.28);
  border-radius: 2px;
  cursor: pointer;
  border: none;
  padding: 0;
  transition: background 0.3s, width 0.3s;
}

.carousel-dots .dot.active {
  background: #6bb3f0;
  width: 40px;
}

/* Contenido del overlay — texto sobre el carrusel */
.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  padding: 0 56px 52px;
  max-width: 700px;
}

/* Eyebrow tag encima del título */
.overlay::before {
  content: 'Comunidad · Familia · Tecnología';
  display: block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #6bb3f0;
  margin-bottom: 14px;
  border-left: 2px solid #6bb3f0;
  padding-left: 10px;
}

.overlay h1 {
  font-family: 'Playfair Display', Georgia, serif;
  color: #fff;
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.5px;
  margin: 0 0 24px;
  text-shadow: none;
}

/* Botón CTA del carrusel */
.overlay .btn-ver-mas {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 13px 26px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: none;
}

.overlay .btn-ver-mas:hover {
  background: #1e3a5f;
}

/* =============================================
   POSTS SECTION
   ============================================= */
.posts-section {
  padding: 64px 48px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Encabezado de sección */
.posts-section > div:first-child {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1px solid #d0daea;
  padding-bottom: 16px;
  margin-bottom: 40px;
  text-align: left;
}

.titulo-principal {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
  letter-spacing: -0.2px;
  text-transform: none;
  border-bottom: none;
  padding-bottom: 0;
  display: block;
}

/* Eyebrow encima del titulo principal */
.titulo-principal::before {
  content: 'Blog';
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #4a90d9;
  margin-bottom: 4px;
}

/* =============================================
   GRID DE POSTS
   ============================================= */
.lista-posts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  padding: 0;
  max-width: none;
  margin: 0;
}

/* =============================================
   TARJETA POST
   ============================================= */
.post-card {
  position: relative;
  border-radius: 8px;
  background: #fff;
  height: auto;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0;
  box-shadow: none;
  border: 1px solid #e0e8f2;
  cursor: pointer;
  transition: box-shadow 0.25s, transform 0.25s;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 36px rgba(30, 58, 95, 0.13);
}

/* Primera card — destacada, ocupa 2 columnas */
.post-card:first-child {
  grid-column: span 2;
  min-height: 320px;
}

/* Badge de categoría sobre la imagen */
.post-card-category-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(13, 35, 70, 0.78);
  color: #6bb3f0;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 3px;
  backdrop-filter: blur(4px);
  z-index: 3;
}

/* Overlay de contenido — gradiente desde abajo */
.post-content-overlay-home {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(10, 25, 55, 0.92) 0%, rgba(10, 25, 55, 0.55) 45%, rgba(10, 25, 55, 0.0) 100%);
  color: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 18px 20px;
  gap: 10px;
}

/* Avatar */
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

/* Fila de meta (avatar + autor) */
.post-content-overlay-home > img.avatar {
  position: absolute;
  top: 14px;
  left: 14px;
}

/* Título */
h3 {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.post-card:first-child h3 {
  font-size: 1.45rem;
}

/* Autor */
.autor {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.3px;
  color: rgba(255, 255, 255, 0.72) !important;
  margin: 0;
  text-shadow: none;
}

.autor-div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* Divisor sutil entre texto y botón */
.post-content-overlay-home > div:last-child {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 10px;
  margin-top: 2px;
}

/* Botón "Ver más" dentro de las cards */
.btn-ver-mas {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: background 0.2s, border-color 0.2s;
  backdrop-filter: blur(4px);
  box-shadow: none;
}

.btn-ver-mas:hover {
  background: rgba(74, 144, 217, 0.55);
  border-color: rgba(107, 179, 240, 0.6);
}

/* =============================================
   SKELETON / LOADING STATE
   ============================================= */
p {
  text-align: center;
  color: #6b7a90;
  padding: 40px;
  font-size: 14px;
}

/* =============================================
   MISCELÁNEOS HEREDADOS
   ============================================= */
.preview-portada {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  margin: 10px 0;
  border-radius: 6px;
}

.imagenes-epigrafes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.image-block {
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-block img {
  width: 100%;
  border-radius: 6px;
  max-height: 150px;
  object-fit: cover;
}

.epigrafe-text {
  font-size: 0.78rem;
  color: #7a8fa6;
  margin-top: 5px;
  text-align: center;
}

/* =============================================
   RESPONSIVE — TABLET (≤991px)
   ============================================= */
@media (max-width: 991px) {
  .carousel-wrapper {
    height: 460px;
  }

  .overlay {
    padding: 0 36px 44px;
    max-width: 100%;
  }

  .overlay h1 {
    font-size: 2.4rem;
  }

  .carousel-dots {
    right: 36px;
    bottom: 20px;
  }

  .posts-section {
    padding: 48px 32px;
  }

  .lista-posts-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }

  /* En tablet la card destacada sigue siendo ancha */
  .post-card:first-child {
    grid-column: span 2;
    min-height: 280px;
  }

  .titulo-principal {
    font-size: 1.6rem;
  }
}

/* =============================================
   RESPONSIVE — MOBILE (≤600px)
   ============================================= */
@media (max-width: 600px) {
  .carousel-wrapper {
    height: 400px;
  }

  .overlay {
    padding: 0 20px 36px;
    max-width: 100%;
  }

  .overlay::before {
    display: none;
  }

  .overlay h1 {
    font-size: 1.75rem;
    margin-bottom: 18px;
  }

  .overlay .btn-ver-mas {
    padding: 11px 20px;
    font-size: 12px;
  }

  .carousel-btn {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }

  .carousel-btn.left  { left: 12px; }
  .carousel-btn.right { right: 12px; }

  .carousel-dots {
    right: 50%;
    transform: translateX(50%);
    bottom: 16px;
  }

  .posts-section {
    padding: 36px 16px;
  }

  .posts-section > div:first-child {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .titulo-principal {
    font-size: 1.4rem;
  }

  .lista-posts-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* En móvil la card destacada ocupa 1 columna */
  .post-card:first-child {
    grid-column: span 1;
    min-height: 240px;
  }

  .post-card {
    min-height: 220px;
  }

  h3 {
    font-size: 1rem;
  }

  .post-card:first-child h3 {
    font-size: 1.1rem;
  }

  .avatar {
    width: 26px;
    height: 26px;
  }

  .btn-ver-mas {
    padding: 6px 14px;
    font-size: 11px;
  }
}

/* =============================================
   RESPONSIVE — MOBILE PEQUEÑO (≤380px)
   ============================================= */
@media (max-width: 380px) {
  .overlay h1 {
    font-size: 1.5rem;
  }

  .carousel-wrapper {
    height: 360px;
  }

  .posts-section {
    padding: 28px 12px;
  }
}
