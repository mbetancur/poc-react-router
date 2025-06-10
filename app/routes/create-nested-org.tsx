import { db } from "~/db/db";
import type { Route } from "./+types/create-nested-org";
import { Form } from "react-router";

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
  const parentId = formData.get("parentId") as string;
  console.log("PARENT ID", parentId)
  console.log("NAME", name)

  if (parentId) {
    const childOrg = await db.createChildOrganization(name, parentId);
    console.log("CHILD ORG", childOrg)
    return childOrg;
  }
  const parentOrg = await db.createParentOrganization(name);
  console.log("PARENT ORG", parentOrg)
  return parentOrg;
}

export default function CreateNestedOrg({ loaderData, actionData }: Route.ComponentProps) {
  const organizations = Array.isArray(loaderData) ? (loaderData as Organization[]) : [];

  return (
    <>
      <h1 className="text-4xl font-bold mb-4">Create Nested Organization</h1>
      <Form method="post">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="name">Organization Name:</label>
            <input
              id="name"
              className="border border-blue-300 p-2 rounded-md"
              type="text"
              name="name"
              required
            />
          </div>
          <div>
            <label htmlFor="parentId">Parent Organization (Optional):</label>
            <select
              id="parentId"
              name="parentId"
              className="bg-black border border-blue-300 p-2 rounded-md"
            >
              <option value="">No Parent Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            type="submit"
          >
            Create Organization
          </button>
        </div>
      </Form>
      {actionData ? (
        <p className="mt-4 text-green-600">{actionData.name} created here</p>
      ) : null}

    </>
  );
}
