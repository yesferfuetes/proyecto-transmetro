// Misma configuración que la raíz, más el ordenamiento automático de clases de Tailwind.
import base from '../.prettierrc.json' with { type: 'json' };

/** @type {import('prettier').Config} */
const configuracion = {
  ...base,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/app/globals.css',
};

export default configuracion;
