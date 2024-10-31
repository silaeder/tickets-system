import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

export async function GET(request: Request, { params }: { params: { answerId: string } }) {
  const { answerId } = params;
  const userId = request.headers.get('X-User-ID');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const answer = await prisma.answer.findUnique({
      where: { id: parseInt(answerId) },
      include: {
        form: {
          select: {
            name: true,
            form_description: true,
          },
        },
      },
    });

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    if (answer.userId !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    return NextResponse.json(answer);
  } catch (error) {
    console.error('Error fetching answer:', error);
    return NextResponse.json({ error: 'Failed to fetch answer' }, { status: 500 });
  }
}