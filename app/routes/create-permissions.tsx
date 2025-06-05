import { Form } from "react-router";
import type { Route } from "./+types/create-permissions";
import { db } from "~/db/db";

const createObjectSchema = (restrictedWords: string) => {
  const restrictedPattern = `.*${restrictedWords}.*`
  return {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "id": "https://example.com/product.schema.json",
    "type": "object",
    "properties": {
      "restrictedWords": {
        "pattern": restrictedPattern,
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "List of restricted words that should be filtered"
      }
    },
    "required": ["restrictedWords"]
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const restrictedWords = formData.get("restrictedWords");
  const permissions = createObjectSchema(restrictedWords as string)
  const organizationPermission = await db.createOrganizationPermission("123", permissions);
  console.log("ORGANIZATION PERMISSION", organizationPermission)
  return { restrictedWords };
}

export default function CreatePermissions({ actionData }: Route.ComponentProps) {
  return (
    <>
      <h1 className="text-4xl font-bold mb-4">Create Permissions</h1>
      <Form method="post">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="restrictedWords">Restricted Words:</label>
            <input
              id="restrictedWords"
              className="border border-blue-300 p-2 rounded-md"
              type="text"
              name="restrictedWords"
              required
            />
          </div>
          <button
            className="bg-blue-500 text-white p-2 rounded-md"
            type="submit"
          >
            Create Permissions
          </button>
        </div>
      </Form>
      {actionData && (
        <p className="mt-4 text-green-600">Permissions created successfully!</p>
      )}
    </>
  );
}
