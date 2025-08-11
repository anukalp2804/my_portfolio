// Project slider code (your existing one)
let currentIndex = 0;
const track = document.getElementById("projectTrack");
const cards = track.children;
const cardWidth = 330;
const visibleCount = Math.floor(track.offsetWidth / cardWidth);
const maxIndex = cards.length - visibleCount;

function moveSlide(direction) {
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = maxIndex;
  if (currentIndex > maxIndex) currentIndex = 0;
  updateSlide();
}

function updateSlide() {
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

function startAutoSlide() {
  return setInterval(() => moveSlide(1), 15000);
}

let autoSlide = startAutoSlide();

document.getElementById("leftArrow").addEventListener("click", () => moveSlide(-1));
document.getElementById("rightArrow").addEventListener("click", () => moveSlide(1));

track.addEventListener("mouseenter", () => clearInterval(autoSlide));
track.addEventListener("mouseleave", () => autoSlide = startAutoSlide());

// Font changing effect for name
const nameElement = document.querySelector('.content h1');
const fonts = ["'Poppins', sans-serif", "'Roboto Slab', serif", "'Pacifico', cursive", "'Anton', sans-serif"];
let currentFont = 0;
setInterval(() => {
  currentFont = (currentFont + 1) % fonts.length;
  nameElement.style.fontFamily = fonts[currentFont];
}, 5000);

// Typing effect for role text (one at a time)
const roleElement = document.querySelector('.content h3');
const roles = ["Learning Java Fullstack"];
let roleIndex = 0;
let charIndex = 0;
let typingForward = true;

function typeRole() {
  let currentRole = roles[roleIndex];

  if (typingForward) {
    if (charIndex < currentRole.length) {
      charIndex++;
      roleElement.textContent = currentRole.substring(0, charIndex);
      setTimeout(typeRole, 150);
    } else {
      typingForward = false;
      setTimeout(typeRole, 1500); // Wait before start deleting
    }
  } else {
    if (charIndex > 0) {
      charIndex--;
      roleElement.textContent = currentRole.substring(0, charIndex);
      setTimeout(typeRole, 80);
    } else {
      typingForward = true;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeRole, 500);
    }
  }
}

typeRole();


//for mobile

