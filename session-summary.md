# Solar System Session Summary

## Animation And Motion

- Decoupled planetary orbit motion from axial spin so planets are no longer accidentally tidally locked.
- Added separate `rotationSpeed` values for planets and moons.
- Kept tidally locked moons intentionally synchronized with their orbital speed.
- Added `ORBIT_SPEED_SCALE` to slow the whole solar system while preserving relative orbital speeds.
- Slowed the Sun's rotation to better match the real Sun's much slower rotation relative to Earth.
- Added real-world inspired axial tilts for each planet:
  - Mercury: `0.03deg`
  - Venus: `177.4deg`
  - Earth: `23.44deg`
  - Mars: `25.19deg`
  - Jupiter: `3.13deg`
  - Saturn: `26.73deg`
  - Uranus: `97.77deg`
  - Neptune: `28.32deg`
- Refactored planets so each planet mesh spins inside a tilted axis group.

## Planet Layout

- Rescaled planet distances multiple times to balance real solar-system proportions with the camera's usable range.
- Final layout keeps all planets visible from the initial camera position without collisions.
- Added Jupiter, Saturn, Uranus, and Neptune with compressed visual-scale radii, slower orbital speeds, and faster gas/ice giant spin speeds.
- Added Pluto as a small distant dwarf planet beyond Neptune with a slow orbit, slow rotation, and a retrograde-style axial tilt.

## Moons And Rings

- Moved moons out from under the spinning planet mesh into the planet system group so planet spin does not drag moon orbits around.
- Added Saturn's rings as a separate ring mesh attached to Saturn's tilted axis group.
- Changed Saturn's ring texture from an alpha-only map to a real color texture map.
- Remapped Saturn ring UVs radially so the ring bands wrap properly around Saturn.
- Added visual ring rotation around Saturn's ring plane.

## Textures And Assets

- Added sRGB color-space handling for image textures so JPG/PNG assets render closer to their source colors.
- Removed the unused `CubeTextureLoader` and old `backgroundCubeMap` setup after switching to a skybox mesh.
- Moved new outer planet textures into `static/textures/`:
  - `jupiter.jpg`
  - `saturn.jpg`
  - `saturn_ring_alpha.png`
  - `uranus.jpg`
  - `neptune.jpg`
- Moved Earth cloud and night textures into `static/textures/`.
- Moved `venus_atmosphere.jpg` into `static/textures/`.
- Added `pluto.jpg` from `static/textures/` as Pluto's surface texture.
- Converted Earth TIFF maps into PNG files for browser compatibility:
  - `earth_normal_map.tif` -> `earth_normal_map.png`
  - `earth_specular_map.tif` -> `earth_specular_map.png`

## Earth Rendering

- Switched Earth to `MeshPhongMaterial` so it can use a `specularMap` for ocean shine.
- Added Earth's normal map with a subtle `normalScale` for surface relief.
- Added a separate transparent cloud sphere slightly larger than Earth.
- Added a custom cloud shader so clouds fade out on Earth's night side.
- Added a custom night-side shader overlay so city lights appear only on the dark side facing away from the Sun.
- Added an Earth-only dark-side overlay to counteract global ambient light without making the other planets too dark.

## Venus Rendering

- Added Venus's atmosphere texture as an sRGB texture.
- Added a slightly larger translucent atmosphere shell around Venus.
- Gave Venus's atmosphere its own slow rotation, tied into the same pause behavior as the rest of the simulation.

## Lighting And Background

- Increased ambient light so planets remain clearly visible.
- Changed the Sun point light to no distance falloff so outer planets stay illuminated.
- Replaced the fixed `scene.background` cubemap with a skybox mesh so the background can visually respond to camera zoom.
- Increased the camera far plane to prevent the skybox from clipping to black.
- Increased skybox size to reduce visible cube corners.

## UI

- Added a bottom-corner Pause/Resume button.
- Pausing stops simulation updates while keeping camera controls active.
- Paused state stops Sun rotation, planet orbit/spin, moon orbit/spin, Saturn ring spin, and Earth cloud rotation.
- Changed the Pause/Resume button from text to an accessible icon button that shows pause bars while playing and a play triangle while paused.
- Added a bottom-left mouse-controls overlay explaining zoom, rotate, and camera movement controls.
- Made the controls overlay non-interactive with `pointer-events: none` so it does not block scene controls.
- Moved the mouse controls from the standalone overlay into the information popup.
- Moved the information icon to the bottom-left corner.
- Added an information icon that opens an accessible project information popup.
- Added personal links for Austin Wells: website, GitHub, and LinkedIn.
- Added credits for Three.js, Solar System Scope planet textures, Planet Pixel Emporium's Pluto texture, and the Zero To Mastery Three.js course taught by Jesse Zhou.
- Switched heading typography to Orbitron, added Kode Mono for non-heading text, and moved the Google text font import into `style.css`.
- Switched the play/pause and information controls to filled Material Symbols icons, with the info button to the left of the play/pause button.
- Removed hover and focus/click outline styling from the UI controls.
- Changed the information popup into a bottom-left expanding panel animated from the info icon.
- Replaced the text close button with the Material Symbols `close_small` icon.
- Refined the information panel so the info icon itself visually expands into the rectangle instead of appearing as a separate box.
- Matched the expanded information panel background, border, and blur to the info icon so the circle feels like it morphs into the rounded rectangle.
- Refined information popup typography with a smaller title, more heading letter spacing, stronger hierarchy, compact bottom credits, and a single built-by line.
- Reduced the info panel height to fit its content, made the info icon fade during expansion, kept expansion moving from bottom-left to top-right, removed the close button background, and reduced UI control sizes.
- Reduced the information panel title size and spacing so `Three.js Solar System` stays on one line without increasing panel width.
- Smoothed the information panel animation by removing the spring-like easing, slowing the open transition, and animating explicit width/height from the bottom-left corner.
- Set the information panel animation to a middle speed and synchronized the close timeout so the info icon fades back in only after the panel finishes closing.
- Sequenced the information panel animation so content does not move with the resize: the panel expands before text fades in, text fades out before collapse, and the info icon returns only after closing finishes.
- Added explicit fade-out states for information panel content and applied the same fade-in/fade-out timing to the close icon.
- Lengthened and decoupled the information panel content fade-out so body text visibly fades away before the panel collapses.
- Updated the information panel so the `i` fades as soon as opening starts, while body text and the X fade out at the same time as the close animation.
- Added a centered `#justiceforpluto` tag at the bottom of the information panel.
- Increased the information panel height to avoid scrolling while preserving the custom Pluto hashtag spacing.
- Smoothed the information panel morph by replacing the expanding panel's percentage radius with fixed pixel radii: circular when closed, rounded rectangle when open.
- Kept the information panel border radius fixed through the morph so the bottom-left corner remains stationary while the panel expands.
- Corrected the expanding information panel to use a fixed `20px` radius instead of percentage radius, keeping the closed state circular while the open state remains a rounded rectangle.

## Ongoing Notes

- Future changes made in this chat should be appended to this summary as they are completed.
- Replaced the starter README with a detailed project README covering the Zero To Mastery course source, base work completed before AI assistance, OpenCode/Codex GPT-5.5 enhancements, credits, controls, and local setup instructions.
- Updated `package.json` project name to `threejs-solar-system`.
- Added the unused raw `Textures/` staging folder to `.gitignore`.
- Created the public GitHub repository `stnwlls/threejs-solar-system` and pushed the initial source commit.
- Added the solar system project to the local `stnwlls.github.io` portfolio data with a custom SVG thumbnail and GitHub source link.

## Verification

- Ran `npm run build` after each implementation pass.
- Builds completed successfully.
- Vite continues to show the existing large chunk-size warning for the Three.js bundle.
