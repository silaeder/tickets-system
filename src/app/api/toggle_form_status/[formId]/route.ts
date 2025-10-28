import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../db/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const userId = request.headers.get('X-User-ID');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const { formId: formIdParam } = await params;
    const formId = parseInt(formIdParam);

    if (isNaN(formId)) {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 });
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { user: true }
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { is_admin: true }
    });

    if (!user?.is_admin && form.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized - Only admin or form creator can modify this form' },
        { status: 403 }
      );
    }

    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: { closed: !form.closed },
    });

    return NextResponse.json({
      message: 'Form status updated successfully',
      form: updatedForm
    });
  } catch (error) {
    console.error('Error updating form status:', error);
    return NextResponse.json(
      { error: 'Failed to update form status' },
      { status: 500 }
    );
  }
}