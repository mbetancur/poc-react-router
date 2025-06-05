import { db } from "~/db/db";
import type { Route } from "./+types/create-opportunity";
import { Form, useFetcher } from "react-router";

interface Organization {
  id: string;
  name: string;
}

export async function loader() {
  const orgs = await db.getOrganizations();
  return orgs;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const organizationId = formData.get("organizationId") as string;

  const opportunity = await db.createOpportunity(name, organizationId);
  return opportunity;
}

export default function CreateOpportunity({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const organizations = Array.isArray(loaderData) ? (loaderData as Organization[]) : [];

  return (
    <>
      <h1 className="text-4xl font-bold mb-4">Create Opportunity</h1>
      <Form method="post">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              className="border border-blue-300 p-2 rounded-md"
              type="text"
              name="name"
              required
            />
          </div>
          <div>
            <label htmlFor="organizationId">Organization:</label>
            <select
              id="organizationId"
              name="organizationId"
              className="border border-blue-300 p-2 rounded-md"
              required
            >
              <option value="">Select an organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="bg-blue-500 text-white p-2 rounded-md disabled:bg-blue-300"
            type="submit"
          >
            {isSubmitting ? "Creating..." : "Create Opportunity"}
          </button>
        </div>
      </Form>
      {fetcher.data?.error && (
        <p className="mt-4 text-red-600">{fetcher.data.error}</p>
      )}
      {fetcher.data && !fetcher.data.error && (
        <p className="mt-4 text-green-600">Opportunity created successfully!</p>
      )}
    </>
  );
}
