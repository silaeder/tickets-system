import { NextResponse } from 'next/server';
import prisma from '../../db/db';

export async function POST(request: Request) {
  const { formId, answers } = await request.json();
  
  if (!formId || !answers) {
    return NextResponse.json({ error: 'Missing form ID or answers' }, { status: 400 });
  }

  const userId = request.headers.get('X-User-ID');
  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    await prisma.answer.create({
      data: {
        formId: parseInt(formId),
        userId: parseInt(userId),
        answers,
        status: {
          create: {
            approved: false,
            waiting: true,
            edits_required: false,
          },
        },
      },
      include: {
        status: true,
      },
    });

    return NextResponse.json({ 
      message: 'Answers saved successfully'
    });
  } catch (error) {
    console.error('Error saving answers:', error);
    return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
  }
}