import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: 'assets/*',
                    dest: 'assets'
                }
            ]
        })
    ],
    build: {
        outDir: 'dist', // Папка для сборки
        minify: 'terser', // Минификация с использованием Terser (по умолчанию)
        sourcemap: false, // Отключение sourcemap для продакшн-сборки
        rollupOptions: {
            input: '/index.html', // Указываем точку входа
        },
    },
});