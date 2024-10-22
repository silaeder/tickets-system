import { NextResponse } from 'next/server';
import prisma from '../../db/db';

export async function GET(request: Request) {
  const userId = request.headers.get('X-User-ID');
  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const allForms = await prisma.form.findMany({
      select: { id: true, name: true },
    });

    const userAnswers = await prisma.answer.findMany({
      where: { userId: parseInt(userId) },
      include: {
        form: { select: { name: true } },
        status: true,
      },
    });

    const completedFormIds = new Set(userAnswers.map(answer => answer.formId));
    const availableForms = allForms.filter(form => !completedFormIds.has(form.id));

    return NextResponse.json({ availableForms, completedForms: userAnswers });
  } catch (error) {
    console.error('Error fetching user forms:', error);
    return NextResponse.json({ error: 'Failed to fetch user forms' }, { status: 500 });
  }
}