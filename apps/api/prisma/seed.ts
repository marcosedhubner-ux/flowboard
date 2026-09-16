import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Passw0rd!123", 12);

  const [nova, priya, theo] = await Promise.all([
    prisma.user.upsert({
      where: { email: "nova@flowboard.dev" },
      update: {},
      create: { fullName: "Nova Ibrahim", email: "nova@flowboard.dev", passwordHash },
    }),
    prisma.user.upsert({
      where: { email: "priya@flowboard.dev" },
      update: {},
      create: { fullName: "Priya Desai", email: "priya@flowboard.dev", passwordHash },
    }),
    prisma.user.upsert({
      where: { email: "theo@flowboard.dev" },
      update: {},
      create: { fullName: "Theo Marchetti", email: "theo@flowboard.dev", passwordHash },
    }),
  ]);

  let board = await prisma.board.findFirst({ where: { name: "Product Launch", createdById: nova.id } });
  if (!board) {
    board = await prisma.board.create({
      data: {
        name: "Product Launch",
        createdById: nova.id,
        members: {
          create: [
            { userId: nova.id, role: "OWNER" },
            { userId: priya.id, role: "MEMBER" },
            { userId: theo.id, role: "MEMBER" },
          ],
        },
        columns: {
          create: [
            { name: "To Do", position: 65536 },
            { name: "In Progress", position: 131072 },
            { name: "Done", position: 196608 },
          ],
        },
      },
      include: { columns: true },
    });

    const todo = board.columns.find((c) => c.name === "To Do")!;
    const inProgress = board.columns.find((c) => c.name === "In Progress")!;
    const done = board.columns.find((c) => c.name === "Done")!;

    await prisma.card.createMany({
      data: [
        {
          boardId: board.id,
          columnId: todo.id,
          title: "Write launch announcement blog post",
          description: "Cover the three headline features and link the changelog.",
          position: 65536,
          createdById: nova.id,
          assigneeId: priya.id,
        },
        {
          boardId: board.id,
          columnId: todo.id,
          title: "Line up launch-day social posts",
          position: 131072,
          createdById: nova.id,
        },
        {
          boardId: board.id,
          columnId: inProgress.id,
          title: "Finish onboarding flow redesign",
          description: "Figma file is linked in #design.",
          position: 65536,
          createdById: theo.id,
          assigneeId: theo.id,
        },
        {
          boardId: board.id,
          columnId: inProgress.id,
          title: "Load test the API before the traffic spike",
          position: 131072,
          createdById: priya.id,
          assigneeId: priya.id,
        },
        {
          boardId: board.id,
          columnId: done.id,
          title: "Finalize pricing page copy",
          position: 65536,
          createdById: nova.id,
          assigneeId: nova.id,
        },
      ],
    });

    await prisma.activityEvent.createMany({
      data: [
        { boardId: board.id, actorId: nova.id, message: 'created the board' },
        { boardId: board.id, actorId: nova.id, message: "added Priya Desai to the board" },
        { boardId: board.id, actorId: nova.id, message: "added Theo Marchetti to the board" },
        { boardId: board.id, actorId: theo.id, message: 'created card "Finish onboarding flow redesign"' },
      ],
    });
  }

  console.log("Seed complete. Accounts (password: Passw0rd!123):");
  console.log(`  ${nova.email}, ${priya.email}, ${theo.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
