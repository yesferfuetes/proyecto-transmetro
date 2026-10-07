import fuenteDeDatos from '../shared/database/fuente-datos';
import { sembrar } from './sembrar';

async function ejecutar(): Promise<void> {
  await fuenteDeDatos.initialize();
  try {
    const resumen = await sembrar(fuenteDeDatos);
    for (const [grupo, conteo] of Object.entries(resumen)) {
      console.log(
        `${grupo}: ${conteo.insertados} insertados, ${conteo.actualizados} actualizados, ${conteo.sinCambios} sin cambios`,
      );
    }
  } finally {
    await fuenteDeDatos.destroy();
  }
}

ejecutar().catch((error: unknown) => {
  console.error('La siembra falló; no se guardó ningún cambio.', error);
  process.exitCode = 1;
});
