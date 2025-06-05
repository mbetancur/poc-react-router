import { db } from "~/db/db";
import type { Route } from "./+types/opportunities";

interface Opportunity {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  organization: {
    id: string;
    name: string;
  };
}

export async function loader() {
  const opportunities = await db.getOpportunities();
  return opportunities;
}

export default function Opportunities({ loaderData }: Route.ComponentProps) {
  const opportunities = Array.isArray(loaderData) ? (loaderData as Opportunity[]) : [];

  return (
    <>
      <h1 className="text-4xl font-bold mb-4">Opportunities</h1>
      <div className="grid gap-4">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="border border-gray-200 p-4 rounded-md">
            <h2 className="text-xl font-semibold">{opportunity.name}</h2>
            <div className="text-gray-600">
              Organization: {opportunity.organization.name}
            </div>
            <div className="text-sm text-gray-500">
              Created: {new Date(opportunity.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {opportunities.length === 0 && (
          <p className="text-gray-500">No opportunities found.</p>
        )}
      </div>
    </>
  );
}



