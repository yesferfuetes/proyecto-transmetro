import { z } from 'zod';

export const esquemaCredenciales = z.object({
  correo: z
    .email('Escribe un correo válido, por ejemplo ana@muni.gt.')
    .max(150, 'El correo admite hasta 150 caracteres.'),
  contrasena: z
    .string()
    .min(1, 'Escribe tu contraseña.')
    .max(128, 'La contraseña admite hasta 128 caracteres.'),
});
export type Credenciales = z.infer<typeof esquemaCredenciales>;

export const esquemaRespuestaSesion = z.object({
  token: z.string().min(1),
  expiraEn: z.iso.datetime({ offset: true }),
});
export type RespuestaSesion = z.infer<typeof esquemaRespuestaSesion>;
