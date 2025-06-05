import { enhancedPrisma } from './zenstack';

export const db = {
  async getOrganizations() {
    return enhancedPrisma.organization.findMany({
      orderBy: { created_at: 'desc' }
    });
  },

  async getOrganization(id: string) {
    return enhancedPrisma.organization.findUnique({
      where: { id }
    });
  },

  async createOrganization(name: string) {
    return enhancedPrisma.organization.create({
      data: { name }
    });
  },

  async createOpportunity(name: string, organizationId: string) {
    return enhancedPrisma.opportunity.create({
      data: { name, organization: { connect: { id: organizationId } } }
    });
  },

  async getOpportunities() {
    return enhancedPrisma.opportunity.findMany();
  },

  async getOrganizationToUser() {
    return enhancedPrisma.organizationToUser.findMany()
  },

  async createOrganizationToUser(organizationId: string, userId: string, role_to_org: any) {
    return enhancedPrisma.organizationToUser.create({
      data: { role_to_org, organization: { connect: { id: organizationId } }, user: { connect: { id: userId } } }
    })
  },

  async getOrganizationPermissions() {
    return enhancedPrisma.organizationPermission.findMany()
  },

  async createOrganizationPermission(organizationId: string, permissions: any) {
    return enhancedPrisma.organizationPermission.create({
      data: { organization: { connect: { id: organizationId } }, permissions }
    })
  }
};