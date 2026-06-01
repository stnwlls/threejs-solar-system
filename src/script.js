import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// initialize the scene
const scene = new THREE.Scene();
const pauseButton = document.querySelector(".pause-button");
const pauseButtonIcon = document.querySelector(".pause-button__icon");
const infoButton = document.querySelector(".info-button");
const infoModal = document.querySelector(".info-modal");
const infoCloseButton = document.querySelector(".info-panel__close");
const INFO_PANEL_TRANSITION_MS = 540;
let isPaused = false;
let infoCloseTimeout;
let infoContentTimeout;

pauseButton.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseButton.setAttribute("aria-label", isPaused ? "Resume animation" : "Pause animation");
  pauseButton.setAttribute("aria-pressed", isPaused);
  pauseButtonIcon.textContent = isPaused ? "play_arrow" : "pause";
});

const openInfoModal = () => {
  window.clearTimeout(infoCloseTimeout);
  window.clearTimeout(infoContentTimeout);
  infoButton.classList.add("is-hidden");
  infoModal.hidden = false;
  infoModal.classList.remove("is-closing", "is-content-hiding", "is-content-visible");
  infoButton.setAttribute("aria-expanded", "true");
  window.requestAnimationFrame(() => {
    infoModal.classList.add("is-open");
    infoContentTimeout = window.setTimeout(() => {
      infoModal.classList.add("is-content-visible");
      infoCloseButton.focus();
    }, INFO_PANEL_TRANSITION_MS);
  });
};

const closeInfoModal = () => {
  window.clearTimeout(infoCloseTimeout);
  window.clearTimeout(infoContentTimeout);
  infoModal.classList.add("is-closing", "is-content-hiding");
  infoModal.classList.remove("is-content-visible", "is-open");
  infoButton.setAttribute("aria-expanded", "false");
  infoCloseTimeout = window.setTimeout(() => {
    infoModal.hidden = true;
    infoModal.classList.remove("is-closing", "is-content-hiding");
    infoButton.classList.remove("is-hidden");
    infoButton.focus();
  }, INFO_PANEL_TRANSITION_MS);
};

infoButton.addEventListener("click", openInfoModal);
infoCloseButton.addEventListener("click", closeInfoModal);

infoModal.addEventListener("click", (event) => {
  if (event.target === infoModal) {
    closeInfoModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !infoModal.hidden) {
    closeInfoModal();
  }
});

// add textureLoader
const textureLoader = new THREE.TextureLoader();

const loadSRGBTexture = (path) => {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// add textures
const sunTexture = loadSRGBTexture("./textures/sun.jpg");
const mercuryTexture = loadSRGBTexture("./textures/mercury.jpg");
const venusTexture = loadSRGBTexture("./textures/venus.jpg");
const venusAtmosphereTexture = loadSRGBTexture("./textures/venus_atmosphere.jpg");
const earthTexture = loadSRGBTexture("./textures/earth.jpg");
const earthCloudsTexture = loadSRGBTexture("./textures/earth_clouds.jpg");
const earthNightTexture = loadSRGBTexture("./textures/earth_nightmap.jpg");
const earthNormalTexture = textureLoader.load("./textures/earth_normal_map.png");
const earthSpecularTexture = textureLoader.load("./textures/earth_specular_map.png");
const moonTexture = loadSRGBTexture("./textures/moon.jpg");
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
sun.scale.setScalar(5);

const mercuryMaterial = new THREE.MeshStandardMaterial({map: mercuryTexture});
const venusMaterial = new THREE.MeshStandardMaterial({map: venusTexture});
const venusAtmosphereMaterial = new THREE.MeshStandardMaterial({
  map: venusAtmosphereTexture,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
});
const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthTexture,
  normalMap: earthNormalTexture,
  normalScale: new THREE.Vector2(0.25, 0.25),
  specularMap: earthSpecularTexture,
  specular: new THREE.Color(0x333333),
  shininess: 15,
});
const earthCloudsMaterial = new THREE.ShaderMaterial({
  uniforms: {
    cloudsMap: { value: earthCloudsTexture },
    sunWorldPosition: { value: sun.position },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D cloudsMap;
    uniform vec3 sunWorldPosition;
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 toSun = normalize(sunWorldPosition - vWorldPosition);
      float daylight = dot(normalize(vWorldNormal), toSun);
      float dayAmount = smoothstep(-0.1, 0.35, daylight);
      float cloudAmount = texture2D(cloudsMap, vUv).r;
      gl_FragColor = vec4(vec3(1.0), cloudAmount * dayAmount * 0.55);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
  transparent: true,
  depthWrite: false,
});
const earthNightSideMaterial = new THREE.ShaderMaterial({
  uniforms: {
    sunWorldPosition: { value: sun.position },
  },
  vertexShader: `
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 sunWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 toSun = normalize(sunWorldPosition - vWorldPosition);
      float daylight = dot(normalize(vWorldNormal), toSun);
      float nightAmount = 1.0 - smoothstep(-0.2, 0.15, daylight);
      gl_FragColor = vec4(0.0, 0.0, 0.0, nightAmount * 0.95);
    }
  `,
  transparent: true,
  depthWrite: false,
});
const earthNightMaterial = new THREE.ShaderMaterial({
  uniforms: {
    nightMap: { value: earthNightTexture },
    sunWorldPosition: { value: sun.position },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D nightMap;
    uniform vec3 sunWorldPosition;
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 toSun = normalize(sunWorldPosition - vWorldPosition);
      float daylight = dot(normalize(vWorldNormal), toSun);
      float nightAmount = 1.0 - smoothstep(-0.2, 0.15, daylight);
      vec3 nightColor = texture2D(nightMap, vUv).rgb;
      gl_FragColor = vec4(nightColor * 2.5, nightAmount);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const moonMaterial = new THREE.MeshStandardMaterial({map: moonTexture});
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

// add background
const skyboxGeometry = new THREE.BoxGeometry(400, 400, 400);

const skyboxMaterials = [
  new THREE.MeshBasicMaterial({ map: loadSRGBTexture("./textures/cubeMap/px.png"), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loadSRGBTexture("./textures/cubeMap/nx.png"), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loadSRGBTexture("./textures/cubeMap/py.png"), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loadSRGBTexture("./textures/cubeMap/ny.png"), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loadSRGBTexture("./textures/cubeMap/pz.png"), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loadSRGBTexture("./textures/cubeMap/nz.png"), side: THREE.BackSide }),
];

const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
scene.add(skybox);

const degreesToRadians = THREE.MathUtils.degToRad;

const planets = [
  { 
    name: "Mercury", 
    radius: 0.5,
    distance: 13,
    speed: 0.01,
    rotationSpeed: 0.004,
    axialTilt: degreesToRadians(0.03),
    material: mercuryMaterial,
    moons: []
  },
  { 
    name: "Venus", 
    radius: 0.8,
    distance: 24,
    speed: 0.007,
    rotationSpeed: 0.0015,
    axialTilt: degreesToRadians(177.4),
    material: venusMaterial,
    clouds: {
      radiusScale: 1.025,
      rotationSpeed: 0.0018,
      material: venusAtmosphereMaterial,
    },
    moons: []
  },
  { 
    name: "Earth", 
    radius: 1, 
    distance: 33, 
    speed: 0.005, 
    rotationSpeed: 0.03,
    axialTilt: degreesToRadians(23.44),
    material: earthMaterial, 
    nightSideMaterial: earthNightSideMaterial,
    nightMaterial: earthNightMaterial,
    clouds: {
      radiusScale: 1.015,
      rotationSpeed: 0.031,
      material: earthCloudsMaterial,
    },
    moons: [
      {
        name: 'Moon', 
        radius: 0.3, 
        distance: 3, 
        speed: 0.015,
        rotationSpeed: 0.015
      }
    ]
  },
  { 
    name: "Mars", 
    radius: 0.7, 
    distance: 50, 
    speed: 0.003, 
    rotationSpeed: 0.028,
    axialTilt: degreesToRadians(25.19),
    material: marsMaterial, 
    moons: [
      {
        name: 'Phobos',
        radius: 0.1,
        distance: 2,
        speed: 0.02,
        rotationSpeed: 0.02
      },
      {
        name: 'Deimos',
        radius: 0.2,
        distance: 3,
        speed: 0.015,
        rotationSpeed: 0.015,
        color: 0xffffff,
      }
    ]
  },
  {
    name: "Jupiter",
    radius: 2.6,
    distance: 65,
    speed: 0.0015,
    rotationSpeed: 0.07,
    axialTilt: degreesToRadians(3.13),
    material: jupiterMaterial,
    moons: []
  },
  {
    name: "Saturn",
    radius: 2.3,
    distance: 82,
    speed: 0.0011,
    rotationSpeed: 0.065,
    axialTilt: degreesToRadians(26.73),
    material: saturnMaterial,
    ring: {
      innerRadius: 3,
      outerRadius: 5.2,
      rotationSpeed: 0.02,
      material: saturnRingMaterial,
    },
    moons: []
  },
  {
    name: "Uranus",
    radius: 1.6,
    distance: 100,
    speed: 0.0007,
    rotationSpeed: 0.045,
    axialTilt: degreesToRadians(97.77),
    material: uranusMaterial,
    moons: []
  },
  {
    name: "Neptune",
    radius: 1.55,
    distance: 116,
    speed: 0.0005,
    rotationSpeed: 0.045,
    axialTilt: degreesToRadians(28.32),
    material: neptuneMaterial,
    moons: []
  },
  {
    name: "Pluto",
    radius: 0.28,
    distance: 152,
    speed: 0.00033,
    rotationSpeed: 0.0045,
    axialTilt: degreesToRadians(122.53),
    material: plutoMaterial,
    moons: []
  },
];

const createPlanet = (planet) => {
  const planetAxis = new THREE.Group();
  planetAxis.rotation.z = planet.axialTilt;

  const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
  planetMesh.scale.setScalar(planet.radius);
  planetAxis.add(planetMesh);

  if (planet.nightSideMaterial) {
    const nightSideMesh = new THREE.Mesh(sphereGeometry, planet.nightSideMaterial);
    nightSideMesh.scale.setScalar(1.001);
    nightSideMesh.renderOrder = 1;
    planetMesh.add(nightSideMesh);
  }

  if (planet.nightMaterial) {
    const nightMesh = new THREE.Mesh(sphereGeometry, planet.nightMaterial);
    nightMesh.scale.setScalar(1.002);
    nightMesh.renderOrder = 2;
    planetMesh.add(nightMesh);
  }

  let cloudsMesh = null;

  if (planet.clouds) {
    cloudsMesh = new THREE.Mesh(sphereGeometry, planet.clouds.material);
    cloudsMesh.scale.setScalar(planet.radius * planet.clouds.radiusScale);
    cloudsMesh.renderOrder = 3;
    planetAxis.add(cloudsMesh);
  }

  return { axis: planetAxis, mesh: planetMesh, clouds: cloudsMesh };
};

const createMoon = (moon) => {
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  moonMesh.scale.setScalar(moon.radius);
  moonMesh.position.x = moon.distance;
  return moonMesh;
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

  const moonMeshes = planet.moons.map(moon => {
    const moonMesh = createMoon(moon);
    planetSystem.add(moonMesh);
    return moonMesh;
  });

  scene.add(planetSystem);
  return { system: planetSystem, mesh: planetObject.mesh, clouds: planetObject.clouds, rings: ringMeshes, moons: moonMeshes };
});

scene.add(sun);

// initialize the light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.decay = 0;
scene.add(pointLight);

// initialize the camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1500
);
camera.position.z = 100;
camera.position.y = 5;

// initialize the renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// add controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 6;

// add resize listener
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// render loop
const renderloop = () => {
  if (!isPaused) {
    sun.rotation.y += 0.0012;

    planetSystems.forEach(({ system, mesh, clouds, rings, moons }, planetIndex) => {
      const planet = planets[planetIndex];

      planet.orbitAngle = (planet.orbitAngle ?? Math.PI / 2) + planet.speed * 0.65;
      system.position.x = Math.sin(planet.orbitAngle) * planet.distance;
      system.position.z = Math.cos(planet.orbitAngle) * planet.distance;
      mesh.rotation.y += planet.rotationSpeed;

      if (clouds) {
        clouds.rotation.y += planet.clouds.rotationSpeed;
      }

      rings.forEach(({ mesh: ringMesh, data: ring }) => {
        ringMesh.rotation.z += ring.rotationSpeed;
      });

      moons.forEach((moonMesh, moonIndex) => {
        const moon = planet.moons[moonIndex];

        moon.orbitAngle = (moon.orbitAngle ?? Math.PI / 2) + moon.speed * 0.65;
        moonMesh.position.x = Math.sin(moon.orbitAngle) * moon.distance;
        moonMesh.position.z = Math.cos(moon.orbitAngle) * moon.distance;
        moonMesh.rotation.y += moon.rotationSpeed * 0.65;
      });
    });
  }
  
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};

renderloop();
