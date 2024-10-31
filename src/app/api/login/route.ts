import { NextResponse } from 'next/server';
import prisma from '../../db/db';
import bcrypt from 'bcrypt';
import { signToken } from '../../utils/jwt';
import { strict } from 'assert';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signToken({ userId: user.id });

  const response = NextResponse.json({ message: 'Login successful' });
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 31536000
  });

  return response;
}