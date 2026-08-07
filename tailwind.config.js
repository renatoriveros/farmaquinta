import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    safelist: [
        { pattern: /bg-(sky|orange|rose)-(50|100|200|400|600)/ },
        { pattern: /border-(sky|orange|rose)-(100|200|400|600)/ },
        { pattern: /text-(sky|orange|rose)-(100|200|400|600|800)/ },
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
