import { PrismaClient, UserRole } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.user.upsert({ where: { email: "admin@titas.volei" }, update: {}, create: { name: "Administrador Titãs", email: "admin@titas.volei", passwordHash: "SUBSTITUIR_POR_HASH_ARGON2", role: UserRole.ADMIN } });
  await prisma.team.create({ data: { name: "Titãs Vôlei", city: "Garanhuns", state: "PE" } });
}
main().finally(() => prisma.$disconnect());
