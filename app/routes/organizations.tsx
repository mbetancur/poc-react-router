import { db } from "~/db/db";
import type { Route } from "../+types/root";

interface Organization {
  id: number;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export async function loader({ }: Route.LoaderArgs) {
  const orgs = await db.getOrganizations();
  return orgs;
}

export default function Organizations({ loaderData }: Route.ComponentProps) {
  const orgs = Array.isArray(loaderData) ? (loaderData as Organization[]) : [];
  return (
    <>
      <h1 className="text-4xl font-bold mb-4">Organizations</h1>
      <ul>
        {orgs && orgs.map((org) => (
          <li key={org.id}>{org.name}</li>
        ))}
      </ul>
    </>
  );
}
