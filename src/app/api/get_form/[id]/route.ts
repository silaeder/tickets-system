import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const numericId = Number.parseInt(id, 10);
    const form = await prisma.form.findUnique({
      where: { id: numericId },
      select: { form_description: true, name: true, closed: true },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ fields: form.form_description, name: form.name, closed: form.closed });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}