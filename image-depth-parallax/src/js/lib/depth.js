document.addEventListener('mousemove', (event) => {
  const background = document.querySelector('[data-background]');
  const foreground = document.querySelector('[data-foreground]');

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const rotateX = (event.clientY - centerY) / centerY * 15; // Adjust multiplier for rotation strength
  const rotateY = (event.clientX - centerX) / centerX * -15;

  if (background) {
    const bgOffsetX = (event.clientX / window.innerWidth - 0.5) * 10;
    const bgOffsetY = (event.clientY / window.innerHeight - 0.5) * 10;
    background.style.transform = `translate(${bgOffsetX}px, ${bgOffsetY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  if (foreground) {
    const fgOffsetX = (event.clientX / window.innerWidth - 0.5) * -5;
    const fgOffsetY = (event.clientY / window.innerHeight - 0.5) * -5;
    foreground.style.transform = `translate(${fgOffsetX}px, ${fgOffsetY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }
});