import { xprisma } from "~/db/prisma";

const kiwiId = "cmbky352k0002wlvnulg8v0yg";
async function seed() {
  for (let i = 0; i < 500000; i++) {
    await xprisma.node.createChild({
      where: { id: kiwiId },
      data: { name: `mangoes${i}` },
      select: { name: true }
    })
    console.log(i)
  }
}

await seed()
await seed()
await seed()
await seed()

export { }