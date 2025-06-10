import { db } from "~/db/db";
import type { Route } from "./+types/create-organization";
import { Form, useFetcher } from "react-router";
import { RoleSchema } from "generated/zen/zod/enums";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const org = await db.createOrganization(name as string);
  // const orgToUser = await db.getOrganizationToUser()
  // const orgToUser = await db.createOrganizationToUser(org.id, "1", Role.ADMIN)
  // Move next line to create org DB fn
  // const orgToUser = await db.createOrganizationToUser(org.id, "1", RoleSchema.enum.ADMIN) 
  return org;
}

export default function CreateOrganization({ actionData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  return (
    <>
      <h1 className="text-4xl font-bold mb-4">Create Organization</h1>
      <div className="flex gap-4 items-center">
        <Form method="post">
          <input className="border border-blue-300 p-2 rounded-md" type="text" name="name" />
          <button className="bg-blue-500 text-white p-2 rounded-md" type="submit">Create Here</button>
        </Form>
        <fetcher.Form method="post" action="/organizations">
          <input
            className="border border-blue-300 p-2 rounded-md"
            type="text"
            name="name"
            disabled={isSubmitting}
          />
          <button
            className="bg-blue-500 text-white p-2 rounded-md disabled:bg-blue-300"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create in Organizations"}
          </button>
        </fetcher.Form>
      </div>
      {actionData ? (
        <p className="mt-4 text-green-600">{actionData.name} created here</p>
      ) : null}
      {fetcher.data ? (
        <p className="mt-4 text-green-600">{fetcher.data.name} created in organizations list</p>
      ) : null}
    </>
  )
}