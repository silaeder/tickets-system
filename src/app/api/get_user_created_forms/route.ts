import { NextResponse } from 'next/server';
import prisma from '../../db/db';

export async function GET(request: Request) {
  const userId = request.headers.get('X-User-ID');
  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const userForms = await prisma.form.findMany({
      where: { userId: parseInt(userId) },
      select: { id: true, name: true, closed: true },
    });

    return NextResponse.json(userForms);
  } catch (error) {
    console.error('Error fetching user forms:', error);
    return NextResponse.json({ error: 'Failed to fetch user forms' }, { status: 500 });
  }
}