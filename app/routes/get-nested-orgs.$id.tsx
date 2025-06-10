import { db } from "~/db/db";
import type { Route } from "./+types/get-nested-orgs.$id";

interface Organization {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  is_enabled: boolean;
  is_public: boolean;
  rank: number;
  parent_id: string | null;
  child_organizations: {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    is_enabled: boolean;
    is_public: boolean;
    rank: number;
    parent_id: string | null;
  }[];
}

export async function loader({ params }: Route.LoaderArgs) {
  const org = await db.getOrganizationWithChildren(params.id);
  return org;
}

export default function GetNestedOrgs({ loaderData }: Route.ComponentProps) {
  const org = loaderData as Organization;

  return (
    <>
      <h1 className="text-4xl font-bold mb-4">Organization Hierarchy</h1>
      <div className="border border-gray-200 p-4 rounded-md">
        <h2 className="text-xl font-semibold">{org.name}</h2>
        <div className="text-sm text-gray-500">
          Created: {new Date(org.created_at).toLocaleDateString()}
        </div>
        {org.child_organizations && org.child_organizations.length > 0 ? (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Child Organizations:</h3>
            <ul className="list-disc pl-5">
              {org.child_organizations.map((child) => (
                <li key={child.id} className="text-gray-700">
                  {child.name}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-gray-500">No child organizations found.</p>
        )}
      </div>
    </>
  );
}
