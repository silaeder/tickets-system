import { NextResponse } from 'next/server';
import prisma from '../../db/db';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.resetCode || !user.resetCodeExpiry) {
      return NextResponse.json({ error: 'No reset code found' }, { status: 400 });
    }

    if (new Date() > user.resetCodeExpiry) {
      return NextResponse.json({ error: 'Reset code expired' }, { status: 400 });
    }

    if (user.resetCode !== code) {
      return NextResponse.json({ error: 'Invalid reset code' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}