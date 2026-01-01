const canvas = document.getElementById('skyCanvas');
const ctx = canvas.getContext('2d');
const infoBox = document.getElementById('infoBox');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawSky();
});

// Data bintang sederhana
const stars = [
  {name: 'Sirius', x: 400, y: 200, radius: 3},
  {name: 'Betelgeuse', x: 600, y: 150, radius: 3},
  {name: 'Rigel', x: 650, y: 250, radius: 3},
  {name: 'Polaris', x: 300, y: 50, radius: 3},
];

// Data rasi bintang (index ke stars array)
const constellations = [
  {name: 'Orion', lines: [[1,2],[2,0],[0,1]]}
];

function drawSky() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gambar semua bintang
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI*2);
    ctx.fillStyle = 'white';
    ctx.fill();
  });

  // Gambar rasi bintang
  constellations.forEach(constel => {
    ctx.strokeStyle = 'rgba(0,255,255,0.5)';
    ctx.lineWidth = 1;
    constel.lines.forEach(line => {
      const start = stars[line[0]];
      const end = stars[line[1]];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });
  });
}

// Interaksi klik bintang
canvas.addEventListener('mousemove', (e) => {
  let found = false;
  stars.forEach(star => {
    const dx = e.clientX - star.x;
    const dy = e.clientY - star.y;
    if(Math.sqrt(dx*dx + dy*dy) < 5) {
      infoBox.style.left = e.clientX + 10 + 'px';
      infoBox.style.top = e.clientY + 10 + 'px';
      infoBox.textContent = star.name;
      infoBox.classList.remove('hidden');
      found = true;
    }
  });
  if(!found) infoBox.classList.add('hidden');
});

drawSky();
