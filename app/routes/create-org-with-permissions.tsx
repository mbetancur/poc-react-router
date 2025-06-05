import { db } from "~/db/db";
import type { Route } from "./+types/create-org-with-permissions";
import { Form, useFetcher } from "react-router";
import { Validator } from "jsonschema";
import { useState } from "react";
import { resourceLimits } from "worker_threads";

export async function loader() {
  // const permissions = await db.getOrganizationPermissions();
  const permissions = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "id": "https://example.com/product.schema.json",
    "type": "object",
    "properties": {
      "restrictedWords": {
        "pattern": ".*mango.*",
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "List of restricted words that should be filtered"
      }
    },
    "required": ["restrictedWords"]
  }

  return permissions;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const org = await db.createOrganization(name as string);
  return org;
}

export default function CreateOrganization({ actionData, loaderData }: Route.ComponentProps) {
  const [dataToValidate, setDataToValidate] = useState("mango2");
  const permissions = loaderData ?? [];
  console.log("PERMISSIONS", permissions)
  const validator = new Validator();
  const validationResult = validator.validate(dataToValidate, permissions);
  console.log("VALIDATION RESULT", validationResult)
  console.log("VALIDATION RESULT: VALID", validationResult.valid)

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
            onChange={(e) => setDataToValidate(e.target.value)}
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