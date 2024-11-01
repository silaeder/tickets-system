import { NextResponse } from 'next/server';
import prisma from '../../db/db';

export async function POST(request: Request) {
  const { name, fields } = await request.json();

  if (!name || !fields) {
    return NextResponse.json({ error: 'Missing form name or fields' }, { status: 400 });
  }

  const userId = request.headers.get('X-User-ID');
  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { is_admin: true }
    });

    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const newForm = await prisma.form.create({
        data: {
          name,
          form_description: fields,
          userId: parseInt(userId)
        },
    });

    return NextResponse.json({ message: 'Form saved successfully', formId: newForm.id });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
  }
}