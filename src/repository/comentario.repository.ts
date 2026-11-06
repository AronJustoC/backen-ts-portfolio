import { prisma } from '../utils/prisma.utils';

export async function postIdPublicadoPorSlug(
  slug: string,
): Promise<number | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });
  return post?.id ?? null;
}

export async function publicadosDePost(postId: number) {
  return prisma.comentario.findMany({
    where: { postId, estado: 'PUBLICADO' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, nombre: true, cuerpo: true, createdAt: true },
  });
}

export async function pendientes() {
  return prisma.comentario.findMany({
    where: { estado: 'PENDIENTE' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nombre: true,
      correo: true,
      cuerpo: true,
      createdAt: true,
      post: { select: { title: true, slug: true } },
    },
  });
}

export async function crear(datos: {
  postId: number;
  nombre: string;
  correo: string | null;
  cuerpo: string;
  estado: 'PENDIENTE' | 'PUBLICADO';
  ipHash: string | null;
}) {
  return prisma.comentario.create({ data: datos });
}

export async function aprobar(id: number) {
  return prisma.comentario.update({
    where: { id },
    data: { estado: 'PUBLICADO' },
  });
}

export async function eliminar(id: number) {
  return prisma.comentario.delete({ where: { id } });
}
