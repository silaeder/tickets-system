import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

export async function PUT(request: Request, { params }: { params: { formId: string } }) {
  const { formId } = params;
  const { name, fields } = await request.json();
  const userId = request.headers.get('X-User-ID');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
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
      return NextResponse.json({ error: 'Unauthorized - Only admin or form creator can edit this form' }, { status: 403 });
    }

    const updatedForm = await prisma.form.update({
      where: { id: parseInt(formId) },
      data: {
        name,
        form_description: fields
      }
    });

    return NextResponse.json({ message: 'Form updated successfully', formId: updatedForm.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}