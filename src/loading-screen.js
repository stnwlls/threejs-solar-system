import * as THREE from "three";

const REQUIRED_ASSET_GROUPS = new Set(["main-scene", "planet-chooser"]);
const completedAssetGroups = new Set();
const loadingScreen = document.querySelector(".loading-screen");
const LOADING_SCREEN_MIN_MS = 2000;
const LOADING_SCREEN_FADE_MS = 700;
const loadingScreenStartedAt = performance.now();

let pageIsLoaded = document.readyState === "complete";
let fontsAreLoaded = !document.fonts;
let hideTimeout;
let minimumDisplayTimeout;

const hideLoadingScreenIfReady = () => {
  if (
    !loadingScreen ||
    !pageIsLoaded ||
    !fontsAreLoaded ||
    completedAssetGroups.size < REQUIRED_ASSET_GROUPS.size ||
    loadingScreen.classList.contains("is-loaded")
  ) {
    return;
  }

  const remainingMinimumDisplayMs = LOADING_SCREEN_MIN_MS - (performance.now() - loadingScreenStartedAt);

  if (remainingMinimumDisplayMs > 0) {
    window.clearTimeout(minimumDisplayTimeout);
    minimumDisplayTimeout = window.setTimeout(hideLoadingScreenIfReady, remainingMinimumDisplayMs);
    return;
  }

  window.requestAnimationFrame(() => {
    loadingScreen.classList.add("is-loaded");
    loadingScreen.setAttribute("aria-hidden", "true");

    window.clearTimeout(hideTimeout);
    hideTimeout = window.setTimeout(() => {
      loadingScreen.hidden = true;
    }, LOADING_SCREEN_FADE_MS);
  });
};

if (!pageIsLoaded) {
  window.addEventListener("load", () => {
    pageIsLoaded = true;
    hideLoadingScreenIfReady();
  }, { once: true });
}

if (document.fonts) {
  document.fonts.ready
    .catch(() => {})
    .then(() => {
      fontsAreLoaded = true;
      hideLoadingScreenIfReady();
    });
}

export const createAssetLoadingManager = (assetGroup) => {
  const manager = new THREE.LoadingManager();

  manager.onLoad = () => {
    completedAssetGroups.add(assetGroup);
    hideLoadingScreenIfReady();
  };

  manager.onError = (url) => {
    console.warn(`Failed to load asset: ${url}`);
  };

  return manager;
};
