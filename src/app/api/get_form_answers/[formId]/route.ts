import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

import { sendStatusUpdateEmail } from '../../../utils/email';

interface Comment {
  sender: string;
  text: string;
  timestamp: string;
  replies: Comment[];
}

export async function GET(request: Request, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
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
          select: { name: true, surname: true, second_name: true },
        },
        status: true,
        form: {
          select: { form_description: true }
        }
      },
    });

    return NextResponse.json(answers);
  } catch (error) {
    console.error('Error fetching form answers:', error);
    return NextResponse.json({ error: 'Failed to fetch form answers' }, { status: 500 });
  }
}

function isComment(obj: any): obj is Comment {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.sender === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.timestamp === 'string' &&
    Array.isArray(obj.replies)
  );
}

function isCommentArray(arr: any): arr is Comment[] {
  return Array.isArray(arr) && arr.every(isComment);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const userId = request.headers.get('X-User-ID');
  const { answerId, status, comment, replyTo } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    // Get form and verify ownership
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
      select: { userId: true, name: true },
    });

    if (!form || form.userId !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Get user info for comment
    const adminUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { name: true, surname: true },
    });

    // Get answer user's email and current status
    const answer = await prisma.answer.findUnique({
      where: { id: parseInt(answerId) },
      include: {
        user: {
          select: { email: true }
        },
        status: {
          select: { comments: true }
        }
      }
    });

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // Prepare updated comments
    let updatedComments: Comment[] = [];

    if (answer.status?.comments) {
      const commentsData = answer.status.comments;
      if (isCommentArray(commentsData)) {
        updatedComments = [...commentsData];
      }
    }
  
    if (comment) {
      const newComment: Comment = {
        sender: `${adminUser?.name} ${adminUser?.surname}`,
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
    }

    // Update status
    await prisma.status.update({
      where: { answerId: parseInt(answerId) },
      data: {
        ...status,
        comments: updatedComments,
      },
    });

    // Send email notification if user has email
    if (answer.user.email && form.name) {
      await sendStatusUpdateEmail(
        answer.user.email,
        form.name,
        status,
        comment
      );
    }

    return NextResponse.json({ message: 'Status and comments updated successfully' });
  } catch (error) {
    console.error('Error updating status and comments:', error);
    return NextResponse.json({ error: 'Failed to update status and comments' }, { status: 500 });
  }
}