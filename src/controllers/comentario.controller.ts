import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import { AppError } from '../utils/error.utils';
import {
  aprobarComentario,
  crearComentario,
  eliminarComentario,
  listarPendientes,
  listarPublicados,
} from '../services/comentario.services';

const responderError = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error('Comentario Error:', error);
  return res.status(500).json({ message: 'Error interno del servidor' });
};

export async function listarPublicos(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;
    const items = await listarPublicados(slug);
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({ items });
  } catch (error) {
    return responderError(error, res);
  }
}

export async function crear(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const ipHash = createHash('sha256')
      .update(req.ip ?? req.socket.remoteAddress ?? '')
      .digest('hex');
    const resultado = await crearComentario({
      slug,
      ...req.body,
      ipHash,
    });
    return res.status(201).json(resultado);
  } catch (error) {
    return responderError(error, res);
  }
}

export async function getPendientes(_req: Request, res: Response) {
  try {
    const items = await listarPendientes();
    return res.status(200).json({ items });
  } catch (error) {
    return responderError(error, res);
  }
}

export async function aprobar(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw new AppError(400, 'Id inválido');
    await aprobarComentario(id);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return responderError(error, res);
  }
}

export async function eliminar(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw new AppError(400, 'Id inválido');
    await eliminarComentario(id);
    return res.status(204).send();
  } catch (error) {
    return responderError(error, res);
  }
}
