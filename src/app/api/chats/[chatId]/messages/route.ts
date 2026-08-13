import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getOwnedChat, deriveTitleFromMessage } from "@/lib/chats";
import { prisma } from "@/lib/prisma";
import { anthropic, ANTHROPIC_MODEL, ATLAS_SYSTEM_PROMPT } from "@/lib/anthropic/client";

const MAX_HISTORY_MESSAGES = 20;

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(8000),
});

export async function POST(
  request: Request,
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

  const body = await request.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message" },
      { status: 400 },
    );
  }
  const { content } = parsed.data;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Atlas is not configured. Set ANTHROPIC_API_KEY on the server." },
      { status: 500 },
    );
  }

  const priorMessages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY_MESSAGES,
    select: { role: true, content: true },
  });

  const userMessage = await prisma.message.create({
    data: { chatId: chat.id, role: "user", content },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  const isFirstMessage = priorMessages.length === 0;

  let assistantContent: string;
  try {
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: ATLAS_SYSTEM_PROMPT,
      messages: [
        ...priorMessages.map((message) => ({
          role: message.role as "user" | "assistant",
          content: message.content,
        })),
        { role: "user" as const, content },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    assistantContent =
      textBlock && textBlock.type === "text"
        ? textBlock.text
        : "I wasn't able to generate a response. Please try again.";
  } catch (error) {
    console.error("Anthropic request failed", error);
    return NextResponse.json(
      { error: "Atlas is temporarily unavailable. Please try again shortly." },
      { status: 502 },
    );
  }

  const assistantMessage = await prisma.message.create({
    data: { chatId: chat.id, role: "assistant", content: assistantContent },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  const updatedChat = await prisma.chat.update({
    where: { id: chat.id },
    data: {
      updatedAt: new Date(),
      ...(isFirstMessage ? { title: deriveTitleFromMessage(content) } : {}),
    },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({
    chat: updatedChat,
    userMessage,
    assistantMessage,
  });
}
