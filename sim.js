const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
// ======================
// YOUTUBE MUSIC
// ======================
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: 'GrQpcI0DdyU',
    playerVars: {
      autoplay: 1, 
      controls: 0,
      loop: 1,
      playlist: 'GrQpcI0DdyU',
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3
    }
  });
}

function playMusic(){
  if(player) player.playVideo(); // pastikan user klik tombol
}

function pauseMusic(){
  if(player) player.pauseVideo();
}


const infoImage = document.getElementById('infoImage');
const infoPanel = document.getElementById('infoPanel');
const infoTitle = document.getElementById('infoTitle');
const infoDesc  = document.getElementById('infoDesc');
const infoSize  = document.getElementById('infoSize');
const infoType  = document.getElementById('infoType');

function showInfo(data){
infoTitle.innerText = data.title || "Unknown Object";
infoDesc.innerText  = "📝 " + (data.desc || "-");
infoSize.innerText  = "📏 " + (data.size || "-");
infoType.innerText  = "🧪 " + (data.type || "-");

// 🖼️ IMAGE SUPPORT
if(data.image){
infoImage.src = data.image;
infoImage.style.display = "block";
}else{
infoImage.style.display = "none";
}

infoPanel.style.display = "block";
}


function closeInfo(){
  infoPanel.style.display = "none";
}

function showMobileNotice(){
const msg = document.createElement("div");
msg.innerText = "📱 Fitur ini hanya tersedia di PC\nMohon tunggu update selanjutnya 🙏";
msg.style.position = "fixed";
msg.style.bottom = "120px";
msg.style.left = "50%";
msg.style.transform = "translateX(-50%)";
msg.style.background = "rgba(0,0,0,0.85)";
msg.style.color = "#0ff";
msg.style.padding = "12px 18px";
msg.style.border = "1px solid #0ff";
msg.style.borderRadius = "10px";
msg.style.fontFamily = "monospace";
msg.style.fontSize = "14px";
msg.style.textAlign = "center";
msg.style.zIndex = "2000";

document.body.appendChild(msg);

setTimeout(()=>{
msg.style.opacity = "0";
msg.style.transition = "opacity 0.6s";
setTimeout(()=> msg.remove(), 600);
}, 2500);
}

// ======================
// SCENE & CAMERA
// ======================
const scene = new THREE.Scene();
loadGaiaStars(scene);



// ======================
// SOLAR SYSTEM GROUP (ECLIPTIC PLANE)
// ======================
const solarSystem = new THREE.Group();
solarSystem.rotation.x = THREE.MathUtils.degToRad(7.25); // kemiringan alami tata surya
scene.add(solarSystem);
// ======================
// SOLAR SYSTEM POSITION (REALISTIC)
// ======================
const SOLAR_DISTANCE = 4200; // jarak dari galactic center (visual scale)

solarSystem.position.set(
SOLAR_DISTANCE,
120,   // sedikit di atas galactic plane
-800
);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 80000);
camera.position.set(0, 250, 900);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ======================
// AUTO RESIZE (MOBILE ROTATION FIX)
// ======================
function resizeRenderer(){

const width = window.innerWidth;
const height = window.innerHeight;

camera.aspect = width / height;
camera.updateProjectionMatrix();

renderer.setSize(width, height);
}

window.addEventListener("resize", resizeRenderer);
window.addEventListener("orientationchange", () => {
setTimeout(resizeRenderer, 200);
});

renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "1";





// SUN LIGHT (utama)
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(500, 200, 300);
scene.add(sunLight);

// ambient biar gak hitam
const ambient = new THREE.AmbientLight(0x404040, 1.2);
scene.add(ambient);

// ======================
// CONTROLS
// ======================
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const flyControls = new THREE.FlyControls(camera, renderer.domElement);
flyControls.enabled = false;
flyControls.movementSpeed = 150;
flyControls.rollSpeed = Math.PI / 24;
flyControls.dragToLook = true;

let freeMode = false;
controls.minDistance = 1;
controls.maxDistance = 9000; // < radius milkyWay (10000)
function setFreeFlyMode() {
freeMode = true;
controls.enabled = false;
flyControls.enabled = true;
}

function setOrbitMode() {
freeMode = false;
flyControls.enabled = false;
controls.enabled = true;
}


// ======================
// MOBILE FREE FLY SETUP
// ======================
const moveState = {
forward:false,
back:false,
left:false,
right:false,
up:false,
down:false
};

// ======================
// MOBILE LOOK CONTROL (SWIPE)
// ======================
let touchLook = {
active:false,
lastX:0,
lastY:0
};

if(isMobile){

renderer.domElement.addEventListener("touchstart", e=>{
if(!freeMode) return;

const t = e.touches[0];
touchLook.active = true;
touchLook.lastX = t.clientX;
touchLook.lastY = t.clientY;
});

renderer.domElement.addEventListener("touchmove", e=>{
if(!freeMode || !touchLook.active) return;

const t = e.touches[0];

const dx = t.clientX - touchLook.lastX;
const dy = t.clientY - touchLook.lastY;

touchLook.lastX = t.clientX;
touchLook.lastY = t.clientY;

const sensitivity = 0.004;

camera.rotation.y -= dx * sensitivity;
camera.rotation.x -= dy * sensitivity;

// batasi rotasi atas bawah supaya tidak kebalik
camera.rotation.x = Math.max(
  -Math.PI/2,
  Math.min(Math.PI/2, camera.rotation.x)
);
});

renderer.domElement.addEventListener("touchend", ()=>{
touchLook.active = false;
});

}

const mobileControls = document.getElementById("mobileControls");

if(isMobile){
mobileControls.style.display = "none";

document.getElementById("freeBtn").addEventListener("click", ()=>{
// freeMode SUDAH di-toggle oleh handler utama
if(freeMode){
  mobileControls.style.display = "block";
}else{
  mobileControls.style.display = "none";
}
});
}


document.querySelectorAll("#mobileControls button").forEach(btn=>{
  const dir = btn.dataset.dir;

  btn.addEventListener("touchstart", e=>{
    e.preventDefault();
    moveState[dir] = true;
  });

  btn.addEventListener("touchend", ()=>{
    moveState[dir] = false;
  });
});



// ======================
// RA / DEC TO XYZ
// ======================
function raDecToXYZ(ra, dec, radius){
const raRad  = THREE.MathUtils.degToRad(ra);
const decRad = THREE.MathUtils.degToRad(dec);

return new THREE.Vector3(
radius * Math.cos(decRad) * Math.cos(raRad),
radius * Math.sin(decRad),
radius * Math.cos(decRad) * Math.sin(raRad)
);
}

const hipparcosStars = [
{ name:"Sirius", ra:6.752, dec:-16.716, mag:-1.46 },
{ name:"Vega", ra:18.615, dec:38.78, mag:0.03 },
{ name:"Betelgeuse", ra:5.9195, dec:7.407, mag:0.42 },
{ name:"Rigel", ra:5.242, dec:-8.201, mag:0.18 }
];

const skyGroup = new THREE.Group();
scene.add(skyGroup);


hipparcosStars.forEach(s=>{
const brightness = Math.pow(2.512, -s.mag);

const star = new THREE.Mesh(
  new THREE.SphereGeometry(6 * brightness, 12, 12),
  new THREE.MeshBasicMaterial({
    color:0xffffff,
    transparent:true,
    opacity: Math.min(1, brightness)
  })
);

const pos = raDecToXYZ(s.ra, s.dec, 6000);
star.position.copy(pos);

star.userData.info = {
  title:"⭐ "+s.name,
  desc:"Bintang katalog Hipparcos",
  size:"Magnitude "+s.mag,
  type:"Star"
};

skyGroup.add(star);
});
// ======================
// PROCEDURAL SPIRAL GALAXY
// ======================
function generateSpiralGalaxy(count = 120000){

const arms = 4; // jumlah spiral arms
const g = new THREE.BufferGeometry();
const pos = [];

for(let i=0;i<count;i++){

// pilih arm
const arm = i % arms;

// radius galaksi
const radius = Math.pow(Math.random(),0.6) * 14000;

// spiral angle
const angle = radius * 0.0008 + (arm * Math.PI * 2 / arms);

// sedikit random
const spread = 0.2;

const x = Math.cos(angle) * radius + (Math.random()-0.5) * radius * spread;
const z = Math.sin(angle) * radius + (Math.random()-0.5) * radius * spread;

// galactic plane thickness
const y = (Math.random()-0.5) * radius * 0.05;

pos.push(x,y,z);

}

g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));

const m = new THREE.PointsMaterial({
size:1.2,
color:0xffffff,
transparent:true,
opacity:0.14,
depthWrite:false
});

const galaxy = new THREE.Points(g,m);

skyGroup.add(galaxy);

}
generateSpiralGalaxy(isMobile ? 60000 : 120000);
// ======================
// SHOOTING STAR / METEOR
// ======================
const meteors = [];

function spawnMeteor(){
if(!camera) return;

// 60% oren, 40% putih
const isOrange = Math.random() < 0.6;

const meteor = new THREE.Mesh(
  new THREE.SphereGeometry(2.2, 12, 12),
  new THREE.MeshBasicMaterial({
    color: isOrange ? 0xffa500 : 0xffffff,
    transparent: true,
    opacity: 0.9
  })
);

const spread = 700;
meteor.position.set(
  camera.position.x + (Math.random()-0.5) * spread,
  camera.position.y + 700 + Math.random() * 300,
  camera.position.z - 1300
);

meteor.userData.velocity = new THREE.Vector3(
  (Math.random()-0.5) * 6,
  -22 - Math.random() * 10,
  38 + Math.random() * 15
);

meteor.userData.life = 0;
meteor.userData.isOrange = isOrange; // (optional, info)

meteors.push(meteor);
scene.add(meteor);

setTimeout(()=>{
  scene.remove(meteor);
  const i = meteors.indexOf(meteor);
  if(i !== -1) meteors.splice(i,1);
}, 5000);
}

setInterval(spawnMeteor, 3000);





// ======================
// MILKY WAY BACKGROUND
// ======================
const loader = new THREE.TextureLoader();
const milkyTex = loader.load('milkyway.jpg'); // <-- ganti dengan texture Milky Way sendiri
milkyTex.colorSpace = THREE.SRGBColorSpace;

const milkyWay = new THREE.Mesh(
new THREE.SphereGeometry(10000,64,64),
new THREE.MeshBasicMaterial({
  map: milkyTex,
  side: THREE.BackSide,
  transparent:true,
  opacity:0.45,
  depthWrite:false
})
);
milkyWay.rotation.x = THREE.MathUtils.degToRad(63);
milkyWay.rotation.z = THREE.MathUtils.degToRad(15);
skyGroup.add(milkyWay);


// ======================
// SAGITTARIUS A* (GALACTIC CENTER)
// ======================
const sagA = new THREE.Group();

// Event horizon (inti)
const sagCore = new THREE.Mesh(
new THREE.SphereGeometry(90, 32, 32),
new THREE.MeshBasicMaterial({ color: 0x000000 })
);
sagA.add(sagCore);

// Accretion disk
const sagDisk = new THREE.Mesh(
new THREE.RingGeometry(120, 260, 96),
new THREE.MeshBasicMaterial({
  color: 0xffbb66,
  transparent: true,
  opacity: 0.45,
  side: THREE.DoubleSide
})
);
sagDisk.rotation.x = Math.PI / 2;
sagA.add(sagDisk);

// Gravitational lens ring
const sagLens = new THREE.Mesh(
new THREE.RingGeometry(280, 420, 128),
new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.18,
  side: THREE.DoubleSide
})
);
sagLens.rotation.x = Math.PI / 2;
sagA.add(sagLens);

// POSISI = pusat galaksi
sagA.position.set(0, 0, 0);

sagA.userData.info = {
title: "🕳️ Sagittarius A*",
desc: "Supermassive black hole di pusat Galaksi Bima Sakti",
size: "Massa ±4,1 juta Matahari",
type: "Galactic Center Black Hole",
image:"https://threejs.org/examples/planets/earth_atmos_2048.jpg"
};

skyGroup.add(sagA);


// ======================
// SUN
// ======================
const sunTexture = loader.load('sun.jpg'); // load texture Sun
sunTexture.colorSpace = THREE.SRGBColorSpace;

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(40, 32, 32),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);

solarSystem.add(sun);

sun.userData.info = {
  title:"☀️ Sun",
  desc:"Bintang pusat Tata Surya",
  size:"Diameter 1.392.700 km",
  type:"Yellow Dwarf"
};

// ======================
// Glow Sun
// ======================
function createColoredGlow(color, size = 256){
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;

  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;

  const gRad = ctx.createRadialGradient(c, c, 0, c, c, c);
  gRad.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gRad.addColorStop(0.4, `rgba(${r},${g},${b},0.6)`);
  gRad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gRad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

// Glow kuning-oranye untuk Sun
const sunGlowTex = createColoredGlow(0xffee99);
const sunGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({
      map: sunGlowTex,
      color: 0xffffff, // canvas sudah berwarna
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
  })
);
sunGlow.scale.set(40 * 4, 40 * 4, 1); // sesuai size Sun
sun.add(sunGlow);

// ======================
// PLANETS & MOON
// ======================
const PLANETS = [
{name:'Mercury', size:3,  a:60,  e:0.205, speed:4.15, tex:'merkurius.jpg'},
{name:'Venus',   size:6,  a:90,  e:0.007, speed:1.62, tex:'venusmap.jpg'},
{name:'Earth',   size:6.5,a:130, e:0.017, speed:1.00, tex:'earth.jpg'},
{name:'Mars',    size:4.5,a:170, e:0.093, speed:0.53, tex:'mars.jpg'},
{name:'Jupiter', size:14, a:230, e:0.049, speed:0.084, tex:'jupitermap.jpg'},
{name:'Saturn',  size:12, a:300, e:0.056, speed:0.034, tex:'saturnmap.jpg'},
{name:'Uranus',  size:10, a:370, e:0.046, speed:0.012, tex:'uranusmap.jpg'},
{name:'Neptune', size:10, a:430, e:0.009, speed:0.006, tex:'neptunemap.jpg'}
];

const planets = [];
let earthMesh;

PLANETS.forEach(p=>{
  let mat = p.tex ? new THREE.MeshBasicMaterial({ map: loader.load(p.tex) }) : new THREE.MeshBasicMaterial({ color:p.color });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size,48,48), mat);
  mesh.userData = {
  ...p,
  angle: Math.random() * Math.PI * 2,
  info: {
    title: "🪐 " + p.name,
    desc: `Planet ${p.name} di Tata Surya`,
    size: `Radius visual: ${p.size}`,
    type: "Planet"
  }
};
  solarSystem.add(mesh);
  planets.push(mesh);
  if(p.name === 'Earth'){
  earthMesh = mesh;
  earthMesh.userData.info = {
    title:"🌍 Earth",
    desc:"Planet layak huni",
    size:"Diameter 12.742 km",
    type:"Terrestrial"
  };
}

  if(p.name==='Saturn'){
    const ring = new THREE.Mesh(new THREE.RingGeometry(p.size+4,p.size+14,64),
      new THREE.MeshBasicMaterial({ color:0xccaa66, side:THREE.DoubleSide, transparent:true, opacity:0.8 }));
    ring.rotation.x = Math.PI/2;
    mesh.add(ring);
  }


});

// MOON
const moonTex = loader.load('moon.jpg');
moonTex.colorSpace = THREE.SRGBColorSpace;
const moon = new THREE.Mesh(new THREE.SphereGeometry(1.8,32,32), new THREE.MeshBasicMaterial({ map:moonTex }));
earthMesh.add(moon);
moon.position.x = 15;
moon.userData = { angle:0 };
moon.userData.info = {
  title: "🌕 Moon",
  desc: "Satelit alami Bumi",
  size: "Diameter 3.474 km",
  type: "Natural Satellite"
};


// ======================
// PLEIADES (M45)
// ======================
const pleiades = new THREE.Group();

// ======================
// LOAD TEXTURE (SAFE)
// ======================
const pleiadesLoader = new THREE.TextureLoader();
const pleiadesWhiteTex = pleiadesLoader.load("white.png");

// ======================
const pleiadesStars = [
{ name: "Alcyone",  x: 0,   y: 0,  z: 0 },
{ name: "Maia",     x: 80,  y: 30, z: -40 },
{ name: "Electra",  x: -60, y: 20, z: 50 },
{ name: "Taygeta",  x: 40,  y: -20,z: 60 },
{ name: "Celaeno",  x: -90, y: -10,z: -30 },
{ name: "Merope",   x: 20,  y: 10, z: -80 },
{ name: "Asterope", x: -30, y: 40, z: 20 }
];

// ======================
// GLOW TEXTURE (PROCEDURAL)
// ======================
function createGlowTexture(size = 256){
const canvas = document.createElement("canvas");
canvas.width = canvas.height = size;
const ctx = canvas.getContext("2d");
const c = size / 2;

const g = ctx.createRadialGradient(c, c, 0, c, c, c);
g.addColorStop(0, "rgba(180,210,255,1)");
g.addColorStop(0.4, "rgba(120,170,255,0.6)");
g.addColorStop(1, "rgba(0,0,0,0)");

ctx.fillStyle = g;
ctx.fillRect(0,0,size,size);

return new THREE.CanvasTexture(canvas);
}

const pleiadesGlow = createGlowTexture();

// ======================
// CREATE STARS
// ======================
pleiadesStars.forEach(s => {

// ⭐ CORE (pakai white.png)
const star = new THREE.Mesh(
  new THREE.SphereGeometry(14, 16, 16),
  new THREE.MeshBasicMaterial({
    map: pleiadesWhiteTex,
    color: 0x99ccff,        // tint biru khas Pleiades
    transparent: true
  })
);

star.position.set(s.x, s.y, s.z);

// ✨ GLOW
const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: pleiadesGlow,
    color: 0x99ccff,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);

glow.scale.set(100, 100, 1);
star.add(glow);

star.userData.info = {
  title: "🌟 " + s.name,
  desc: "Bintang dalam gugus terbuka Pleiades (M45)",
  size: "Bintang muda panas",
  type: "Open Star Cluster"
};

pleiades.add(star);
});

// ======================
placeDeepObject(pleiades, 3800);
pleiades.rotation.x = THREE.MathUtils.degToRad(24);
skyGroup.add(pleiades);




// ======================
// ORION CONSTELLATION (Scientific) with Glow & Blink
// ======================
const orion = new THREE.Group();

// Loader
const textureLoader = new THREE.TextureLoader();

// Fungsi glow berwarna (reuse)
function createColoredGlow(color, size = 256){
const canvas = document.createElement("canvas");
canvas.width = canvas.height = size;
const ctx = canvas.getContext("2d");
const c = size / 2;

const r = (color >> 16) & 0xff;
const g = (color >> 8) & 0xff;
const b = color & 0xff;

const gRad = ctx.createRadialGradient(c, c, 0, c, c, c);
gRad.addColorStop(0, `rgba(${r},${g},${b},1)`);
gRad.addColorStop(0.4, `rgba(${r},${g},${b},0.6)`);
gRad.addColorStop(1, "rgba(0,0,0,0)");

ctx.fillStyle = gRad;
ctx.fillRect(0, 0, size, size);

return new THREE.CanvasTexture(canvas);
}

// Tambahkan info warna glow tiap bintang Orion
const orionStars = [
{
  name: 'Betelgeuse', x:-50, y:100, z:-100, size:22, texture:'red.png', glowColor: 0xff5555,
  info: { title:"⭐ Betelgeuse", desc:"Bintang supergiant red", size:"Radius ±764× Matahari", type:"Red Supergiant" }
},
{
  name: 'Rigel', x:40, y:10, z:-210, size:20, texture:'white.png', glowColor: 0xaaddff,
  info: { title:"⭐ Rigel", desc:"Bintang supergiant biru-putih", size:"Radius ±79× Matahari", type:"Blue Supergiant" }
},
{
  name: 'Bellatrix', x:50, y:80, z:-120, size:16, texture:'white.png', glowColor: 0xaaddff,
  info: { title:"⭐ Bellatrix", desc:"Bintang raksasa biru", size:"Radius ±6× Matahari", type:"Blue Giant" }
},
{
  name: 'Alnitak', x:-30, y:50, z:-160, size:13, texture:'white.png', glowColor: 0xaaddff,
  info: { title:"⭐ Alnitak", desc:"Salah satu bintang sabuk Orion", size:"Radius ±20× Matahari", type:"Blue Supergiant" }
},
{
  name: 'Alnilam', x:-10, y:60, z:-150, size:13, texture:'white.png', glowColor: 0xaaddff,
  info: { title:"⭐ Alnilam", desc:"Bintang paling terang di sabuk Orion", size:"Radius ±42× Matahari", type:"Blue Supergiant" }
},
{
  name: 'Mintaka', x:10, y:55, z:-155, size:13, texture:'white.png', glowColor: 0xaaddff,
  info: { title:"⭐ Mintaka", desc:"Sistem bintang multi di sabuk Orion", size:"Multi-star system", type:"O-type binary" }
}
];

const orionGlowObjects = []; // simpan glow untuk kedip

orionStars.forEach(b => {
// 🌟 Core star
const texture = textureLoader.load(b.texture);
const starMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent:true });
const star = new THREE.Mesh(new THREE.SphereGeometry(b.size,16,16), starMaterial);

placeDeepObject(star, 4500);
star.userData.info = b.info;

// ✨ Glow
const glowTex = createColoredGlow(b.glowColor);
const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: glowTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
glow.scale.set(b.size*4, b.size*4, 1);
star.add(glow);

orion.add(star);
orionGlowObjects.push(glow);
});

// letakkan Orion
placeDeepObject(orion, 4000);
orion.rotation.x = THREE.MathUtils.degToRad(23.4);
skyGroup.add(orion);



const blackHole = new THREE.Mesh(new THREE.SphereGeometry(140,32,32), new THREE.MeshBasicMaterial({ color:0x000000 }));
placeDeepObject(blackHole, 5200);
skyGroup.add(blackHole);
blackHole.userData.info = {
  title:"🕳️ Black Hole",
  desc:"Gravitasi ekstrem",
  size:"Event Horizon",
  type:"Singularity"
};

const disk = new THREE.Mesh(new THREE.RingGeometry(160,300,64), new THREE.MeshBasicMaterial({ color:0xffaa00, side:THREE.DoubleSide, transparent:true, opacity:0.4 }));
disk.rotation.x = Math.PI/2;
blackHole.add(disk);
// ===== GRAVITATIONAL LENSING EFFECT =====
const lensRing = new THREE.Mesh(
  new THREE.RingGeometry(310, 420, 128),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
  })
);
lensRing.rotation.x = Math.PI / 2;
blackHole.add(lensRing);

// Sabuk Asteroid (diperbaiki)
const asteroidGroup = new THREE.Group();
for(let i=0; i<300; i++){
const a = 180 + Math.random()*40; // radius orbit antara 180-220
const angle = Math.random()*Math.PI*2;
const mesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.3+Math.random()*1.2, 6, 6), // lebih kecil biar proporsional
  new THREE.MeshBasicMaterial({ color:0x888888 })
);
mesh.position.set(
  Math.cos(angle)*a,
  (Math.random()-0.5)*8, // variasi tinggi ±4
  Math.sin(angle)*a
);
asteroidGroup.add(mesh);
}
solarSystem.add(asteroidGroup);



// ======================
// DEEP SPACE STARS
// ======================

// ======================
// DATA DEEP STARS
// ======================
const deepStars = [
// ===== GALACTIC CORE =====
{ name:"S2", x:120, y:-40, z:80, size:10, texture:"bening.png" },
{ name:"S62", x:-90, y:60, z:-30, size:8, texture:"bening.png" },
{ name:"IRS 16C", x:200, y:150, z:-100, size:14, texture:"sun.jpg" },
{ name:"IRS 13E", x:-180, y:90, z:130, size:12, texture:"sun.jpg" },
{ name:"S4711", x:70, y:-120, z:60, size:7, texture:"bening.png" },

// ===== INNER MILKY WAY =====
{ name:"Arcturus", x:3200, y:-1800, z:900, size:22, texture:"sun.jpg" },
{ name:"Aldebaran", x:4100, y:2200, z:-1200, size:24, texture:"sun.jpg" },
{ name:"Antares", x:5200, y:-900, z:-2400, size:28, texture:"red.png" },
{ name:"Spica", x:4800, y:1600, z:2100, size:21, texture:"white.png" },
{ name:"Fomalhaut", x:5600, y:-2600, z:1800, size:20, texture:"bening.png" },
{ name:"Regulus", x:4300, y:900, z:-1700, size:19, texture:"bening.png" },

// ===== ORION =====
{ name:"Meissa", x:6200, y:1400, z:-1200, size:22, texture:"white.png" },
{ name:"Propus (Eta Geminorum)", x:6400, y:1650, z:600, size:24, texture:"sun.jpg" },
{ name:"Bellatrix Minor", x:6600, y:1900, z:-300, size:20, texture:"white.png" },

// ===== LOCAL ARM =====
{ name:"Sirius", x:8200, y:200, z:-300, size:25, texture:"bening.png" },
{ name:"Procyon", x:8300, y:500, z:200, size:20, texture:"sun.jpg" },
{ name:"Vega", x:9000, y:1100, z:3200, size:22, texture:"white.png" },
{ name:"Altair", x:8800, y:-900, z:2100, size:18, texture:"bening.png" },
{ name:"Deneb", x:10200, y:3000, z:5400, size:32, texture:"white.png" },
{ name:"Epsilon Eridani", x:7800, y:-400, z:900, size:15, texture:"sun.jpg" },
{ name:"Tau Ceti", x:7600, y:300, z:-800, size:14, texture:"sun.jpg" },
{ name:"Kapella", x:9500, y:2200, z:-1200, size:27, texture:"sun.jpg" },
{ name:"Castor", x:9100, y:1500, z:-900, size:19, texture:"bening.png" },
{ name:"Pollux", x:9300, y:1700, z:-1100, size:21, texture:"sun.jpg" },

// ===== HALO STARS =====
{ name:"Kapteyn’s Star", x:-12000, y:4000, z:-6000, size:14, texture:"sun.jpg" },
{ name:"Luyten 726-8", x:-8800, y:-2600, z:1800, size:11, texture:"red.png" },
{ name:"HD 140283 (Methuselah)", x:-15000, y:7000, z:-8000, size:13, texture:"sun.jpg" },
{ name:"Groombridge 1830", x:-13000, y:5000, z:3000, size:11, texture:"sun.jpg" },

// ===== MASSIVE / EXOTIC =====
{ name:"Eta Carinae", x:7400, y:-2800, z:-3300, size:35, texture:"red.png" },
{ name:"WR 104", x:6800, y:3100, z:-2600, size:29, texture:"sun.jpg" },
{ name:"Pistol Star", x:400, y:300, z:-200, size:34, texture:"sun.jpg" },

// ===== GIANTS & SUPERGIANTS =====
{ name:"R Doradus", x:4800, y:-2600, z:-900, size:30, texture:"red.png" },
{ name:"Mu Cephei", x:6100, y:2900, z:3400, size:33, texture:"red.png" },
{ name:"VV Cephei", x:7000, y:3300, z:4100, size:36, texture:"red.png" },
{ name:"S Doradus", x:8200, y:-3500, z:-4200, size:34, texture:"red.png" },
{ name:"VY Canis Majoris", x:5400, y:-4100, z:1200, size:38, texture:"red.png" },

// ===== RARE OBJECTS =====
{ name:"UY Scuti", x:6800, y:-2900, z:-2100, size:40, texture:"red.png" },
{ name:"RW Cephei", x:6600, y:3100, z:3800, size:35, texture:"red.png" },
{ name:"IRC +10420", x:5900, y:2700, z:3400, size:34, texture:"red.png" },
];

// ======================
// DEEP STARS DENGAN GLOW & KEDIP WARNA OTOMATIS
// ======================

const GALAXY_OFFSET_X = 7000;
const deepStarsGlowObjects = []; // simpan glow untuk animasi kedip
const starMap = {};

function createColoredGlow(color, size = 256){
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;

  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;

  const gRad = ctx.createRadialGradient(c, c, 0, c, c, c);
  gRad.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gRad.addColorStop(0.4, `rgba(${r},${g},${b},0.6)`);
  gRad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gRad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

// Loop deepStars
deepStars.forEach(b => {
  // 🌟 Core star
  const star = new THREE.Mesh(
      new THREE.SphereGeometry(b.size, 16, 16),
      new THREE.MeshBasicMaterial({
          map: textureLoader.load(b.texture),
          transparent: true
      })
  );

  star.position.set(b.x - GALAXY_OFFSET_X, b.y, b.z);

  // simpan posisi asli
  star.userData.galaxyX = b.x - GALAXY_OFFSET_X;
  star.userData.galaxyY = b.y;
  star.userData.galaxyZ = b.z;

  star.userData.info = {
      title: "⭐ " + b.name,
      desc: "Bintang luar Tata Surya",
      size: "Ukuran visual: " + b.size,
      type: "Star"
  };

  // ======= Warna glow otomatis berdasarkan texture =======
  let colorHex = 0xffffff; // default putih
  if(b.texture.includes("red")) colorHex = 0xff4444;
  else if(b.texture.includes("bening")) colorHex = 0x99ccff;
  else if(b.texture.includes("white")) colorHex = 0xffffff;
  else if(b.texture.includes("sun")) colorHex = 0xffee99;

  const glowTex = createColoredGlow(colorHex);
  const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xffffff, // putih karena canvas sudah berwarna
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          depthWrite: false
      })
  );
  glow.scale.set(b.size * 4, b.size * 4, 1);
  star.add(glow);

  deepStarsGlowObjects.push(glow);

  skyGroup.add(star);
  starMap[b.name] = star;
});

const deepPlanets = [

// ===== VEGA =====
{ name:"Vega b", host:"Vega", orbitRadius:35, size:4, color:0x66ccff, type:"Super-Earth" },
{ name:"Vega c", host:"Vega", orbitRadius:55, size:3, color:0x99ffcc, type:"Rocky" },
{ name:"Vega d", host:"Vega", orbitRadius:80, size:5, color:0xffbb66, type:"Gas Giant" },
{ name:"Vega e", host:"Vega", orbitRadius:110, size:3, color:0xcccccc, type:"Rocky" },

// ===== SIRIUS =====
{ name:"Sirius Ab", host:"Sirius", orbitRadius:40, size:5, color:0xffcc88, type:"Gas Giant" },
{ name:"Sirius Ac", host:"Sirius", orbitRadius:65, size:3, color:0xcccccc, type:"Rocky" },

// ===== TAU CETI =====
{ name:"Tau Ceti e", host:"Tau Ceti", orbitRadius:35, size:4, color:0x88ccff, type:"Super-Earth" },
{ name:"Tau Ceti f", host:"Tau Ceti", orbitRadius:60, size:3, color:0x99aa88, type:"Rocky" },
{ name:"Tau Ceti g", host:"Tau Ceti", orbitRadius:95, size:5, color:0xffaa66, type:"Gas Giant" },

// ===== EPSILON ERIDANI =====
{ name:"Epsilon Eridani b", host:"Epsilon Eridani", orbitRadius:70, size:5, color:0xffbb77, type:"Gas Giant" },
{ name:"Epsilon Eridani c", host:"Epsilon Eridani", orbitRadius:45, size:3, color:0xcccc99, type:"Rocky" },

// ===== PROCYON =====
{ name:"Procyon b", host:"Procyon", orbitRadius:55, size:4, color:0x88bbff, type:"Ice Giant" },

// ===== DENEB =====
{ name:"Deneb I", host:"Deneb", orbitRadius:120, size:6, color:0xffaa88, type:"Gas Giant" },
{ name:"Deneb II", host:"Deneb", orbitRadius:80, size:4, color:0xcccccc, type:"Rocky" },

// ===== ALTAIR =====
{ name:"Altair b", host:"Altair", orbitRadius:45, size:3, color:0x999999, type:"Rocky" },

// ===== ARCTURUS =====
{ name:"Arcturus I", host:"Arcturus", orbitRadius:90, size:4, color:0xffccaa, type:"Super-Earth" },
{ name:"Arcturus II", host:"Arcturus", orbitRadius:140, size:5, color:0xffaa66, type:"Gas Giant" },

// ===== ANTARES =====
{ name:"Antares b", host:"Antares", orbitRadius:180, size:6, color:0xff8844, type:"Gas Giant" },

// ===== FOMALHAUT =====
{ name:"Fomalhaut b", host:"Fomalhaut", orbitRadius:130, size:4, color:0xccccff, type:"Ice Giant" },
{ name:"Fomalhaut c", host:"Fomalhaut", orbitRadius:70, size:3, color:0x999999, type:"Rocky" },

// ===== TRAPPIST-1 =====
{ name:"TRAPPIST-1 b", host:"TRAPPIST-1", orbitRadius:15, size:2.5, color:0x888888, type:"Rocky" },
{ name:"TRAPPIST-1 c", host:"TRAPPIST-1", orbitRadius:22, size:2.5, color:0x999999, type:"Rocky" },
{ name:"TRAPPIST-1 d", host:"TRAPPIST-1", orbitRadius:30, size:3, color:0x88aa99, type:"Rocky" },

// ===== KEPLER =====
{ name:"Kepler-62 e", host:"Kepler-62", orbitRadius:60, size:4, color:0x66cc99, type:"Habitable" },
{ name:"Kepler-62 f", host:"Kepler-62", orbitRadius:85, size:4, color:0x88ccff, type:"Ice Earth" },
{ name:"Kepler-186 f", host:"Kepler-186", orbitRadius:75, size:4, color:0x66cc88, type:"Habitable" },
{ name:"Kepler-452 b", host:"Kepler-452", orbitRadius:110, size:5, color:0x88cc99, type:"Super-Earth" }


];
deepPlanets.forEach(p => {
const hostStar = starMap[p.host];
if (!hostStar) return;

const planet = new THREE.Mesh(
new THREE.SphereGeometry(p.size, 16, 16),
new THREE.MeshStandardMaterial({ color: p.color })
);

// ✅ RELATIF TERHADAP POSISI BINTANG
planet.position.set(
(p.x - GALAXY_OFFSET_X) - hostStar.userData.galaxyX,
p.y - hostStar.userData.galaxyY,
p.z - hostStar.userData.galaxyZ
);

hostStar.add(planet);

planet.userData.info = {
title: "🪐 " + p.name,
desc: "Planet luar Tata Surya",
type: p.type,
host: p.host
};
});


// ======================
// SCIENTIFIC PULSARS WITH PULSE EFFECT
// ======================
const pulsars = [
{
  name: 'Crab Pulsar (PSR B0531+21)',
  x: 2000, y: 150, z: -3000,
  size: 10,
  texture: "white.png",
  pulseSpeed: 0.08, // kecepatan kedip
  info: {
    title: "⚡ Crab Pulsar",
    desc: "Sisa supernova tahun 1054",
    size: "Diameter ±20 km",
    type: "Neutron Star (30 rotasi/detik)"
  }
},
{
  name: 'PSR J0437−4715',
  x: -1800, y: 100, z: -2500,
  size: 8,
  texture: "white.png",
  pulseSpeed: 0.12,
  info: {
    title: "⚡ PSR J0437−4715",
    desc: "Pulsar terdekat dari Bumi",
    size: "Diameter ±24 km",
    type: "Millisecond Pulsar"
  }
},
{
  name: 'PSR B1937+21',
  x: 1000, y: 200, z: -2000,
  size: 9,
  texture: "white.png",
  pulseSpeed: 0.15,
  info: {
    title: "⚡ PSR B1937+21",
    desc: "Pulsar tercepat yang diketahui",
    size: "Rotasi 641×/detik",
    type: "Millisecond Neutron Star"
  }
}
];

pulsars.forEach(p => {
const star = new THREE.Mesh(
  new THREE.SphereGeometry(p.size, 16, 16),
  new THREE.MeshBasicMaterial({
    map: textureLoader.load("textures/" + p.texture),
    transparent: true,
    opacity: 1
  })
);

placeDeepObject(star, 4800);

star.userData.pulseSpeed = p.pulseSpeed; // simpan kecepatan pulse
star.userData.pulseOffset = Math.random() * Math.PI * 2; // offset acak
star.userData.info = p.info;

skyGroup.add(star);
});



// ======================
// NEBULA FIXED (tidak ngadep player)
// ======================
const nebulas = [
  { name: 'Helix', x: -2000, y: 200, z: -3000, size: 600, texture: 'helix2.png' },
  { name: 'Eagle', x: 1800, y: 400, z: -2500, size: 500, texture: 'eagle1.png' },
  { name: 'Crab', x: 2500, y: 300, z: -3500, size: 550, texture: 'crab1.png' }
];

nebulas.forEach(n => {
  const tex = loader.load(n.texture);
  tex.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.PlaneGeometry(n.size, n.size);

const material = new THREE.MeshBasicMaterial({
  map: tex,
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  alphaTest: 0.05
});
  
  const nebula = new THREE.Mesh(geometry, material);
placeDeepObject(nebula, 6000);
nebula.lookAt(0,0,0);
nebula.rotateZ(Math.random()*Math.PI);
skyGroup.add(nebula);
  nebula.userData.info = {
  title: "🌫️ " + n.name + " Nebula",
  desc: "Awan gas dan debu kosmik",
  size: "Skala ratusan tahun cahaya",
  type: "Nebula"
};

});

// ======================
// ISS 3D MODEL
// ======================
const gltfLoader = new THREE.GLTFLoader();
let issModel;
let issAngle = 0;

gltfLoader.load(
  'iss.glb',
  gltf => {
    issModel = gltf.scene;
    issModel.scale.set(0.0006, 0.0006, 0.0006);
    issModel.position.set(12, 2, 0);

    issModel.userData.info = {
      title: "🛰️ ISS",
      desc: "International Space Station",
      size: "109 × 73 meter",
      type: "Artificial Satellite"
    };

    earthMesh.add(issModel);
  }  
);
// ======================
// EXTRA STARS DENGAN GLOW & KEDIP WARNA SESUAI
// ======================
const extraStars = [

{ name:'Alpha Centauri A', x:700, y:150, z:-1800, size:22, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'Alpha Centauri B', x:730, y:140, z:-1820, size:18, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'Barnard Star', x:-900, y:200, z:-2000, size:12, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'Wolf 359', x:-1200, y:100, z:-2200, size:10, texture:"red.png", glowColor:0xff5555 },

{ name:'Lalande 21185', x:-1400, y:300, z:-2100, size:11, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'Ross 154', x:-1600, y:180, z:-2400, size:10, texture:"red.png", glowColor:0xff5555 },

{ name:'Proxima Centauri', x:760, y:160, z:-1830, size:10, texture:"red.png", glowColor:0xff5555 },

{ name:'Kapteyn Star', x:-2000, y:400, z:-2500, size:12, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'61 Cygni A', x:-1800, y:600, z:-2100, size:14, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'61 Cygni B', x:-1830, y:620, z:-2150, size:13, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'Epsilon Indi', x:-2100, y:350, z:-2600, size:13, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'Achernar', x:5400, y:-2000, z:-3100, size:24, texture:"white.png", glowColor:0xaaddff },

{ name:'Canopus', x:5100, y:-2300, z:-2800, size:30, texture:"white.png", glowColor:0xaaddff },

{ name:'Capella', x:5000, y:1900, z:-900, size:26, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'Mimosa', x:4600, y:-1200, z:-1600, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'Alphard', x:4300, y:-900, z:-200, size:22, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'Alhena', x:4200, y:800, z:1200, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Dubhe', x:3800, y:2200, z:900, size:25, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'Merak', x:3700, y:2100, z:1000, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'Alkaid', x:3900, y:2500, z:1200, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Mizar', x:4000, y:2400, z:1100, size:19, texture:"white.png", glowColor:0xaaddff },

{ name:'Alcor', x:4010, y:2410, z:1110, size:15, texture:"white.png", glowColor:0xaaddff },

{ name:'Gacrux', x:4700, y:-2400, z:-1500, size:22, texture:"red.png", glowColor:0xff6666 },

{ name:'Acrux', x:4800, y:-2300, z:-1400, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'Peacock', x:5600, y:-2800, z:-1900, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Alnair', x:5900, y:-2500, z:-1700, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'Markab', x:7200, y:1100, z:2100, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Scheat', x:7300, y:1200, z:2200, size:21, texture:"red.png", glowColor:0xff8888 },

{ name:'Alpheratz', x:7400, y:1300, z:2000, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Mirach', x:7500, y:1400, z:2100, size:22, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Hamal', x:4200, y:1700, z:-1200, size:22, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Diphda', x:5400, y:-2000, z:1400, size:22, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Nunki', x:8700, y:-1200, z:2300, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'Kaus Australis', x:8600, y:-1300, z:2400, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'Kaus Media', x:8500, y:-1250, z:2200, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Rasalhague', x:7800, y:900, z:2000, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'Rasalgethi', x:7700, y:950, z:2100, size:23, texture:"red.png", glowColor:0xff7777 },

{ name:'Enif', x:7600, y:1000, z:2200, size:24, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Sadalmelik', x:7200, y:600, z:1800, size:23, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Sadalsuud', x:7100, y:650, z:1700, size:23, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Denebola', x:3900, y:2000, z:800, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Zubenelgenubi', x:5200, y:-1000, z:-1800, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Zubeneschamali', x:5300, y:-1100, z:-1900, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Adhara', x:6400, y:-1800, z:-2100, size:26, texture:"white.png", glowColor:0xaaddff },
{ name:'Aludra', x:6600, y:-2000, z:-2300, size:24, texture:"white.png", glowColor:0xaaddff },
{ name:'Wezen', x:6200, y:-1700, z:-1900, size:25, texture:"white.png", glowColor:0xaaddff },
{ name:'Naos', x:6800, y:-2100, z:-2400, size:28, texture:"white.png", glowColor:0xaaddff },
{ name:'Saiph', x:6000, y:-1600, z:-1700, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'Rigel Kentaurus', x:750, y:120, z:-1750, size:22, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'Toliman', x:770, y:130, z:-1780, size:20, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'Gienah', x:4100, y:2100, z:900, size:21, texture:"white.png", glowColor:0xaaddff },
{ name:'Almach', x:7600, y:1500, z:2100, size:22, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Algol', x:7200, y:1400, z:1900, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Algorab', x:4300, y:2300, z:1000, size:21, texture:"white.png", glowColor:0xaaddff },
{ name:'Algenib', x:7400, y:1600, z:2100, size:22, texture:"white.png", glowColor:0xaaddff },
{ name:'Alkes', x:4600, y:-900, z:-400, size:20, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Altais', x:8700, y:-1400, z:2300, size:21, texture:"white.png", glowColor:0xaaddff },
{ name:'Alphirk', x:6200, y:2600, z:3400, size:23, texture:"white.png", glowColor:0xaaddff },
{ name:'Alshain', x:8900, y:-1000, z:2100, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Ancha', x:5500, y:-1200, z:-1400, size:21, texture:"white.png", glowColor:0xaaddff },
{ name:'Ascella', x:8400, y:-1100, z:2200, size:22, texture:"white.png", glowColor:0xaaddff },
{ name:'Azha', x:5800, y:-1600, z:-1800, size:21, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Beid', x:4500, y:900, z:1400, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Biham', x:7200, y:600, z:1700, size:20, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Botein', x:4300, y:1800, z:-900, size:19, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Caph', x:7400, y:1600, z:2000, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Cebalrai', x:7600, y:800, z:2100, size:22, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Chara', x:3800, y:2100, z:900, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Chort', x:3900, y:2200, z:950, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Cursa', x:6100, y:-1500, z:-1700, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Dabih', x:7200, y:500, z:1600, size:22, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Deneb Kaitos', x:5300, y:-1800, z:1300, size:22, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Deneb Okab', x:8800, y:-900, z:2300, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Dschubba', x:5100, y:-1100, z:-1600, size:21, texture:"white.png", glowColor:0xaaddff },
{ name:'Edasich', x:4200, y:2500, z:1000, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Furud', x:6200, y:-1900, z:-2000, size:20, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Grumium', x:4100, y:2400, z:1200, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Hadar', x:4700, y:-2200, z:-1500, size:23, texture:"white.png", glowColor:0xaaddff },
{ name:'Heze', x:4500, y:2100, z:800, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Homam', x:7400, y:700, z:2000, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Izar', x:3900, y:2100, z:850, size:21, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Jabbah', x:5000, y:-1000, z:-1500, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Kitalpha', x:7500, y:1200, z:2100, size:22, texture:"white.png", glowColor:0xaaddff },
{ name:'Kornephoros', x:4200, y:2300, z:1100, size:23, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Lesath', x:5100, y:-1200, z:-1700, size:21, texture:"white.png", glowColor:0xaaddff },
{ name:'Maasym', x:4700, y:-900, z:-1500, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Marfik', x:7300, y:900, z:2000, size:21, texture:"white.png", glowColor:0xaaddff },
{ name:'Megrez', x:3900, y:2300, z:1000, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Menkalinan', x:5200, y:1900, z:-900, size:22, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Menkent', x:4700, y:-2100, z:-1500, size:23, texture:"white.png", glowColor:0xaaddff },
{ name:'Menkib', x:6300, y:-1500, z:-1800, size:24, texture:"white.png", glowColor:0xaaddff },

{ name:'Mesarthim', x:4300, y:1700, z:-1100, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Mothallah', x:4500, y:1800, z:-1000, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Muscida', x:4100, y:2100, z:950, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Nashira', x:7000, y:600, z:1600, size:21, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Nembus', x:7300, y:1300, z:2100, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Nihal', x:6000, y:-1700, z:-1800, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'Okul', x:4300, y:-800, z:-300, size:20, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Phact', x:4400, y:-700, z:-500, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Pherkad', x:3800, y:2400, z:1100, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Porrima', x:4100, y:2000, z:900, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Praecipua', x:3900, y:2300, z:1000, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Rana', x:6000, y:-1500, z:-1600, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Rasalas', x:4200, y:2100, z:900, size:21, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Rastaban', x:4100, y:2400, z:1100, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Rotanev', x:3800, y:2000, z:850, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Ruchbah', x:7400, y:1600, z:2100, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Sadalbari', x:7200, y:600, z:1700, size:21, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Sadachbia', x:7100, y:650, z:1750, size:21, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Sadr', x:6400, y:2800, z:3500, size:25, texture:"white.png", glowColor:0xaaddff },

{ name:'Segin', x:7300, y:1500, z:2100, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Seginus', x:3900, y:2100, z:900, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Sham', x:7400, y:700, z:1800, size:21, texture:"white.png", glowColor:0xaaddff },
{ name:'Sheratan', x:4300, y:1700, z:-1200, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Situla', x:7100, y:600, z:1650, size:21, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Skat', x:7200, y:650, z:1700, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Spiculum', x:4600, y:-900, z:-1400, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Sterope', x:3800, y:2200, z:900, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Suhail', x:5600, y:-2500, z:-2000, size:24, texture:"white.png", glowColor:0xaaddff },

{ name:'Tarazed', x:8800, y:-1000, z:2100, size:24, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Tarf', x:4500, y:-800, z:-200, size:20, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Thuban', x:3900, y:2500, z:1200, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Tureis', x:6100, y:-1800, z:-2000, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'Unukalhai', x:4500, y:1800, z:-1000, size:21, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Wasat', x:4200, y:900, z:1300, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Yed Posterior', x:4300, y:850, z:1250, size:20, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Yed Prior', x:4200, y:820, z:1200, size:20, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Zaniah', x:4100, y:2100, z:900, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Zaurak', x:5200, y:-2000, z:1300, size:22, texture:"red.png", glowColor:0xff6666 },

{ name:'Zibal', x:5400, y:-2100, z:1400, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Zosma', x:3900, y:2000, z:800, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Menkalinan', x:5200, y:1900, z:-900, size:22, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Menkent', x:4700, y:-2100, z:-1500, size:23, texture:"white.png", glowColor:0xaaddff },
{ name:'Menkib', x:6300, y:-1500, z:-1800, size:24, texture:"white.png", glowColor:0xaaddff },

{ name:'Mesarthim', x:4300, y:1700, z:-1100, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Mothallah', x:4500, y:1800, z:-1000, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Muscida', x:4100, y:2100, z:950, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Nashira', x:7000, y:600, z:1600, size:21, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Nembus', x:7300, y:1300, z:2100, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Nihal', x:6000, y:-1700, z:-1800, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'Okul', x:4300, y:-800, z:-300, size:20, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Phact', x:4400, y:-700, z:-500, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Pherkad', x:3800, y:2400, z:1100, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Porrima', x:4100, y:2000, z:900, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Praecipua', x:3900, y:2300, z:1000, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Rana', x:6000, y:-1500, z:-1600, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Rasalas', x:4200, y:2100, z:900, size:21, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Rastaban', x:4100, y:2400, z:1100, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Rotanev', x:3800, y:2000, z:850, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Ruchbah', x:7400, y:1600, z:2100, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Sadalbari', x:7200, y:600, z:1700, size:21, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Sadachbia', x:7100, y:650, z:1750, size:21, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Sadr', x:6400, y:2800, z:3500, size:25, texture:"white.png", glowColor:0xaaddff },

{ name:'Segin', x:7300, y:1500, z:2100, size:20, texture:"white.png", glowColor:0xaaddff },
{ name:'Seginus', x:3900, y:2100, z:900, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Sham', x:7400, y:700, z:1800, size:21, texture:"white.png", glowColor:0xaaddff },
{ name:'Sheratan', x:4300, y:1700, z:-1200, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Situla', x:7100, y:600, z:1650, size:21, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Skat', x:7200, y:650, z:1700, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Spiculum', x:4600, y:-900, z:-1400, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Sterope', x:3800, y:2200, z:900, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Suhail', x:5600, y:-2500, z:-2000, size:24, texture:"white.png", glowColor:0xaaddff },

{ name:'Tarazed', x:8800, y:-1000, z:2100, size:24, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Tarf', x:4500, y:-800, z:-200, size:20, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Thuban', x:3900, y:2500, z:1200, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Tureis', x:6100, y:-1800, z:-2000, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'Unukalhai', x:4500, y:1800, z:-1000, size:21, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Wasat', x:4200, y:900, z:1300, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Yed Posterior', x:4300, y:850, z:1250, size:20, texture:"sun.jpg", glowColor:0xffcc88 },
{ name:'Yed Prior', x:4200, y:820, z:1200, size:20, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'Zaniah', x:4100, y:2100, z:900, size:20, texture:"white.png", glowColor:0xaaddff },

{ name:'Zaurak', x:5200, y:-2000, z:1300, size:22, texture:"red.png", glowColor:0xff6666 },

{ name:'Zibal', x:5400, y:-2100, z:1400, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'Zosma', x:3900, y:2000, z:800, size:21, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 197345', x:9100, y:1200, z:3300, size:24, texture:"white.png", glowColor:0xaaddff },
{ name:'HD 198149', x:3600, y:2000, z:850, size:18, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 199178', x:3500, y:2100, z:800, size:17, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 200905', x:8800, y:-800, z:2100, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 202109', x:4200, y:2100, z:900, size:20, texture:"sun.jpg", glowColor:0xffcc88 },

{ name:'HD 203608', x:-1800, y:300, z:-2100, size:14, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 204867', x:5400, y:-1900, z:-1600, size:24, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 206778', x:5600, y:-2000, z:-1800, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 207129', x:-1600, y:280, z:-2000, size:14, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 208947', x:3800, y:2100, z:850, size:19, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 210027', x:3700, y:2000, z:900, size:18, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 210418', x:8900, y:1100, z:3000, size:24, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 212061', x:4100, y:2100, z:950, size:18, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 213558', x:4200, y:2000, z:800, size:19, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 214680', x:6100, y:-1800, z:-2000, size:26, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 216228', x:5600, y:-2000, z:-1700, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 216735', x:5700, y:-2100, z:-1800, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 217014', x:-1700, y:250, z:-2100, size:14, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 218045', x:3500, y:2000, z:850, size:18, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 219134', x:-1800, y:300, z:-2000, size:14, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 220009', x:3600, y:2100, z:900, size:19, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 220657', x:3700, y:2000, z:850, size:18, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 221345', x:3800, y:2100, z:900, size:18, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 222603', x:3900, y:2200, z:900, size:19, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 223352', x:4000, y:2100, z:850, size:18, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 224617', x:4100, y:2200, z:900, size:18, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 225239', x:4200, y:2100, z:850, size:18, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 226868', x:5300, y:-2000, z:-1500, size:28, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 22879', x:-1800, y:250, z:-2100, size:14, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 23249', x:-1700, y:260, z:-2200, size:15, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 23439', x:-1600, y:280, z:-2100, size:14, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 24040', x:-1800, y:270, z:-2000, size:15, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 241253', x:6000, y:-1500, z:-1700, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 24398', x:6100, y:-1400, z:-1600, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 24912', x:6200, y:-1500, z:-1700, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 25291', x:6300, y:-1600, z:-1800, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 25443', x:6400, y:-1700, z:-1900, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 25680', x:6500, y:-1800, z:-2000, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 25940', x:6600, y:-1900, z:-2100, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 26311', x:6700, y:-2000, z:-2200, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 26764', x:6800, y:-2100, z:-2300, size:23, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 26965', x:-1500, y:250, z:-2000, size:14, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 27256', x:6900, y:-2200, z:-2400, size:22, texture:"white.png", glowColor:0xaaddff },

{ name:'HD 27442', x:-1600, y:240, z:-2100, size:15, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 27894', x:-1700, y:260, z:-2200, size:15, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 28185', x:-1800, y:280, z:-2300, size:15, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 285507', x:-1900, y:300, z:-2400, size:15, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 28677', x:-2000, y:320, z:-2400, size:15, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 29587', x:-2100, y:350, z:-2500, size:15, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 29992', x:-2200, y:370, z:-2600, size:15, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 30652', x:-1800, y:300, z:-2300, size:16, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 32147', x:-1700, y:280, z:-2200, size:15, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 32923', x:-1600, y:260, z:-2100, size:15, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 33636', x:-1500, y:250, z:-2000, size:16, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 34411', x:-1400, y:240, z:-1900, size:16, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 35296', x:-1300, y:220, z:-1800, size:15, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 35759', x:-1200, y:210, z:-1700, size:15, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 36395', x:-1100, y:200, z:-1600, size:15, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 37124', x:-1000, y:190, z:-1500, size:16, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 37605', x:-900, y:180, z:-1400, size:16, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 38529', x:-800, y:170, z:-1300, size:17, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 38858', x:-700, y:160, z:-1200, size:16, texture:"sun.jpg", glowColor:0xffee99 },

{ name:'HD 39587', x:-600, y:150, z:-1100, size:16, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 40105', x:-500, y:140, z:-1000, size:16, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 40979', x:-400, y:130, z:-900, size:16, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 41593', x:-300, y:120, z:-800, size:16, texture:"sun.jpg", glowColor:0xffee99 },
{ name:'HD 42024', x:-200, y:110, z:-700, size:16, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 42618', x:-100, y:100, z:-600, size:16, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 43042', x:0, y:90, z:-500, size:16, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 43691', x:100, y:80, z:-400, size:17, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 44219', x:200, y:70, z:-300, size:17, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 44743', x:300, y:60, z:-200, size:17, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 45184', x:400, y:50, z:-100, size:17, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 45557', x:500, y:40, z:0, size:17, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 45810', x:600, y:30, z:100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 46375', x:700, y:20, z:200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 47186', x:800, y:10, z:300, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 47536', x:900, y:0, z:400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 48265', x:1000, y:-10, z:500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 48805', x:1100, y:-20, z:600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 49674', x:1200, y:-30, z:700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 50499', x:1300, y:-40, z:800, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 50554', x:1400, y:-50, z:900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 50692', x:1500, y:-60, z:1000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 50806', x:1600, y:-70, z:1100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 51419', x:1700, y:-80, z:1200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 52265', x:1800, y:-90, z:1300, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 53143', x:1900, y:-100, z:1400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 53680', x:2000, y:-110, z:1500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 54371', x:2100, y:-120, z:1600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 54810', x:2200, y:-130, z:1700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 55575', x:2300, y:-140, z:1800, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 56030', x:2400, y:-150, z:1900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 56537', x:2500, y:-160, z:2000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 57095', x:2600, y:-170, z:2100, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 57167', x:2700, y:-180, z:2200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 57370', x:2800, y:-190, z:2300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 57682', x:2900, y:-200, z:2400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 57906', x:3000, y:-210, z:2500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 58207', x:3100, y:-220, z:2600, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 58510', x:3200, y:-230, z:2700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 58855', x:3300, y:-240, z:2800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 59067', x:3400, y:-250, z:2900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 59374', x:3500, y:-260, z:3000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 59686', x:3600, y:-270, z:3100, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 59984', x:3700, y:-280, z:3200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 60319', x:3800, y:-290, z:3300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 60652', x:3900, y:-300, z:3400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 60986', x:4000, y:-310, z:3500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 61317', x:4100, y:-320, z:3600, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 61606', x:4200, y:-330, z:3700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 61935', x:4300, y:-340, z:3800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 62237', x:4400, y:-350, z:3900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 62613', x:4500, y:-360, z:4000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 62902', x:4600, y:-370, z:4100, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 63165', x:4700, y:-380, z:4200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 63433', x:4800, y:-390, z:4300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 63765', x:4900, y:-400, z:4400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 64090', x:5000, y:-410, z:4500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 64468', x:5100, y:-420, z:4600, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 64740', x:5200, y:-430, z:4700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 65093', x:5300, y:-440, z:4800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 65430', x:5400, y:-450, z:4900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 65810', x:5500, y:-460, z:5000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 66141', x:5600, y:-470, z:5100, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 66428', x:5700, y:-480, z:5200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 66751', x:5800, y:-490, z:5300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 67006', x:5900, y:-500, z:5400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 67334', x:6000, y:-510, z:5500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 67605', x:6100, y:-520, z:5600, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 67925', x:6200, y:-530, z:5700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 68257', x:6300, y:-540, z:5800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 68517', x:6400, y:-550, z:5900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 68892', x:6500, y:-560, z:6000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 69267', x:6600, y:-570, z:6100, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 69582', x:6700, y:-580, z:6200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 69960', x:6800, y:-590, z:6300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 70272', x:6900, y:-600, z:6400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 70642', x:7000, y:-610, z:6500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 70988', x:7100, y:-620, z:6600, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 71334', x:7200, y:-630, z:6700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 71683', x:7300, y:-640, z:6800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 72067', x:7400, y:-650, z:6900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 72468', x:7500, y:-660, z:7000, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 72892', x:7600, y:-670, z:7100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 73256', x:7700, y:-680, z:7200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 73526', x:7800, y:-690, z:7300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 74156', x:7900, y:-700, z:7400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 74497', x:8000, y:-710, z:7500, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 74874', x:8100, y:-720, z:7600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 75289', x:8200, y:-730, z:7700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 75732', x:8300, y:-740, z:7800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 76151', x:8400, y:-750, z:7900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 76445', x:8500, y:-760, z:8000, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 76700', x:8600, y:-770, z:8100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 77065', x:8700, y:-780, z:8200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 77407', x:8800, y:-790, z:8300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 77825', x:8900, y:-800, z:8400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 78235', x:9000, y:-810, z:8500, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 78558', x:9100, y:-820, z:8600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 78902', x:9200, y:-830, z:8700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 79210', x:9300, y:-840, z:8800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 79555', x:9400, y:-850, z:8900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 79969', x:9500, y:-860, z:9000, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 80367', x:9600, y:-870, z:9100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 80606', x:9700, y:-880, z:9200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 81040', x:9800, y:-890, z:9300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 81485', x:9900, y:-900, z:9400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 81809', x:10000, y:-910, z:9500, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 82286', x:10100, y:-920, z:9600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 82668', x:10200, y:-930, z:9700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 82943', x:10300, y:-940, z:9800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 83443', x:10400, y:-950, z:9900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 83808', x:10500, y:-960, z:10000, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 84117', x:10600, y:-970, z:10100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 84441', x:10700, y:-980, z:10200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 84737', x:10800, y:-990, z:10300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 85157', x:10900, y:-1000, z:10400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 85512', x:11000, y:-1010, z:10500, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 85859', x:11100, y:-1020, z:10600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 86146', x:11200, y:-1030, z:10700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 86436', x:11300, y:-1040, z:10800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 86728', x:11400, y:-1050, z:10900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 87007', x:11500, y:-1060, z:11000, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 87359', x:11600, y:-1070, z:11100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 87646', x:11700, y:-1080, z:11200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 87901', x:11800, y:-1090, z:11300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 88215', x:11900, y:-1100, z:11400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 88609', x:12000, y:-1110, z:11500, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 88986', x:12100, y:-1120, z:11600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 89307', x:12200, y:-1130, z:11700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 89744', x:12300, y:-1140, z:11800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 90156', x:12400, y:-1150, z:11900, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 90520', x:12500, y:-1160, z:12000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 90839', x:12600, y:-1170, z:12100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 91128', x:12700, y:-1180, z:12200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 91480', x:12800, y:-1190, z:12300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 91752', x:12900, y:-1200, z:12400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 92043', x:13000, y:-1210, z:12500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 92385', x:13100, y:-1220, z:12600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 92680', x:13200, y:-1230, z:12700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 93083', x:13300, y:-1240, z:12800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 93396', x:13400, y:-1250, z:12900, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 93738', x:13500, y:-1260, z:13000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 94028', x:13600, y:-1270, z:13100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 94389', x:13700, y:-1280, z:13200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 94683', x:13800, y:-1290, z:13300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 95089', x:13900, y:-1300, z:13400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 95338', x:14000, y:-1310, z:13500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 95650', x:14100, y:-1320, z:13600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 96063', x:14200, y:-1330, z:13700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 96423', x:14300, y:-1340, z:13800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 96700', x:14400, y:-1350, z:13900, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 97037', x:14500, y:-1360, z:14000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 97343', x:14600, y:-1370, z:14100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 97658', x:14700, y:-1380, z:14200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 97916', x:14800, y:-1390, z:14300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 98230', x:14900, y:-1400, z:14400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 98553', x:15000, y:-1410, z:14500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 98800', x:15100, y:-1420, z:14600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 99109', x:15200, y:-1430, z:14700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 99492', x:15300, y:-1440, z:14800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 99806', x:15400, y:-1450, z:14900, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 100180', x:15500, y:-1460, z:15000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 100777', x:15600, y:-1470, z:15100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 101259', x:15700, y:-1480, z:15200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 101501', x:15800, y:-1490, z:15300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 102117', x:15900, y:-1500, z:15400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 102365', x:16000, y:-1510, z:15500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 102438', x:16100, y:-1520, z:15600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 103095', x:16200, y:-1530, z:15700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 103197', x:16300, y:-1540, z:15800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 103774', x:16400, y:-1550, z:15900, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 104067', x:16500, y:-1560, z:16000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 104304', x:16600, y:-1570, z:16100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 104985', x:16700, y:-1580, z:16200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 105113', x:16800, y:-1590, z:16300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 105405', x:16900, y:-1600, z:16400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 105618', x:17000, y:-1610, z:16500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 105936', x:17100, y:-1620, z:16600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 106116', x:17200, y:-1630, z:16700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 106252', x:17300, y:-1640, z:16800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 106515', x:17400, y:-1650, z:16900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 106760', x:17500, y:-1660, z:17000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 107148', x:17600, y:-1670, z:17100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 107213', x:17700, y:-1680, z:17200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 107383', x:17800, y:-1690, z:17300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 107692', x:17900, y:-1700, z:17400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 108147', x:18000, y:-1710, z:17500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 108309', x:18100, y:-1720, z:17600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 108874', x:18200, y:-1730, z:17700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 109085', x:18300, y:-1740, z:17800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 109271', x:18400, y:-1750, z:17900, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 109358', x:18500, y:-1760, z:18000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 109749', x:18600, y:-1770, z:18100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 109988', x:18700, y:-1780, z:18200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 110014', x:18800, y:-1790, z:18300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 110067', x:18900, y:-1800, z:18400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 110113', x:19000, y:-1810, z:18500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 110537', x:19100, y:-1820, z:18600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 110897', x:19200, y:-1830, z:18700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 111031', x:19300, y:-1840, z:18800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 111232', x:19400, y:-1850, z:18900, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 111395', x:19500, y:-1860, z:19000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 111998', x:19600, y:-1870, z:19100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 112164', x:19700, y:-1880, z:19200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 112410', x:19800, y:-1890, z:19300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 112863', x:19900, y:-1900, z:19400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 113226', x:20000, y:-1910, z:19500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 113538', x:20100, y:-1920, z:19600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 113996', x:20200, y:-1930, z:19700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 114174', x:20300, y:-1940, z:19800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 114386', x:20400, y:-1950, z:19900, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 114613', x:20500, y:-1960, z:20000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 114729', x:20600, y:-1970, z:20100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 115202', x:20700, y:-1980, z:20200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 115383', x:20800, y:-1990, z:20300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 115617', x:20900, y:-2000, z:20400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 115892', x:21000, y:-2010, z:20500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 116029', x:21100, y:-2020, z:20600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 116114', x:21200, y:-2030, z:20700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 116515', x:21300, y:-2040, z:20800, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 116655', x:21400, y:-2050, z:20900, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 117176', x:21500, y:-2060, z:21000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 117207', x:21600, y:-2070, z:21100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 117618', x:21700, y:-2080, z:21200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 117936', x:21800, y:-2090, z:21300, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 118203', x:21900, y:-2100, z:21400, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 118475', x:22000, y:-2110, z:21500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 118904', x:22100, y:-2120, z:21600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 119022', x:22200, y:-2130, z:21700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 119850', x:22300, y:-2140, z:21800, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 120066', x:22400, y:-2150, z:21900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 120136', x:22500, y:-2160, z:22000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 120420', x:22600, y:-2170, z:22100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 120690', x:22700, y:-2180, z:22200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 120987', x:22800, y:-2190, z:22300, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 121263', x:22900, y:-2200, z:22400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 121504', x:23000, y:-2210, z:22500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 121801', x:23100, y:-2220, z:22600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 122064', x:23200, y:-2230, z:22700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 122303', x:23300, y:-2240, z:22800, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 122652', x:23400, y:-2250, z:22900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 122742', x:23500, y:-2260, z:23000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 123265', x:23600, y:-2270, z:23100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 123999', x:23700, y:-2280, z:23200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 124292', x:23800, y:-2290, z:23300, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 124642', x:23900, y:-2300, z:23400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 124897', x:24000, y:-2310, z:23500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 125072', x:24100, y:-2320, z:23600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 125161', x:24200, y:-2330, z:23700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 125276', x:24300, y:-2340, z:23800, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 125451', x:24400, y:-2350, z:23900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 125612', x:24500, y:-2360, z:24000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 125988', x:24600, y:-2370, z:24100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 126053', x:24700, y:-2380, z:24200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 126203', x:24800, y:-2390, z:24300, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 126512', x:24900, y:-2400, z:24400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 126614', x:25000, y:-2410, z:24500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 126868', x:25100, y:-2420, z:24600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 127334', x:25200, y:-2430, z:24700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 127506', x:25300, y:-2440, z:24800, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 127762', x:25400, y:-2450, z:24900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 128311', x:25500, y:-2460, z:25000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 128620', x:25600, y:-2470, z:25100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 128621', x:25700, y:-2480, z:25200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 128898', x:25800, y:-2490, z:25300, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 129116', x:25900, y:-2500, z:25400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 129333', x:26000, y:-2510, z:25500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 129814', x:26100, y:-2520, z:25600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 130322', x:26200, y:-2530, z:25700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 130948', x:26300, y:-2540, z:25800, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 131156', x:26400, y:-2550, z:25900, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 131511', x:26500, y:-2560, z:26000, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 131977', x:26600, y:-2570, z:26100, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 132254', x:26700, y:-2580, z:26200, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 132563', x:26800, y:-2590, z:26300, size:18, texture:"sun.jpg", glowColor:0xffee99 },

// { name:'HD 132742', x:26900, y:-2600, z:26400, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 133002', x:27000, y:-2610, z:26500, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 133161', x:27100, y:-2620, z:26600, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 133640', x:27200, y:-2630, z:26700, size:18, texture:"sun.jpg", glowColor:0xffee99 },
// { name:'HD 134060', x:27300, y:-2640, z:26800, size:18, texture:"sun.jpg", glowColor:0xffee99 }
];

// Fungsi buat glow dengan warna custom
function createColoredGlow(color, size = 256){
const canvas = document.createElement("canvas");
canvas.width = canvas.height = size;
const ctx = canvas.getContext("2d");
const c = size / 2;

const r = (color >> 16) & 0xff;
const g = (color >> 8) & 0xff;
const b = color & 0xff;

const gRad = ctx.createRadialGradient(c, c, 0, c, c, c);
gRad.addColorStop(0, `rgba(${r},${g},${b},1)`);
gRad.addColorStop(0.4, `rgba(${r},${g},${b},0.6)`);
gRad.addColorStop(1, "rgba(0,0,0,0)");

ctx.fillStyle = gRad;
ctx.fillRect(0, 0, size, size);

return new THREE.CanvasTexture(canvas);
}

// Clock untuk animasi kedip
const clock = new THREE.Clock();
const extraStarObjects = []; // simpan glow untuk animasi kedip

extraStars.forEach(b => {
// 🌟 Core star
const star = new THREE.Mesh(
  new THREE.SphereGeometry(b.size, 16, 16),
  new THREE.MeshBasicMaterial({ 
    map: textureLoader.load(b.texture),
    transparent: true
  })
);

placeDeepObject(star, 4500);

// ✨ Glow sesuai warna bintang
const glowTex = createColoredGlow(b.glowColor);
const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: glowTex,
    color: 0xffffff, // putih karena texture sudah berwarna
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
glow.scale.set(b.size*4, b.size*4, 1);
star.add(glow);

star.userData.info = {
  title:"⭐ " + b.name,
  desc:"Bintang di luar Tata Surya",
  size:"Radius visual: " + b.size,
  type:"Star"
};

skyGroup.add(star);

extraStarObjects.push(glow);
});



hipparcosStars.forEach(s=>{
const star = new THREE.Mesh(
new THREE.SphereGeometry(6,12,12),
new THREE.MeshBasicMaterial({ color:0xffffff })
);
const pos = raDecToXYZ(s.ra, s.dec, 5000); // radius 5000–5500
star.position.copy(pos);
scene.add(star);
});

// ======================
// DEEP SPACE DISTRIBUTION
// ======================
function placeDeepObject(obj, radius){

    // area diperbesar 2x
    const spread = radius * 2;

    // radius acak supaya tidak numpuk
    const r = Math.pow(Math.random(), 0.6) * spread;
    
    // sudut galaksi
    const theta = Math.random() * Math.PI * 2;
    
    // posisi horizontal
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    
    // vertical spread lebih besar
    const y = (Math.random() - 0.5) * spread * 1.2;
    
    obj.position.set(x, y, z);
}



// UI & TELEPORT
let timeScale = 1;
document.getElementById('timeScale').oninput = e => timeScale = parseFloat(e.target.value);
document.getElementById('telescopeBtn').onclick = ()=> { camera.fov = camera.fov===60 ? 12 : 60; camera.updateProjectionMatrix(); };
document.getElementById("freeBtn").onclick = ()=>{

freeMode = !freeMode;

controls.enabled = !freeMode;
flyControls.enabled = freeMode;

// tampilkan kontrol mobile
if(isMobile){
const mobileControls = document.getElementById("mobileControls");

if(freeMode){
  mobileControls.style.display = "block";
}else{
  mobileControls.style.display = "none";
}
}

};

let warpActive = false;
let warpPower = 0;
function teleportTo(target, offset = new THREE.Vector3(0,0,500)){
warpActive = true;
warpPower = 1;

const warpSteps = 25;
const startPos = camera.position.clone();

// ✅ AMBIL WORLD POSITION (INI KUNCI)
const worldPos = new THREE.Vector3();
target.getWorldPosition(worldPos);

// arah kamera → target
const dir = new THREE.Vector3()
  .subVectors(camera.position, worldPos)
  .normalize();

const endPos = worldPos.clone().add(dir.multiplyScalar(offset.length()));

let step = 0;

function warpAnim(){
  step++;
  camera.position.lerpVectors(startPos, endPos, step / warpSteps);
  warpPower = 1 - step / warpSteps;

  if(step < warpSteps){
    requestAnimationFrame(warpAnim);
  }else{
    controls.target.copy(worldPos);
    warpActive = false;
  }
}

warpAnim();
camera.lookAt(worldPos);
}


// ======================
// TELEPORT PANEL UI
// ======================
const teleportPanel = document.getElementById("teleportPanel");

document.getElementById("openTeleport").onclick = ()=>{
teleportPanel.style.left = "0";
};

document.getElementById("closeTeleport").onclick = ()=>{
teleportPanel.style.left = "-260px";
};

// TELEPORT ACTIONS
document.getElementById("tpEarth").onclick = ()=>{
teleportTo(earthMesh, new THREE.Vector3(0,0,30));
};

document.getElementById("tpMoon").onclick = ()=>{
teleportTo(moon, new THREE.Vector3(0,0,10));
};

document.getElementById("tpOrion").onclick = ()=>{
teleportTo(orion, new THREE.Vector3(0,500,1000));
};

document.getElementById("tpBlackHole").onclick = ()=>{
teleportTo(blackHole, new THREE.Vector3(0,300,1000));
};

document.getElementById("tpPleiades").onclick = ()=>{
teleportTo(pleiades, new THREE.Vector3(0,100,500));
};


function animate(){
requestAnimationFrame(animate);



// update planet
planets.forEach(p=>{
  p.userData.angle += p.userData.speed*0.001*timeScale;
  const r = (p.userData.a*(1-p.userData.e**2)) / (1+p.userData.e*Math.cos(p.userData.angle));
p.position.set(
Math.cos(p.userData.angle) * r,
Math.sin(p.userData.angle * 0.5) * 8, // variasi Y alami
Math.sin(p.userData.angle) * r
);
  if(p.userData.label){
    const vector = new THREE.Vector3();
    p.getWorldPosition(vector);
    vector.project(camera);
    const x = (vector.x * 0.5 + 0.5) * innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * innerHeight;
    p.userData.label.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
  }
});

// update moon
moon.userData.angle += 0.02*timeScale;
moon.position.x = Math.cos(moon.userData.angle)*15;
moon.position.z = Math.sin(moon.userData.angle)*15;

// Sagittarius A* dynamics
sagDisk.rotation.z += 0.004 * timeScale;
sagLens.rotation.z -= 0.002 * timeScale;


// Update pulsar opacity
pulsars.forEach((p, i) => {
  const star = skyGroup.children[i]; // asumsi urutan sama
  const time = performance.now() * 0.001; // detik
  star.material.opacity = 0.5 + 0.5 * Math.sin(time * star.userData.pulseSpeed * 10 + star.userData.pulseOffset);
});

// controls
if(freeMode){
if(!isMobile){
  flyControls.update(0.02);
}
}else{
controls.update();
}

meteors.forEach(m=>{
  m.position.add(m.userData.velocity);
});
if(issModel){
  issAngle += 0.01;
  issModel.position.set(
    Math.cos(issAngle) * 18,
    2,
    Math.sin(issAngle) * 18
  );
  issModel.rotation.y += 0.01;
}

const d = camera.position.distanceTo(blackHole.position);

if(d < 1200){
  const s = (1200 - d) / 1200;

  lensRing.rotation.z += 0.02 + s*0.08;
  lensRing.scale.setScalar(1 + s*0.8);
  lensRing.material.opacity = 0.2 + s*0.5;

  disk.rotation.z += 0.03 + s*0.1;

  lensRing.scale.setScalar(1 + s*1.2);
disk.scale.setScalar(1 + s*0.6);
}else{
  lensRing.material.opacity *= 0.96;
}

meteors.forEach(m => {
m.position.add(m.userData.velocity);

// fade out natural
m.userData.life += 0.02;
m.material.opacity = Math.max(0, 0.9 - m.userData.life);
});
skyGroup.rotation.y += SIDEREAL_SPEED * timeScale;
sagA.rotation.y -= SIDEREAL_SPEED * timeScale * 0.4;

// ==========================
// MOBILE FREE FLY MOVEMENT
// ==========================
if(isMobile && freeMode){
const speed = 0.6 * timeScale;

const dir = new THREE.Vector3();
camera.getWorldDirection(dir);

const right = new THREE.Vector3();
right.crossVectors(dir, camera.up).normalize();

if(moveState.forward) camera.position.add(dir.clone().multiplyScalar(speed));
if(moveState.back)    camera.position.add(dir.clone().multiplyScalar(-speed));
if(moveState.left)    camera.position.add(right.clone().multiplyScalar(-speed));
if(moveState.right)   camera.position.add(right.clone().multiplyScalar(speed));
if(moveState.up)      camera.position.y += speed;
if(moveState.down)    camera.position.y -= speed;
}


renderer.render(scene,camera);
}

const SIDEREAL_SPEED = 0.0000729; // rad/frame (simulasi)

animate();
// ===== ADD FEATURE D : CLICK OBJECT INFO =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('dblclick', (e) => {

mouse.x = (e.clientX / innerWidth) * 2 - 1;
mouse.y = -(e.clientY / innerHeight) * 2 + 1;

raycaster.setFromCamera(mouse, camera);

const hits = raycaster.intersectObjects(scene.children, true);
if(!hits.length) return;

let target = hits[0].object;
while(target && !target.userData.info){
target = target.parent;
}

if(target && target.userData.info){
showInfo(target.userData.info); // ✅ INFO SAJA
}
});



// ===== ADD FEATURE F : BLACK HOLE WARP =====
function blackHoleWarp(){
  const d = camera.position.distanceTo(blackHole.position);
  if(d < 900){
    camera.fov = 60 + (900-d)*0.03;
    camera.updateProjectionMatrix();
  }
}

// ======================
// GAIA DR3 STAR LOADER
// ======================
const gaiaGroup = new THREE.Group();
scene.add(gaiaGroup);
function createStarSprite(size){
const canvas = document.createElement("canvas");
canvas.width = canvas.height = 64;
const ctx = canvas.getContext("2d");

const g = ctx.createRadialGradient(32,32,2,32,32,32);
g.addColorStop(0,"rgba(255,255,255,1)");
g.addColorStop(0.4,"rgba(255,255,255,0.9)");
g.addColorStop(1,"rgba(255,255,255,0)");

ctx.fillStyle = g;
ctx.fillRect(0,0,64,64);

const tex = new THREE.CanvasTexture(canvas);

return new THREE.Sprite(
new THREE.SpriteMaterial({
map: tex,
transparent: true,
depthWrite: false
})
);
}

function loadGaiaStars(scene){
fetch('gaia.csv')
.then(res => res.text())
.then(text => {
  const lines = text.split('\n').slice(1);
  const positions = [];
  const colors = [];
  const clickableStars = new THREE.Group();

  const centerPos = new THREE.Vector3(0,0,0); // pusat galaksi

  lines.forEach((line, i)=>{
    if(!line.trim()) return;
    const [source_id, ra, dec, parallax, pmra, pmdec, mag] = line.split(',').map(Number);
    if(!parallax || parallax <= 0) return;

    let distPc = 1000 / parallax;
    if(distPc > 10000) return; // local bubble only

    const SCALE = 1;
    const jitter = 0.7 + Math.random() * 0.6;

    // radius acak untuk sebar bintang, pangkat 0.6 biar distribusi lebih natural
    const radius = 8000 + Math.random() * 2000; // antara 8000–10000, sesuai sphere milkyWay


    // arah acak sphere
// radius galaksi dari pusat
const rMin = 2000;   // jarak minimum dari pusat galaksi
const rMax = 15000;  // jarak maksimum

// arah acak spherical
const u = Math.random();       
const v = Math.random();       
const theta = u * 2 * Math.PI; 
const phi = Math.acos(2 * v - 1); 

// radius acak antara rMin dan rMax
const r = rMin + Math.random() * (rMax - rMin);

const x = r * Math.sin(phi) * Math.cos(theta);
const y = r * Math.sin(phi) * Math.sin(theta);
const z = r * Math.cos(phi);





    // point cloud (semua bintang)
    positions.push(x, y, z);
    const b = Math.max(0.2, 1.4 - mag * 0.15);
    colors.push(1, 1, 1);

    // hanya bintang terang jadi sprite mesh
    if(mag < 6){
      const star = createStarSprite(1);
      const size = Math.max(4, 12 - mag * 1.5);
      star.scale.set(size, size, size);
      star.position.set(x, y, z);

      star.userData.info = {
        title: "⭐ Gaia Star",
        desc: "Bintang dari katalog Gaia DR3",
        size: "Magnitude: " + mag.toFixed(2),
        type: "Gaia DR3 Star"
      };

      clickableStars.add(star);
    }
  });

  // buat point cloud
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true
  });

  const gaiaPoints = new THREE.Points(geometry, material);

  gaiaGroup.add(gaiaPoints);
  gaiaGroup.add(clickableStars);

  console.log("Gaia stars loaded:", positions.length / 3);
  console.log("Clickable Gaia stars:", clickableStars.children.length);
});
}

