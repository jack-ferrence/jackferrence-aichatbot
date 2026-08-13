import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOwnedChat } from "@/lib/chats";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const chat = await getOwnedChat(chatId, session.user.id);
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return NextResponse.json({ chat, messages });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const chat = await getOwnedChat(chatId, session.user.id);
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  await prisma.chat.delete({ where: { id: chat.id } });

  return NextResponse.json({ success: true });
}
