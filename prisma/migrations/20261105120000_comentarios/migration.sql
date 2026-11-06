-- CreateEnum
CREATE TYPE "EstadoComentario" AS ENUM ('PENDIENTE', 'PUBLICADO');

-- CreateTable
CREATE TABLE "Comentario" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "correo" VARCHAR(254),
    "cuerpo" TEXT NOT NULL,
    "estado" "EstadoComentario" NOT NULL DEFAULT 'PENDIENTE',
    "ipHash" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comentario_postId_estado_idx" ON "Comentario"("postId", "estado");

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
