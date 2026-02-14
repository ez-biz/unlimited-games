import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';

// Get all game directories for multi-page app
function getGameEntries() {
    const gamesDir = resolve(__dirname, 'games');
    const entries = {};

    try {
        const games = readdirSync(gamesDir);
        games.forEach(game => {
            const gamePath = resolve(gamesDir, game);
            if (statSync(gamePath).isDirectory() && game !== '_template') {
                const indexPath = resolve(gamePath, 'index.html');
                try {
                    statSync(indexPath);
                    entries[`games/${game}`] = indexPath;
                } catch (e) {
                    // No index.html in this game folder
                }
            }
        });
    } catch (e) {
        console.warn('Could not read games directory');
    }

    return entries;
}

export default defineConfig({
    root: '.',

    // Alias for cleaner imports
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
            '@assets': resolve(__dirname, './assets'),
            '@games': resolve(__dirname, './games'),
        },
    },

    // Build optimization (CRITICAL)
    build: {
        outDir: 'dist',
        target: 'esnext', // Modern browsers for smaller bundles
        minify: 'terser', // Better compression than esbuild
        sourcemap: false, // Disable in production for smaller build
        chunkSizeWarningLimit: 500,

        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                ...getGameEntries()
            },
            output: {
                // Manual chunks for better caching (build-manual-chunks)
                manualChunks: {
                    three: ['three'], // Separate Three.js vendor chunk
                },
                // Organize output structure
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },

        // Terser options for production
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.log in production
                drop_debugger: true,
            },
        },
    },

    // Development optimization (HIGH)
    optimizeDeps: {
        include: ['three'], // Pre-bundle Three.js for faster dev startup
        exclude: [], // Large deps to exclude if needed
    },

    // Development server (dev-server-config)
    server: {
        port: 5173,
        open: true,
        hmr: {
            overlay: true, // Show HMR errors
        },
        // Enable warmup for frequently used modules (dev-warmup-frequent)
        warmup: {
            clientFiles: [
                './assets/lib/neon-materials.js',
                './games/*/script.js',
            ],
        },
    },

    // Preview server
    preview: {
        port: 4173,
        open: true,
    },

    // Asset handling (HIGH)
    assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr'], // 3D asset support
});
