import * as THREE from "three";
import {OrbitControls} from "jsm/controls/OrbitControls.js" ;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, -10, 20);     
camera.lookAt(5, 5, 0);             
camera.fov = 60;
camera.updateProjectionMatrix();
const canvas = document.getElementById("solarCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });


renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


function createPlanetWithOrbit(name, orbitRadius, size, speed, tilt = Math.PI / 4) {
  const orbitGroup = new THREE.Group();
  orbitGroup.rotation.x = tilt;
  scene.add(orbitGroup);

  const pivot = new THREE.Object3D();
  orbitGroup.add(pivot);

  
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ 
    map: loader.load("./textures/" + name.toLowerCase() + ".jpg"),
   });
  const planet = new THREE.Mesh(geometry, material);
  const randomAngle = Math.random() * Math.PI * 2;
  planet.position.set(
    Math.cos(randomAngle) * orbitRadius,
    0,
    Math.sin(randomAngle) * orbitRadius
  );
  pivot.add(planet);

  // Orbit ring
  const points = [];
  const segments = 100;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * orbitRadius, 0, Math.sin(theta) * orbitRadius));
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbitGroup.add(orbitLine);

  return { name, pivot, speed, mesh: planet };

}

const planets = [
  createPlanetWithOrbit("2k_mercury", 6, 0.2, 0.02),
  createPlanetWithOrbit("8k_venus_surface", 8, 0.4, 0.015),
  createPlanetWithOrbit("8k_earth_daymap", 10, 0.9, 0.01),
  createPlanetWithOrbit("8k_mars", 13, 0.8, 0.008),
  createPlanetWithOrbit("8k_jupiter", 20, 2, 0.006),
  createPlanetWithOrbit("8k_saturn", 30, 1.9, 0.005),
  createPlanetWithOrbit("2k_uranus", 50, 1.5, 0.004),
  createPlanetWithOrbit("2k_neptune", 70, 1.4, 0.003)
];



function addSaturnRing(saturnMesh, radiusInner = 2.4, radiusOuter = 3.2) {
  const ringGeo = new THREE.RingGeometry(radiusInner, radiusOuter, 64);
  
  const ringTex = new THREE.TextureLoader().load("./textures/8k_saturn_ring_alpha.png");
  const ringMat = new THREE.MeshStandardMaterial({
  map: ringTex,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.8,
});


  const ring = new THREE.Mesh(ringGeo, ringMat);

  // horizontal
  ring.geometry.rotateX(Math.PI / 2); 
  // slightly below center of Saturn
  ring.position.y = -0.05; 

  saturnMesh.add(ring);
}


const saturn = planets[5];
addSaturnRing(saturn.mesh);


function addStarField(count = 5000, spread = 1000) {
  const positions = [];
  const colors = [];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * spread;
    const y = (Math.random() - 0.5) * spread;
    const z = (Math.random() - 0.5) * spread;
    positions.push(x, y, z);

    //Random pastel star colors
    const color = new THREE.Color(
      0.8 + Math.random() * 0.2, // R
      0.8 + Math.random() * 0.2, // G
      0.8 + Math.random() * 0.2  // B
    );
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  // Colored stars
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); 

  const material = new THREE.PointsMaterial({
    size: 0.7,
    vertexColors: true, 
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  return stars; 
}

addStarField(4000, 1000); 




function createAsteroidBelt(innerRadius, outerRadius, count = 200) {
  const asteroidGroup = new THREE.Group();

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.random() - 0.5) * 0.4; 

    const geo = new THREE.SphereGeometry(Math.random() * 0.1, 6, 6);
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const asteroid = new THREE.Mesh(geo, mat);
    asteroid.position.set(x, y, z);

    asteroidGroup.add(asteroid);
  }

  // Optionally tilt the asteroid belt for consistency with planet orbits
  asteroidGroup.rotation.x = Math.PI / 4;

  scene.add(asteroidGroup);
  return asteroidGroup;
}
const asteroidGroup =  createAsteroidBelt(15, 16.5, 2000);

// Sun
const loader = new THREE.TextureLoader();
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshStandardMaterial({ 
    map: loader.load("./textures/8k_sun.jpg"),
 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Moon orbiting Earth
function addMoonToEarth(earthPivot, moonTexturePath = "./textures/8k_moon.jpg") {
  const moonPivot = new THREE.Object3D(); 
  earthPivot.children[0].add(moonPivot); 

  const moonGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const moonMat = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(moonTexturePath),
  });
  const moon = new THREE.Mesh(moonGeo, moonMat);
  // Distance from Earth
  moon.position.x = 1.5; 
  moonPivot.add(moon);

  return { pivot: moonPivot, moon };
}

const earthObj = planets[2]; 
const moonData = addMoonToEarth(earthObj.pivot);

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.autoRotate = false;


function createTextLabel(text, size = 40, color = "#ffffff") {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = `${size}px Arial`;
  context.fillStyle = color;
  context.fillText(text, 0, size);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(5, 2.5, 1);
  return sprite;
}

const planetNames = [
  "Mercury", "Venus", "Earth", "Mars", 
  "Jupiter", "Saturn", "Uranus", "Neptune"
];

planets.forEach((planetObj, i) => {
  const label = createTextLabel(planetNames[i]);
  label.position.set(0, planetObj.mesh.geometry.parameters.radius + 0.2, 0); 
  planetObj.mesh.add(label); 
});

const label = createTextLabel("Sun", 50, "#ffffff");
label.position.set(0, sun.geometry.parameters.radius + 0.5, 0);
scene.add(label); 




// Animation
function animate() {
  requestAnimationFrame(animate);
  sun.rotation.y += 0.001;
  planets.forEach(p => {
    p.pivot.rotation.y += p.speed;
  });
  asteroidGroup.children.forEach(asteroid => {
  asteroid.rotation.x += 0.01 * Math.random();
  asteroid.rotation.y += 0.01 * Math.random();
  moonData.pivot.rotation.y += 0.0000001;

});

  asteroidGroup.rotation.y += 0.001;
  renderer.render(scene, camera);
}
animate();
