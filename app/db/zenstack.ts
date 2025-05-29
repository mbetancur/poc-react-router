import { PrismaClient } from '@prisma/client';
import { enhance } from '@zenstackhq/runtime';
import { prisma } from './prisma';

// Create an enhanced Prisma client with ZenStack features
export const enhancedPrisma = enhance(prisma, {
  // You can add user context here later
  user: undefined,
}); 