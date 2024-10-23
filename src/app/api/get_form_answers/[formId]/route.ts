import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

interface Comment {
  sender: string;
  text: string;
  timestamp: string;
  replies: Comment[];
}

export async function GET(request: Request, { params }: { params: { formId: string } }) {
  const { formId } = params;
  const userId = request.headers.get('X-User-ID');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
      select: { userId: true },
    });

    if (!form || form.userId !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const answers = await prisma.answer.findMany({
      where: { formId: parseInt(formId) },
      include: {
        user: {
          select: { name: true, surname: true },
        },
        status: true,
      },
    });

    return NextResponse.json(answers);
  } catch (error) {
    console.error('Error fetching form answers:', error);
    return NextResponse.json({ error: 'Failed to fetch form answers' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { formId: string } }) {
  const { formId } = params;
  const userId = request.headers.get('X-User-ID');
  const { answerId, status, comment, replyTo } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
      select: { userId: true },
    });

    if (!form || form.userId !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { name: true, surname: true },
    });

    const currentStatus = await prisma.status.findUnique({
      where: { answerId: parseInt(answerId) },
      select: { comments: true },
    });
    
    let updatedComments: Comment[] = [];
    if (Array.isArray(currentStatus?.comments)) {
      updatedComments = (currentStatus.comments as any[]).map(comment => ({
        sender: comment.sender,
        text: comment.text,
        timestamp: comment.timestamp,
        replies: comment.replies || []
      }));
    }

    const newComment: Comment = {
      sender: `${user?.name} ${user?.surname}`,
      text: comment,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    if (replyTo) {
      const addReplyToComment = (comments: Comment[], indices: number[]) => {
        if (indices.length === 1) {
          comments[indices[0]].replies.push(newComment);
        } else {
          addReplyToComment(comments[indices[0]].replies, indices.slice(1));
        }
      };

      addReplyToComment(updatedComments, replyTo.indices);
    } else {
      updatedComments.push(newComment);
    }

    await prisma.status.update({
      where: { answerId: parseInt(answerId) },
      data: {
        ...status,
        comments: updatedComments,
      },
    });

    return NextResponse.json({ message: 'Status and comments updated successfully' });
  } catch (error) {
    console.error('Error updating status and comments:', error);
    return NextResponse.json({ error: 'Failed to update status and comments' }, { status: 500 });
  }
}