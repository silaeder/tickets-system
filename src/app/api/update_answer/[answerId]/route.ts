import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

export async function PUT(request: Request, { params }: { params: Promise<{ answerId: string }> }) {
  const { answerId } = await params;
  const { answers } = await request.json();
  const userId = request.headers.get('X-User-ID');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const existingAnswer = await prisma.answer.findUnique({
      where: { id: parseInt(answerId) },
    });

    if (!existingAnswer || existingAnswer.userId !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    await prisma.answer.update({
      where: { id: parseInt(answerId) },
      data: {
        answers,
        status: {
          update: {
            approved: false,
            waiting: true,
            edits_required: false,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Answer updated successfully' });
  } catch (error) {
    console.error('Error updating answer:', error);
    return NextResponse.json({ error: 'Failed to update answer' }, { status: 500 });
  }
}