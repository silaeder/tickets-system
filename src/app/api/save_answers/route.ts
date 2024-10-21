import { NextResponse } from 'next/server';
import prisma from '../../db/db';

export async function POST(request: Request) {
  const { formId, answers } = await request.json();

  if (!formId || !answers) {
    return NextResponse.json({ error: 'Missing form ID or answers' }, { status: 400 });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    await prisma.form.update({
      where: { id: parseInt(formId) },
      data: {
        answers: {
          push: answers,
        },
      },
    });

    return NextResponse.json({ message: 'Answers saved successfully' });
  } catch (error) {
    console.error('Error saving answers:', error);
    return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
  }
}