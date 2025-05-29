import { enhancedPrisma } from './zenstack';

export const db = {
  async getOrganizations() {
    return enhancedPrisma.organization.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },

  async getOrganization(id: number) {
    return enhancedPrisma.organization.findUnique({
      where: { id }
    });
  },

  async createOrganization(name: string) {
    return enhancedPrisma.organization.create({
      data: { name }
    });
  }
};