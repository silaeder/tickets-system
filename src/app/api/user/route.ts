import { NextResponse } from 'next/server';
import { verifyToken } from '../../utils/jwt';
import prisma from '../../db/db';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true, is_admin: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}