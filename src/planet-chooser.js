import * as THREE from "three";
import { createAssetLoadingManager } from "./loading-screen.js";
import { APP_PAUSE_CHANGED_EVENT, setupPlanetChooserInteractions } from "./planet-interactions.js";

const sizes = {
  width: 1050,
  height: 80
}

const cameraViewWidth = 120;
const cameraViewHeight = cameraViewWidth * (sizes.height / sizes.width);
const cameraVerticalOffset = 0.25;

const chooserToggleButton = document.querySelector(".planet-chooser-toggle");
const chooserPanel = document.querySelector(".planet-chooser-panel");
const chooserCloseButton = document.querySelector(".planet-chooser-panel__close");
const pauseButton = document.querySelector(".pause-button");
const infoButton = document.querySelector(".info-button");
const CHOOSER_PANEL_TRANSITION_MS = 540;
const CHOOSER_CLOSE_FADE_MS = 160;
const APP_PANEL_OPENING_EVENT = "app-panel-opening";
const CHOOSER_PANEL_NAME = "planet-chooser";
let chooserCloseTimeout;
let chooserContentTimeout;
let isPaused = false;

const openPlanetChooser = () => {
  window.clearTimeout(chooserCloseTimeout);
  window.clearTimeout(chooserContentTimeout);
  window.dispatchEvent(new CustomEvent(APP_PANEL_OPENING_EVENT, {
    detail: { panel: CHOOSER_PANEL_NAME },
  }));
  chooserToggleButton.classList.add("is-hidden");
  chooserPanel.hidden = false;
  chooserPanel.classList.remove("is-closing", "is-content-hiding", "is-content-visible");
  chooserToggleButton.setAttribute("aria-expanded", "true");

  window.requestAnimationFrame(() => {
    chooserPanel.classList.add("is-open");
    chooserContentTimeout = window.setTimeout(() => {
      chooserPanel.classList.add("is-content-visible");
      chooserCloseButton.focus();
    }, CHOOSER_PANEL_TRANSITION_MS);
  });
};

const closePlanetChooser = ({ restoreFocus = true } = {}) => {
  if (chooserPanel.hidden) {
    return;
  }

  window.clearTimeout(chooserCloseTimeout);
  window.clearTimeout(chooserContentTimeout);
  chooserPanel.classList.add("is-content-hiding");
  chooserPanel.classList.remove("is-content-visible");
  chooserToggleButton.setAttribute("aria-expanded", "false");

  chooserContentTimeout = window.setTimeout(() => {
    chooserPanel.classList.add("is-closing");
    chooserPanel.classList.remove("is-open");

    chooserCloseTimeout = window.setTimeout(() => {
      chooserPanel.hidden = true;
      chooserPanel.classList.remove("is-closing", "is-content-hiding");
      chooserToggleButton.classList.remove("is-hidden");

      if (restoreFocus) {
        chooserToggleButton.focus();
      }
    }, CHOOSER_PANEL_TRANSITION_MS);
  }, CHOOSER_CLOSE_FADE_MS);
};

chooserToggleButton.addEventListener("click", openPlanetChooser);
chooserCloseButton.addEventListener("click", closePlanetChooser);

window.addEventListener(APP_PANEL_OPENING_EVENT, (event) => {
  if (event.detail.panel !== CHOOSER_PANEL_NAME) {
    closePlanetChooser({ restoreFocus: false });
  }
});

window.addEventListener("mousedown", (event) => {
  if (
    !chooserPanel.hidden &&
    !chooserPanel.contains(event.target) &&
    !chooserToggleButton.contains(event.target) &&
    !infoButton.contains(event.target) &&
    !pauseButton.contains(event.target)
  ) {
    closePlanetChooser();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chooserPanel.hidden) {
    closePlanetChooser();
  }
});

window.addEventListener(APP_PAUSE_CHANGED_EVENT, (event) => {
  isPaused = event.detail.isPaused;
});

const gap = 12.222222

// initialize the scene
const scene = new THREE.Scene();
scene.background = null;

// add textureLoader
const textureLoader = new THREE.TextureLoader(createAssetLoadingManager("planet-chooser"));

const loadSRGBTexture = (path) => {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// add textures
const sunTexture = loadSRGBTexture("./textures/sun.jpg");
const mercuryTexture = loadSRGBTexture("./textures/mercury.jpg");
const venusTexture = loadSRGBTexture("./textures/venus.jpg");
const earthTexture = loadSRGBTexture("./textures/earth.jpg");
const marsTexture = loadSRGBTexture("./textures/mars.jpg");
const jupiterTexture = loadSRGBTexture("./textures/jupiter.jpg");
const saturnTexture = loadSRGBTexture("./textures/saturn.jpg");
const saturnRingTexture = loadSRGBTexture("./textures/saturn_ring_alpha.png");
const uranusTexture = loadSRGBTexture("./textures/uranus.jpg");
const neptuneTexture = loadSRGBTexture("./textures/neptune.jpg");
const plutoTexture = loadSRGBTexture("./textures/pluto.jpg");

// add planets
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

const sunMaterial = new THREE.MeshBasicMaterial({map: sunTexture});
const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
const sunPosition = -55
sun.position.x = sunPosition;
sun.scale.setScalar(3);

const mercuryMaterial = new THREE.MeshStandardMaterial({map: mercuryTexture});
const venusMaterial = new THREE.MeshStandardMaterial({map: venusTexture});
const earthMaterial = new THREE.MeshStandardMaterial({map: earthTexture});
const marsMaterial = new THREE.MeshStandardMaterial({map: marsTexture});
const jupiterMaterial = new THREE.MeshStandardMaterial({map: jupiterTexture});
const saturnMaterial = new THREE.MeshStandardMaterial({map: saturnTexture});
const saturnRingMaterial = new THREE.MeshBasicMaterial({
  map: saturnRingTexture,
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const uranusMaterial = new THREE.MeshStandardMaterial({map: uranusTexture});
const neptuneMaterial = new THREE.MeshStandardMaterial({map: neptuneTexture});
const plutoMaterial = new THREE.MeshStandardMaterial({map: plutoTexture});

const degreesToRadians = THREE.MathUtils.degToRad;

const planets = [
  { 
    name: "Mercury", 
    radius: 3,
    distance: sunPosition + gap,
    speed: 0.01,
    rotationSpeed: 0.004,
    axialTilt: degreesToRadians(0.03),
    material: mercuryMaterial,
  },
  { 
    name: "Venus", 
    radius: 3,
    distance: sunPosition + (gap * 2),
    speed: 0.007,
    rotationSpeed: 0.0015,
    axialTilt: degreesToRadians(177.4),
    material: venusMaterial,
  },
  { 
    name: "Earth", 
    radius: 3, 
    distance: sunPosition + (gap * 3), 
    speed: 0.005, 
    rotationSpeed: 0.03,
    axialTilt: degreesToRadians(23.44),
    material: earthMaterial
  },
  { 
    name: "Mars", 
    radius: 3, 
    distance: sunPosition + (gap * 4), 
    speed: 0.003, 
    rotationSpeed: 0.028,
    axialTilt: degreesToRadians(25.19),
    material: marsMaterial, 
  },
  {
    name: "Jupiter",
    radius: 3,
    distance: sunPosition + (gap * 5),
    speed: 0.0015,
    rotationSpeed: 0.07,
    axialTilt: degreesToRadians(3.13),
    material: jupiterMaterial,
  },
  {
    name: "Saturn",
    radius: 2.3 + 0.7,
    distance: sunPosition + (gap * 6),
    speed: 0.0011,
    rotationSpeed: 0.065,
    axialTilt: degreesToRadians(26.73),
    material: saturnMaterial,
    ring: {
      innerRadius: 3 + 0.7,
      outerRadius: 5.2 + 0.7,
      rotationSpeed: 0.02,
      material: saturnRingMaterial,
    },
  },
  {
    name: "Uranus",
    radius: 3,
    distance: sunPosition + (gap * 7),
    speed: 0.0007,
    rotationSpeed: 0.045,
    axialTilt: degreesToRadians(97.77),
    material: uranusMaterial,
  },
  {
    name: "Neptune",
    radius: 3,
    distance: sunPosition + (gap * 8),
    speed: 0.0005,
    rotationSpeed: 0.045,
    axialTilt: degreesToRadians(28.32),
    material: neptuneMaterial,
  },
  {
    name: "Pluto",
    radius: 3,
    distance: sunPosition + (gap * 9),
    speed: 0.00033,
    rotationSpeed: 0.0045,
    axialTilt: degreesToRadians(122.53),
    material: plutoMaterial,
  },
];

const createPlanet = (planet) => {
  const planetAxis = new THREE.Group();
  planetAxis.rotation.z = planet.axialTilt;
  
  const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
  planetMesh.scale.setScalar(planet.radius);
  planetAxis.add(planetMesh);
  
  return { axis: planetAxis, mesh: planetMesh };
};

const createRing = (ring) => {
  const ringGeometry = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 128);
  const position = ringGeometry.attributes.position;
  const uv = ringGeometry.attributes.uv;
  
  for (let i = 0; i < position.count; i++) {
    const radius = Math.hypot(position.getX(i), position.getY(i));
    const textureX = (radius - ring.innerRadius) / (ring.outerRadius - ring.innerRadius);
    uv.setXY(i, textureX, 0.5);
  }
  
  uv.needsUpdate = true;
  
  const ringMesh = new THREE.Mesh(ringGeometry, ring.material);
  const ringGroup = new THREE.Group();
  ringGroup.rotation.x = Math.PI / 2;
  ringGroup.add(ringMesh);
  return { group: ringGroup, mesh: ringMesh };
};

const planetSystems = planets.map(planet => {
  const planetSystem = new THREE.Group();
  planetSystem.position.x = planet.distance;
  
  const planetObject = createPlanet(planet);
  planetSystem.add(planetObject.axis);
  
  const ringMeshes = [];
  
  if (planet.ring) {
    const ring = createRing(planet.ring);
    planetObject.axis.add(ring.group);
    ringMeshes.push({ mesh: ring.mesh, data: planet.ring });
  }
  
  scene.add(planetSystem);
  return { system: planetSystem, mesh: planetObject.mesh, rings: ringMeshes };
});

scene.add(sun);
planetSystems[5].system.rotation.y = 0.5;
planetSystems[5].system.rotation.x = 0.1;

// initialize the light
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

// initialize the camera
const camera = new THREE.OrthographicCamera(
  -cameraViewWidth / 2,
  cameraViewWidth / 2,
  cameraViewHeight / 2,
  -cameraViewHeight / 2,
  0.1,
  100
);
// camera.position.x = 0;
camera.position.y = -cameraVerticalOffset;
camera.position.z = 10;
scene.add(camera);

// initialize the renderer
const canvas = document.querySelector("canvas.planet-chooser");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor( 0x000000, 0 ); 

setupPlanetChooserInteractions({ canvas, camera, sun, planetSystems, planets });
const clock = new THREE.Clock();
const MAX_ANIMATION_DELTA = 0.1;

// add resize listener
window.addEventListener("resize", () => {
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

// render loop
const renderloop = () => {
  const deltaTime = Math.min(clock.getDelta(), MAX_ANIMATION_DELTA);
  const frameTimeScale = deltaTime * 60;

  if (!isPaused) {
    sun.rotation.y += 0.0012 * frameTimeScale;

    planetSystems.forEach(({ system, mesh, rings }, planetIndex) => {
      const planet = planets[planetIndex];

      mesh.rotation.y += planet.rotationSpeed * frameTimeScale;

      rings.forEach(({ mesh: ringMesh, data: ring }) => {
        ringMesh.rotation.z += ring.rotationSpeed * frameTimeScale;
      });
    });
  }
  
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};



renderloop();
