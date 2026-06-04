import * as THREE from "three";

export const PLANET_SELECTED_EVENT = "planet-selected";
export const APP_PAUSE_CHANGED_EVENT = "app-pause-changed";
const RESET_CAMERA_BODY = "Sun";

const createGlowTexture = () => {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.18,
    size / 2,
    size / 2,
    size * 0.5
  );

  gradient.addColorStop(0, "rgba(255, 255, 255, 0.65)");
  gradient.addColorStop(0.48, "rgba(255, 255, 255, 0.35)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const dispatchPlanetSelection = (planetName) => {
  window.dispatchEvent(new CustomEvent(PLANET_SELECTED_EVENT, {
    detail: { planetName },
  }));
};

export const setupPlanetChooserInteractions = ({ canvas, camera, sun, planetSystems, planets }) => {
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const glowTexture = createGlowTexture();
  const planetByMesh = new Map();
  const raycastMeshes = [];
  let hoveredPlanet = null;

  const createGlow = (radius) => {
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.78,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Sprite(glowMaterial);
    const glowSize = radius * 2.85;

    glow.scale.set(glowSize, glowSize, 1);
    glow.renderOrder = -1;
    glow.visible = false;

    return glow;
  };

  const addInteractiveBody = ({ name, mesh, radius, glowParent, glowPosition, selectableMeshes = [] }) => {
    const glow = createGlow(radius);

    if (glowPosition) {
      glow.position.copy(glowPosition);
    }

    glowParent.add(glow);

    const interactivePlanet = {
      name,
      mesh,
      baseScale: mesh.scale.clone(),
      glow,
    };

    [mesh, ...selectableMeshes].forEach((selectableMesh) => {
      planetByMesh.set(selectableMesh, interactivePlanet);
      raycastMeshes.push(selectableMesh);
    });

    return interactivePlanet;
  };

  const interactivePlanets = [];

  if (sun) {
    const sunRadius = Math.max(sun.scale.x, sun.scale.y, sun.scale.z);

    interactivePlanets.push(addInteractiveBody({
      name: RESET_CAMERA_BODY,
      mesh: sun,
      radius: sunRadius,
      glowParent: sun.parent,
      glowPosition: sun.position,
    }));
  }

  interactivePlanets.push(...planetSystems.map((planetSystem, planetIndex) => {
    const planet = planets[planetIndex];

    return addInteractiveBody({
      name: planet.name,
      mesh: planetSystem.mesh,
      radius: planet.radius,
      glowParent: planetSystem.system,
      selectableMeshes: (planetSystem.rings ?? []).map(({ mesh }) => mesh),
    });
  }));

  const updatePointer = (event) => {
    const rect = canvas.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const getPlanetAtPointer = (event) => {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);

    const intersections = raycaster.intersectObjects(raycastMeshes, false);
    return intersections.length > 0 ? planetByMesh.get(intersections[0].object) : null;
  };

  const setHoveredPlanet = (nextPlanet) => {
    if (hoveredPlanet === nextPlanet) {
      return;
    }

    if (hoveredPlanet) {
      hoveredPlanet.mesh.scale.copy(hoveredPlanet.baseScale);
      hoveredPlanet.glow.visible = false;
    }

    hoveredPlanet = nextPlanet;
    canvas.style.cursor = hoveredPlanet ? "pointer" : "";

    if (hoveredPlanet) {
      hoveredPlanet.mesh.scale.copy(hoveredPlanet.baseScale).multiplyScalar(1.14);
      hoveredPlanet.glow.visible = true;
    }
  };

  const handlePointerMove = (event) => {
    setHoveredPlanet(getPlanetAtPointer(event));
  };

  const handlePointerLeave = () => {
    setHoveredPlanet(null);
  };

  const handleClick = (event) => {
    const clickedPlanet = getPlanetAtPointer(event);

    if (clickedPlanet) {
      dispatchPlanetSelection(clickedPlanet.name);
    }
  };

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("click", handleClick);

  return () => {
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
    canvas.removeEventListener("click", handleClick);
    glowTexture.dispose();

    interactivePlanets.forEach(({ glow }) => {
      glow.material.dispose();
      glow.parent?.remove(glow);
    });
  };
};

export const createPlanetCameraFollower = ({ camera, controls, sun, planetSystems, planets }) => {
  const currentPosition = new THREE.Vector3();
  const previousPosition = new THREE.Vector3();
  const delta = new THREE.Vector3();
  const cameraOffset = new THREE.Vector3();
  const sunPosition = new THREE.Vector3();
  const directionFromSun = new THREE.Vector3();
  const initialCameraPosition = camera.position.clone();
  const initialControlsTarget = controls.target.clone();
  const planetsByName = new Map(planets.map((planet, planetIndex) => [
    planet.name,
    { planet, system: planetSystems[planetIndex].system },
  ]));
  let followedPlanet = null;

  const updateSunPosition = () => {
    if (sun) {
      sun.getWorldPosition(sunPosition);
    } else {
      sunPosition.set(0, 0, 0);
    }
  };

  const resetCamera = () => {
    followedPlanet = null;
    camera.position.copy(initialCameraPosition);
    controls.target.copy(initialControlsTarget);
    controls.update();
  };

  const focusPlanet = (planetName) => {
    if (planetName === RESET_CAMERA_BODY) {
      resetCamera();
      return;
    }

    const nextPlanet = planetsByName.get(planetName);

    if (!nextPlanet) {
      return;
    }

    followedPlanet = nextPlanet;
    followedPlanet.system.getWorldPosition(previousPosition);

    const focusRadius = followedPlanet.planet.ring?.outerRadius ?? followedPlanet.planet.radius;
    const followDistance = Math.max(focusRadius * 8, 9);
    const followHeight = Math.max(focusRadius * 0.9, 1.2);

    updateSunPosition();
    directionFromSun.subVectors(previousPosition, sunPosition);

    if (directionFromSun.lengthSq() === 0) {
      directionFromSun.set(0, 0, 1);
    }

    directionFromSun.normalize();
    cameraOffset.copy(directionFromSun).multiplyScalar(followDistance);
    cameraOffset.y += followHeight;
    camera.position.copy(previousPosition).add(cameraOffset);
    controls.target.copy(previousPosition);
    controls.update();
  };

  const handlePlanetSelected = (event) => {
    focusPlanet(event.detail.planetName);
  };

  window.addEventListener(PLANET_SELECTED_EVENT, handlePlanetSelected);

  return {
    update() {
      if (!followedPlanet) {
        return;
      }

      followedPlanet.system.getWorldPosition(currentPosition);
      delta.subVectors(currentPosition, previousPosition);
      camera.position.add(delta);
      controls.target.copy(currentPosition);
      previousPosition.copy(currentPosition);
    },
    focusPlanet,
    resetCamera,
    dispose() {
      window.removeEventListener(PLANET_SELECTED_EVENT, handlePlanetSelected);
    },
  };
};
