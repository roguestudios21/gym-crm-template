/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    daisyui: {
        themes: ["dark", "business"],
        logs: false,
        themeRoot: ":root",
        styled: true,
        base: true,
        utils: true,
        rtl: false,
        prefix: "",
        darkTheme: "dark",
    },
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'box': '1rem',
                'btn': '0.5rem',
                'badge': '1.9rem',
            }
        },
    },
}
