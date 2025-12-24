// --- Theme Toggle ---
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
const icon = themeToggle.querySelector("i");

// Check local storage
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.setAttribute("data-theme", savedTheme);
  icon.className = savedTheme === "light" ? "fas fa-sun" : "fas fa-moon";
}

themeToggle.addEventListener("click", () => {
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  body.setAttribute("data-theme", newTheme);
  icon.className = newTheme === "light" ? "fas fa-sun" : "fas fa-moon";
  localStorage.setItem("theme", newTheme);
  
  // Update particle color based on theme
  updateParticlesTheme(newTheme);
});

// --- Modal Functionality (New) ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal if clicked outside content
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// --- Mobile Menu ---
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

// --- Scroll Animation ---
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.hidden-left, .hidden-right, .hidden-up').forEach((el) => observer.observe(el));

// --- Contact Form Handling ---
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Prevents page reload

  const form = this;
  const btn = form.querySelector('.submit-btn');
  const originalText = btn.innerHTML;

  // 1. Show Loading Animation
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.style.opacity = '0.7';

  // 2. Prepare Data
  const formData = new FormData(form);
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);

  // 3. Send to Web3Forms
  fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      body: json
  })
  .then(async (response) => {
      let json = await response.json();
      if (response.status == 200) {
          // Success!
          btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
          btn.style.background = '#00d4ff';
          btn.style.opacity = '1';
          form.reset();
      } else {
          // Error
          console.log(response);
          btn.innerHTML = 'Error!';
          btn.style.background = '#ff007a';
      }
  })
  .catch(error => {
      console.log(error);
      btn.innerHTML = 'Error!';
      btn.style.background = '#ff007a';
  })
  .finally(() => {
      // Reset button after 3 seconds
      setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.opacity = '1';
      }, 3000);
  });
});

// --- Projects Carousel Navigation ---
const track = document.getElementById('projectTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Scroll amount: Card width (350px) + Gap (30px) = 380px
const scrollAmount = 380; 

nextBtn.addEventListener('click', () => {
  track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

prevBtn.addEventListener('click', () => {
  track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});

// --- Particle Network Animation (Canvas) ---
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
let particleColor = "rgba(255, 255, 255, 0.5)";
let lineColor = "rgba(255, 255, 255, 0.05)";

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function updateParticlesTheme(theme) {
    if(theme === "light") {
        particleColor = "rgba(0, 0, 0, 0.4)";
        lineColor = "rgba(0, 0, 0, 0.1)";
    } else {
        particleColor = "rgba(255, 255, 255, 0.5)";
        lineColor = "rgba(255, 255, 255, 0.05)";
    }
}
updateParticlesTheme(body.getAttribute("data-theme"));

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.5 - 0.75;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const numberOfParticles = (canvas.width * canvas.height) / 15000;
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});


// --- Modal Functionality ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Close modal when clicking outside the box
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}