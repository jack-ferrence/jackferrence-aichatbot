import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOwnedChat } from "@/lib/chats";
import { prisma } from "@/lib/prisma";
import { ChatView } from "@/components/chat-view";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { chatId } = await params;
  const chat = await getOwnedChat(chatId, session.user.id);
  if (!chat) {
    notFound();
  }

  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true },
  });

  return <ChatView chatId={chat.id} title={chat.title} initialMessages={messages} />;
}
