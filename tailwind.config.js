/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
        "./resources/**/*.ts",
        "./resources/**/*.tsx",
    ],
    theme: {
        extend: {
            colors: {
                maroon: "#5d0f0f",
                limecustom: "#d7ff94",
            },
            fontFamily: {
                libre: ["Libre Bodoni", "serif"],
                placard: [
                    "Placard Next",
                    "Impact",
                    "Arial Black",
                    "sans-serif",
                ],
            },
            animation: {
                scroll: "scroll 20s linear infinite",
                "scroll-reverse": "scroll-reverse 20s linear infinite",
            },
            keyframes: {
                scroll: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
                "scroll-reverse": {
                    "0%": { transform: "translateX(-50%)" },
                    "100%": { transform: "translateX(0)" },
                },
            },
        },
    },
    plugins: [],
};
