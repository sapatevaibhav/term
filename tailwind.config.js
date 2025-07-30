/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#1e1e1e',
          text: '#f0f0f0',
          command: '#56b6c2',
          output: '#dcdcdc',
          error: '#e06c75',
          llm: '#98c379',
          prompt: '#61afef',
          border: '#333'
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 0.8s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
