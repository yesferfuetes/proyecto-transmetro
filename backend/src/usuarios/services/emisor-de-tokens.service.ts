import { Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

/** Una sesión dura un turno de operación, sin renovación. */
export const DURACION_SESION_SEGUNDOS = 28_800;

export interface TokenDeSesion {
  token: string;
  expiraEn: Date;
}

export type VerificacionDeToken = { usuarioId: number } | 'vencido' | 'invalido';

interface Contenido {
  sub?: unknown;
  exp?: unknown;
}

/** Emite y verifica el token de sesión. Solo lleva el id del usuario: rol y estación se leen de la base. */
@Injectable()
export class EmisorDeTokens {
  constructor(private readonly jwt: JwtService) {}

  emitir(usuarioId: number): TokenDeSesion {
    const token = this.jwt.sign(
      { sub: String(usuarioId) },
      { algorithm: 'HS256', expiresIn: DURACION_SESION_SEGUNDOS },
    );
    const { exp } = this.jwt.decode<Contenido>(token);
    return { token, expiraEn: new Date(Number(exp) * 1000) };
  }

  verificar(token: string): VerificacionDeToken {
    let contenido: Contenido;
    try {
      contenido = this.jwt.verify<Contenido>(token, { algorithms: ['HS256'] });
    } catch (error) {
      return error instanceof TokenExpiredError ? 'vencido' : 'invalido';
    }
    const usuarioId = Number(contenido.sub);
    if (typeof contenido.sub !== 'string' || !Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
      return 'invalido';
    }
    return { usuarioId };
  }
}
