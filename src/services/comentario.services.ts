import { AppError, NotFoundError } from '../utils/error.utils';
import * as comentarioRepository from '../repository/comentario.repository';

const TIENE_ENLACE =
  /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|pe|info|biz|ru|xyz|top|io|me|link)\b/i;
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const limpiarEtiquetas = (cuerpo: string) =>
  cuerpo.replace(/<[^>]*>/g, '').trim();

const esRegistroNoEncontrado = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as { code?: string }).code === 'P2025';

export async function listarPublicados(slug: string) {
  const postId = await comentarioRepository.postIdPublicadoPorSlug(slug);
  if (postId === null) throw new NotFoundError('Post no encontrado');
  return comentarioRepository.publicadosDePost(postId);
}

export async function crearComentario(input: {
  slug: string;
  nombre: string;
  correo?: string;
  cuerpo: string;
  website?: string;
  ipHash: string | null;
}) {
  const { slug, nombre, correo, cuerpo, website, ipHash } = input;

  if (website && website.trim() !== '') {
    return { id: 0, estado: 'pendiente' };
  }

  const postId = await comentarioRepository.postIdPublicadoPorSlug(slug);
  if (postId === null) throw new NotFoundError('Post no encontrado');

  const cuerpoLimpio = limpiarEtiquetas(cuerpo);
  if (cuerpoLimpio.length < 2 || cuerpoLimpio.length > 1000) {
    throw new AppError(
      400,
      'El comentario debe tener entre 2 y 1000 caracteres',
    );
  }

  const nombreLimpio = nombre.trim();
  if (nombreLimpio.length < 1 || nombreLimpio.length > 80) {
    throw new AppError(
      400,
      'El nombre es obligatorio y debe tener como máximo 80 caracteres',
    );
  }

  const correoLimpio = (correo ?? '').trim().toLowerCase();
  if (
    correoLimpio !== '' &&
    (correoLimpio.length > 254 || !CORREO_REGEX.test(correoLimpio))
  ) {
    throw new AppError(400, 'El correo electrónico no es válido');
  }

  const estado = TIENE_ENLACE.test(`${cuerpoLimpio} ${nombreLimpio}`)
    ? 'PENDIENTE'
    : 'PUBLICADO';

  const creado = await comentarioRepository.crear({
    postId,
    nombre: nombreLimpio,
    correo: correoLimpio === '' ? null : correoLimpio,
    cuerpo: cuerpoLimpio,
    estado,
    ipHash: ipHash ?? null,
  });

  return { id: creado.id, estado: creado.estado.toLowerCase() };
}

export async function listarPendientes() {
  return comentarioRepository.pendientes();
}

export async function aprobarComentario(id: number) {
  try {
    return await comentarioRepository.aprobar(id);
  } catch (error) {
    if (esRegistroNoEncontrado(error)) {
      throw new NotFoundError('Comentario no encontrado');
    }
    throw error;
  }
}

export async function eliminarComentario(id: number) {
  try {
    return await comentarioRepository.eliminar(id);
  } catch (error) {
    if (esRegistroNoEncontrado(error)) {
      throw new NotFoundError('Comentario no encontrado');
    }
    throw error;
  }
}
