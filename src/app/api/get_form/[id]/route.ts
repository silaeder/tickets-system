import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(id) },
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