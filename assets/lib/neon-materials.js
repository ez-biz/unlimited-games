/**
 * Neon Materials - Shared Three.js utilities for Unlimited Games
 * Provides consistent neon glow aesthetic across all 3D games
 */

const NeonMaterials = {
    // Neon colors
    colors: {
        cyan: 0x00d4ff,
        pink: 0xff0066,
        green: 0x00ff88,
        yellow: 0xffcc00,
        orange: 0xff6600,
        purple: 0xaa00ff
    },

    // Create a glowing material
    glow(color, intensity = 1) {
        return new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
    },

    // Create a standard neon material with emissive
    standard(color, emissiveIntensity = 0.5) {
        return new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: emissiveIntensity,
            metalness: 0.3,
            roughness: 0.4
        });
    },

    // Wireframe material for ghost/preview pieces
    wireframe(color) {
        return new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
    },

    // Grid floor material
    grid(size = 10, divisions = 10) {
        return new THREE.GridHelper(size, divisions, 0x00ff88, 0x1a1a2e);
    },

    // Setup standard neon lighting
    setupLighting(scene) {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x111122, 0.5);
        scene.add(ambient);

        // Main directional light
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(5, 10, 5);
        scene.add(directional);

        // Colored point lights for neon glow
        const cyanLight = new THREE.PointLight(0x00d4ff, 0.5, 50);
        cyanLight.position.set(-10, 5, 0);
        scene.add(cyanLight);

        const pinkLight = new THREE.PointLight(0xff0066, 0.5, 50);
        pinkLight.position.set(10, 5, 0);
        scene.add(pinkLight);

        return { ambient, directional, cyanLight, pinkLight };
    },

    // Create a basic scene with neon background
    createScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a12);
        return scene;
    },

    // Create renderer with proper settings
    createRenderer(canvas) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        return renderer;
    }
};

// Export for module systems, also available as global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeonMaterials;
}
