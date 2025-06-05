import { enhance } from '@zenstackhq/runtime';
import { prisma } from './prisma';

let user;
const userExists = await prisma.user.findUnique({
  where: {
    id: "1"
  }
})
if (!userExists) {
  user = await prisma.user.create({
    data: {
      id: "1",
      role: "ADMIN"
    }
  })
}
console.log("USER", user, "USER EXISTS", userExists)
export const enhancedPrisma = enhance(prisma, {
  user: user,
}); 