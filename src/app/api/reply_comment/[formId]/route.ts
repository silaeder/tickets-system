import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

export async function POST(request: Request, { params }: { params: { formId: string } }) {
  const { formId } = params;
  const userId = request.headers.get('X-User-ID');
  const { replyTo, replyText } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { name: true, surname: true },
    });

    const answer = await prisma.answer.findFirst({
      where: { formId: parseInt(formId), userId: parseInt(userId) },
      include: { status: true },
    });

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    let updatedComments = answer.status?.comments as any[] || [];
    const newReply = {
      sender: `${user?.name} ${user?.surname}`,
      text: replyText,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    const addReplyToComment = (comments: any[], indices: number[]) => {
      let currentComment = comments;
      for (let i = 0; i < indices.length; i++) {
        if (i === indices.length - 1) {
          if (!currentComment[indices[i]].replies) {
            currentComment[indices[i]].replies = [];
          }
          currentComment[indices[i]].replies.push(newReply);
        } else {
          if (!currentComment[indices[i]] || !currentComment[indices[i]].replies) {
            return false; // Invalid path
          }
          currentComment = currentComment[indices[i]].replies;
        }
      }
      return true;
    };

    if (replyTo && replyTo.indices) {
      const success = addReplyToComment(updatedComments, replyTo.indices);
      if (!success) {
        return NextResponse.json({ error: 'Invalid reply path' }, { status: 400 });
      }
    } else {
      updatedComments.push(newReply);
    }

    await prisma.status.update({
      where: { answerId: answer.id },
      data: { comments: updatedComments },
    });

    return NextResponse.json({ message: 'Reply added successfully' });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
  }
}