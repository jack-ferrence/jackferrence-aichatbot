import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        chats={chats.map((chat) => ({
          ...chat,
          updatedAt: chat.updatedAt.toISOString(),
        }))}
        userEmail={session.user.email ?? ""}
      />
      <main className="flex min-h-screen flex-1 flex-col bg-white">{children}</main>
    </div>
  );
}
