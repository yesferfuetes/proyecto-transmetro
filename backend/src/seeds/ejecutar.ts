import fuenteDeDatos from '../shared/database/fuente-datos';
import { leerContrasenaDeSiembra } from './contrasena';
import { sembrar } from './sembrar';

async function ejecutar(): Promise<void> {
  const contrasenaDeUsuarios = leerContrasenaDeSiembra();
  await fuenteDeDatos.initialize();
  try {
    const resumen = await sembrar(fuenteDeDatos, { contrasenaDeUsuarios });
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
