/**
 * Se ejecuta una vez al arrancar el servidor. Next.js registra los errores de este punto y sigue
 * sirviendo, así que ante una configuración inválida se termina el proceso de forma explícita.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }
  const { leerEntorno } = await import('./config/entorno');
  try {
    leerEntorno();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
