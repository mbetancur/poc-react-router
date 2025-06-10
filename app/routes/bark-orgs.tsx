import { xprisma } from "~/db/prisma";
import type { Route } from "./+types/bark-orgs";
import { Form } from "react-router";
import { useState } from "react";

interface NodeBark {
  id: string;
  path: string;
  depth: number;
  numchild: number;
  name: string;
}

export async function loader() {
  const orgsCount = await xprisma.node.count()
  if (orgsCount === 0) {
    const nodeRoot = await xprisma.node.createRoot({ data: { name: "Fruit Root" } })
    console.log("NODEROOT", nodeRoot)
  }
  const orgs = await xprisma.node.findMany({ orderBy: { created_at: 'desc' }, take: 100 })

  return orgs
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const name = formData.get('name')
  const parentId = formData.get('parentId')
  console.log("NAME", name)
  console.log("PARENT ID", parentId)
  const futureParent = await xprisma.node.findUnique({ where: { id: parentId?.toString() } })
  if (!futureParent) {
    throw new Error("Future parent not found")
  }
  const child = await xprisma.node.createChild({
    node: futureParent,
    data: { name: name as string },
    select: { name: true }
  })
  return child
}

export default function BarkOrgs({ loaderData, actionData }: Route.ComponentProps) {
  const orgs = loaderData as unknown as NodeBark[]

  const [futureParentId, setFutureParentId] = useState<string>()

  return (
    <div>
      <h1>Bark Orgs</h1>
      <Form method="post" action="/bark-orgs">
        <ul className="flex flex-col gap-2  p-4 rounded-md">
          {orgs && orgs.map((org) => (
            <li
              style={{ paddingLeft: org.depth * 100 }}
              key={org.id}
              onClick={() => {
                setFutureParentId(org.id)
              }}
            >
              <p>ID: {org.id}</p>
              <p>Name: {org.name}</p>
              <p>Path: {org.path}</p>
              <p>Depth: {org.depth}</p>
              <p>Numchild: {org.numchild}</p>
            </li>
          ))}
        </ul>
        {futureParentId && (
          <div>
            <p>Selected Parent</p>
            <input id="parentId" type="text" name="parentId" value={futureParentId} required />
          </div>
        )}
        Child name:
        <input id="name" type="text" name="name" required />
        <button className="bg-blue-500 text-white p-2 rounded-md" type="submit" disabled={!futureParentId}>Add child</button>
      </Form>
      {/* {actionData && (
        <p>Child created: {actionData}</p>
      )} */}
    </div>
  )
}