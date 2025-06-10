import { PrismaClient } from "@prisma/client";
import { withBark } from "prisma-extension-bark";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export const xprisma = new PrismaClient().$extends(withBark({ modelNames: ['node'] }))