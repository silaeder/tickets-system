import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

type Comment = {
  sender: string;
  text: string;
  timestamp: string;
  replies: Comment[];
};

export async function POST(request: Request, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const userId = request.headers.get('X-User-ID');
  const { replyTo, replyText } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { name: true, surname: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get answer with status
    const answer = await prisma.answer.findFirst({
      where: { id: parseInt(formId) },
      include: { status: true },
    });

    if (!answer || !answer.status) {
      return NextResponse.json({ error: 'Answer or status not found' }, { status: 404 });
    }

    // Prepare comments array and new reply
    let updatedComments = (answer.status.comments as Comment[]) || [];
    const newReply: Comment = {
      sender: `${user.name} ${user.surname}`,
      text: replyText,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    // Helper function to add reply to nested comments
    const addReplyToComment = (comments: Comment[], indices: number[]): boolean => {
      if (!Array.isArray(comments)) return false;
      
      let currentComments = comments;
      for (let i = 0; i < indices.length; i++) {
        const currentIndex = indices[i];
        
        // Check if index is valid
        if (currentIndex < 0 || currentIndex >= currentComments.length) {
          return false;
        }

        if (i === indices.length - 1) {
          // Add reply to the target comment
          if (!currentComments[currentIndex].replies) {
            currentComments[currentIndex].replies = [];
          }
          currentComments[currentIndex].replies.push(newReply);
          return true;
        } else {
          // Move deeper into the reply chain
          if (!currentComments[currentIndex].replies) {
            return false;
          }
          currentComments = currentComments[currentIndex].replies;
        }
      }
      return true;
    };

    // Add the reply either to a specific comment or as a new top-level comment
    if (replyTo && Array.isArray(replyTo.indices)) {
      const success = addReplyToComment(updatedComments, replyTo.indices);
      if (!success) {
        return NextResponse.json({ error: 'Invalid reply path' }, { status: 400 });
      }
    } else {
      updatedComments.push(newReply);
    }

    // Update the status with new comments
    await prisma.status.update({
      where: { answerId: answer.id },
      data: { comments: updatedComments },
    });

    return NextResponse.json({ 
      message: 'Reply added successfully',
      comments: updatedComments 
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ 
      error: 'Failed to add reply',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}