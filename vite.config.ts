import { defineConfig, loadEnv, PluginOption } from 'vite'
import sassDts from 'vite-plugin-sass-dts'
import dts from 'vite-plugin-dts'
import viteClean from 'vite-plugin-clean'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'
import { fileURLToPath } from 'url'

// Convert `import.meta.url` to a file path
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    // UMD, CJS, and ESM build configuration
    if (env.BUILD_TARGET === 'library') {
        return {
            plugins: [
                sassDts() as PluginOption, // Generate SCSS type definitions
                viteClean({ targetFiles: ['dist/umd', 'dist/cjs', 'dist/esm', 'dist/types'] }) as PluginOption, // Clean output directories before building,
                dts({ outDir: 'dist/types', include: ['src/**/*'] }) as PluginOption,
                viteStaticCopy({
                    targets: [
                        {
                            src: 'src/typings/*.d.ts', // Copy typings files
                            dest: 'types/typings',
                        },
                    ],
                }) as PluginOption,
            ],
            esbuild: {
                jsxFactory: 'h', // Custom JSX factory function
                jsxFragment: 'Fragment', // Custom JSX fragment
            },
            build: {
                outDir: 'dist', // Base output directory
                lib: {
                    entry: path.resolve(__dirname, 'src/index.ts'), // Entry point for the library
                    name: 'CanvasTable', // Global variable name for UMD
                    fileName: (format) => {
                        // Custom file names for each format
                        if (format === 'umd') return 'umd/canvastable.min.js'
                        if (format === 'cjs') return 'cjs/index.js'
                        if (format === 'es') return 'esm/index.js'
                        return 'index.js'
                    },
                    formats: ['umd', 'cjs', 'es'], // Build UMD, CJS, and ESM formats
                },
                rollupOptions: {
                    // Externalize dependencies that shouldn't be bundled
                    external: ['react', 'react-dom'],
                    output: {
                        globals: {
                            react: 'React',
                            'react-dom': 'ReactDOM',
                        },
                    },
                },
            },
        }
    }

    // Default development configuration
    return {
        root: path.resolve(__dirname, 'src/test'), // Set the root directory to src/test
        plugins: [
            sassDts() as PluginOption, // Generate SCSS type definitions
        ],
        esbuild: {
            jsxFactory: 'h', // Custom JSX factory function
            jsxFragment: 'Fragment', // Custom JSX fragment
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'), // Set up path aliases
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css'], // File extensions to resolve
        },
        server: {
            host: '0.0.0.0',
            port: 3000, // Development server port
            open: true, // Automatically open the browser
        },
        build: {
            outDir: path.resolve(__dirname, 'dist/dev'), // Output directory for development builds
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'src/test/index.html'), // Entry point for your application
                },
                output: {
                    assetFileNames: 'assets/[name].[hash].[ext]', // Handle assets like images, fonts, etc.
                },
            },
        },
    }
})
