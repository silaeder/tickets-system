import { NextResponse } from 'next/server';
import prisma from '../../db/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { email, password, name, second_name, surname } = await request.json();

  if (!email || !password || !name || !surname) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      second_name,
      surname,
    },
  });

  return NextResponse.json({ message: 'User registered successfully', userId: newUser.id });
}