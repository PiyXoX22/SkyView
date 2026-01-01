const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.z = 200;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls (Zoom & Pan)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = true;
controls.rotateSpeed = 0.3;

// Stars
const starField = generateStars(scene, 8000);

// Planets
const planets = loadPlanets(scene);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Time simulation
let time = 0;

function animate() {
  requestAnimationFrame(animate);

  time += 0.001;

  // Rotasi langit (efek waktu nyata)
  starField.rotation.y += 0.0002;

  // Orbit planet
  planets.moon.position.x = 80 + Math.cos(time * 5) * 15;
  planets.moon.position.z = Math.sin(time * 5) * 15;

  planets.mars.position.x = Math.cos(time) * 140;
  planets.mars.position.z = Math.sin(time) * 140;

  renderer.render(scene, camera);
}

animate();
