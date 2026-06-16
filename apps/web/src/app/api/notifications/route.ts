import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, readAt: null },
    });

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, readAt: null },
        data: { readAt: new Date() },
      });
    } else if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: session.user.id },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
