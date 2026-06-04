# Three.js Solar System

An interactive Three.js solar system scene built with Vite. The project started as a course exercise and grew into a more complete visual exploration of planetary motion, texture mapping, lighting, UI controls, and scene organization.

Live preview: [austinwells.dev/projects/threejs-solar-system](https://austinwells.dev/projects/threejs-solar-system/)

## Learning Source

I learned the foundation for this project from Zero To Mastery's Three.js course, taught by Jesse Zhou.

- Course: [Zero To Mastery Three.js](https://zerotomastery.io/courses/learn-three-js/)
- Instructor: [Jesse Zhou](https://zerotomastery.io/about/instructor/jesse-zhou/)

The course introduced the core Three.js concepts that shaped the base project:

- Creating a scene, camera, and renderer
- Building meshes from geometry and materials
- Loading and applying textures
- Adding lights to a 3D scene
- Using `OrbitControls` for mouse navigation
- Creating an animation/render loop
- Using transforms like position, rotation, and scale
- Structuring objects with parent/child relationships
- Running a Three.js project locally with Vite

## What I Built First

Before using AI assistance, I had already built the base version of the project from the course material and my own implementation work.

That base project included:

- A Vite-powered Three.js setup
- A scene with camera, renderer, and OrbitControls
- A textured Sun
- Inner planets including Mercury, Venus, Earth, and Mars
- Earth Moon and Mars moons
- Basic planet and moon meshes using shared sphere geometry
- Texture loading for the original planet maps
- Lighting with ambient and point lights
- A star/cubemap-style background
- A render loop that moved planets and moons around the scene

## AI-Assisted Enhancements

After the base project was working, I used AI to help enhance and polish the product. I used OpenCode with Codex GPT-5.5 as an AI coding assistant.

AI assistance helped with:

- Separating orbital motion from axial rotation so planets were not accidentally tidally locked
- Adding more realistic relative rotation behavior and axial tilts
- Improving planet spacing and animation speed
- Adding Jupiter, Saturn, Uranus, Neptune, and Pluto
- Adding Saturn's rings and ring animation
- Adding Earth clouds, night lights, normal map, and specular map support
- Adding Venus atmosphere rendering
- Improving lighting and texture color-space handling
- Replacing the fixed background with a zoom-responsive skybox mesh
- Adding pause/play and information UI controls
- Adding the project information panel, credits, and mouse-control instructions
- Styling the interface with Orbitron, Kode Mono, and Material Symbols
- Writing and organizing project documentation

## Update - June 3, 2026

### Planet Chooser And Follow Controls

Changes I made:

- Created the new `planet-chooser.js` file
- Added the planet chooser canvas to the page
- Built the initial row of selectable planets in the chooser

AI-assisted polish:

- Added hover effects, glow styling, and click interactions for the chooser
- Connected planet selection to the main camera follow behavior
- Added the animated `Follow a planet` panel and close behavior
- Helped coordinate the chooser with the info modal and pause controls
- Refined UI styling, link behavior, camera positioning, and small layout details

### Loading Screen And Frame-Rate Consistency

Changes I made:

- Added a black loading screen with animated `Loading...` dots
- Kept the loading screen visible for at least two seconds before it can fade out
- Connected the loading screen to the page, font, main scene texture, and planet chooser texture loading state
- Added a fade transition from the loading screen into the fully loaded scene
- Updated the animation loops to use elapsed time so higher refresh-rate monitors do not make the solar system run faster
- Capped animation delta time to avoid large jumps after browser tab pauses or slow frames

## Controls

- Scroll to zoom
- Click and drag to rotate around the scene
- Shift, click, and drag to move the camera position
- Use the pause/play button to stop or resume orbital and rotational animation
- Use the info button for project credits and controls

## Texture Credits

Planet textures, except Pluto, are credited to [Solar System Scope](https://www.solarsystemscope.com/textures/).

The Pluto texture is credited to [Planet Pixel Emporium](https://planetpixelemporium.com/pluto.html).

## Built With

- [Three.js](https://threejs.org/)
- [Vite](https://vitejs.dev/)
- JavaScript
- HTML
- CSS

## Run Locally

Clone the repository:

```bash
git clone https://github.com/stnwlls/threejs-solar-system.git
```

Move into the project directory:

```bash
cd threejs-solar-system
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in your terminal.

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Note

The scene uses scaled and compressed distances, radii, speeds, and visual values so the full solar system remains usable in an interactive browser scene. The goal is a realistic-feeling educational visualization, not a physically exact simulation.
