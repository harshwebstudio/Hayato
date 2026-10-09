/* =========================================================
   YOUR DETAILING BRAND — interactions and optional 3D scene
   Set your WhatsApp number in BUSINESS SETTINGS.
========================================================= */
(() => {
  "use strict";

  // BUSINESS SETTINGS — edit these before publishing.
  // Country code + number, digits only. Example: 919876543210
  const BUSINESS = {
    name: "YOUR DETAILING BRAND",
    whatsappNumber: "91XXXXXXXXXX",
    defaultMessage: "Hi, I'd like to enquire about your car detailing services."
  };

  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");
  const scrollProgress = document.getElementById("scrollProgress");
  const enquiryForm = document.getElementById("enquiryForm");
  const whatsappFloat = document.getElementById("whatsappFloat");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js-ready");
  document.getElementById("year").textContent = new Date().getFullYear();

  // Mobile navigation.
  function closeMenu() {
    if (!menuToggle || !primaryNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    primaryNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Open navigation menu" : "Close navigation menu"
      );
      primaryNav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    primaryNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 800) closeMenu();
    });
  }

  // Reading progress indicator.
  function updateProgress() {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress = scrollable > 0
      ? (window.scrollY / scrollable) * 100
      : 0;

    if (scrollProgress) {
      scrollProgress.style.width =
        `${Math.min(100, Math.max(0, progress))}%`;
    }
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // Reveal sections while scrolling.
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    });

    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // WhatsApp configuration and link builder.
  function isWhatsAppConfigured() {
    return /^\d{10,15}$/.test(BUSINESS.whatsappNumber) &&
      !BUSINESS.whatsappNumber.includes("X");
  }

  function openWhatsApp(message) {
    if (!isWhatsAppConfigured()) {
      alert("Please configure BUSINESS.whatsappNumber in script.js before using WhatsApp links.");
      return;
    }

    const url =
      `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (whatsappFloat) {
    whatsappFloat.addEventListener("click", event => {
      event.preventDefault();
      openWhatsApp(BUSINESS.defaultMessage);
    });
  }

   // Preselect a service/package when the visitor clicks its enquiry link.
  document.querySelectorAll("[data-service], [data-package]").forEach(link => {
    link.addEventListener("click", () => {
      const chosen = link.dataset.service || link.dataset.package;
      const select = document.getElementById("serviceChoice");

      if (select && chosen) {
        const matchingOption = Array.from(select.options).find(option =>
          option.value === chosen ||
          option.textContent.trim() === chosen
        );

        if (matchingOption) {
          select.value = matchingOption.value;
        } else {
          const custom = document.createElement("option");
          custom.value = chosen;
          custom.textContent = chosen;
          select.appendChild(custom);
          select.value = chosen;
        }
      }
    });
  });

  // The form sends the enquiry to WhatsApp; it does not save to a database.
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!enquiryForm.reportValidity()) return;

      const formData = new FormData(enquiryForm);
      const name = String(formData.get("name") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const vehicle = String(formData.get("vehicle") || "").trim();
      const service = String(formData.get("service") || "").trim();
      const message = String(formData.get("message") || "").trim();

      const lines = [
        `Hi ${BUSINESS.name}, I'd like to enquire about car detailing.`,
        `Name: ${name}`,
        phone ? `Phone: ${phone}` : "",
        `Vehicle: ${vehicle}`,
        `Interested in: ${service}`,
        message ? `Additional details: ${message}` : ""
      ].filter(Boolean);

      openWhatsApp(lines.join("\n"));
    });
  }

  // Gentle 3D tilt on desktop pointer devices.
  const heroVisual = document.getElementById("heroVisual");
  const heroImageWrap = heroVisual?.querySelector(".hero-image-wrap");
  const pointerFine =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (heroVisual && heroImageWrap && pointerFine && !reduceMotion) {
    heroVisual.addEventListener("pointermove", event => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      heroImageWrap.style.transform =
        `rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
    });

    heroVisual.addEventListener("pointerleave", () => {
      heroImageWrap.style.transform = "";
    });
  }

  // Optional Three.js scene. The car image remains as a fallback.
  function initThreeScene() {
    if (reduceMotion || !window.THREE || !heroVisual) return;

    try {
      const THREE = window.THREE;
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        38,
        heroVisual.clientWidth / heroVisual.clientHeight,
        0.1,
        100
      );

      camera.position.set(0, 0, 7);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
      );
      renderer.setSize(heroVisual.clientWidth, heroVisual.clientHeight);
      renderer.domElement.id = "threeScene";
      renderer.domElement.setAttribute("aria-hidden", "true");

      heroVisual.appendChild(renderer.domElement);
      heroVisual.classList.add("has-3d");

      const group = new THREE.Group();
      scene.add(group);

      const wireGeometry = new THREE.IcosahedronGeometry(1.35, 1);
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x61e6ff,
        wireframe: true,
        transparent: true,
        opacity: 0.19
      });

      const wireSphere = new THREE.Mesh(wireGeometry, wireMaterial);
      wireSphere.position.set(1.35, 0.05, -0.9);
      group.add(wireSphere);

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b79ff,
        wireframe: true,
        transparent: true,
        opacity: 0.28
      });

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.65, 0.008, 8, 120),
        ringMaterial
      );

      ring.position.set(0.9, 0.05, -0.7);
      ring.rotation.set(0.7, 0.2, -0.35);
      group.add(ring);
      const points = [];

      for (let i = 0; i < 100; i++) {
        const a = (i / 100) * Math.PI * 2;
        const r = 1.85 + Math.sin(i * 3.4) * 0.06;

        points.push(
          new THREE.Vector3(
            Math.cos(a) * r,
            Math.sin(a) * r * 0.55,
            -1.15
          )
        );
      }

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

      const line = new THREE.LineLoop(
        lineGeometry,
        new THREE.LineBasicMaterial({
          color: 0x61e6ff,
          transparent: true,
          opacity: 0.2
        })
      );

      line.position.set(0.8, 0, 0);
      group.add(line);

      let animationId;
      let pointerX = 0;
      let pointerY = 0;

      const onPointerMove = event => {
        const rect = heroVisual.getBoundingClientRect();

        pointerX =
          ((event.clientX - rect.left) / rect.width - 0.5) * 0.2;

        pointerY =
          ((event.clientY - rect.top) / rect.height - 0.5) * 0.15;
      };

      if (pointerFine) {
        heroVisual.addEventListener("pointermove", onPointerMove);
      }

      const animate = () => {
        animationId = requestAnimationFrame(animate);

        group.rotation.y += 0.0015;
        wireSphere.rotation.x += 0.0012;
        wireSphere.rotation.y -= 0.001;
        ring.rotation.z += 0.001;

        group.rotation.x += (pointerY - group.rotation.x) * 0.012;
        group.rotation.y += (pointerX - group.rotation.y) * 0.012;

        renderer.render(scene, camera);
      };

      animate();

      const resizeObserver = new ResizeObserver(() => {
        const width = heroVisual.clientWidth;
        const height = heroVisual.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });

      resizeObserver.observe(heroVisual);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          cancelAnimationFrame(animationId);
        } else {
          cancelAnimationFrame(animationId);
          animate();
        }
      });
    } catch (error) {
      console.warn(
        "Optional 3D scene unavailable; using static hero fallback.",
        error
      );
    }
  }

  // Three.js is loaded with defer, so initialize after the page loads.
  if (window.THREE) {
    initThreeScene();
  } else {
    window.addEventListener("load", initThreeScene, { once: true });
  }

  // Optional GSAP scroll animation enhancement.
  function initGsap() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;

    try {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray(
        ".service-card, .process-step, .package-card"
      ).forEach((card, index) => {
        gsap.fromTo(card, { y: 22 }, {
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true
          },
          delay: (index % 4) * 0.045
        });
      });

      gsap.to(".feature-image img", {
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: ".feature-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    } catch (error) {
      console.warn("Optional scroll animation enhancement unavailable.", error);
    }
  }

  if (window.gsap && window.ScrollTrigger) {
    initGsap();
  } else {
    window.addEventListener("load", initGsap, { once: true });
  }
})();
    
