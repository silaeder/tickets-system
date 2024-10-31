import { NextResponse } from 'next/server';
import prisma from '../../db/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}