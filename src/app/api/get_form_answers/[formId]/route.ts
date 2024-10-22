import { NextResponse } from 'next/server';
import prisma from '../../../db/db';

export async function GET(request: Request, { params }: { params: { formId: string } }) {
    const { formId } = params;
    const userId = request.headers.get('X-User-ID');

    if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    try {
    // Check if the user is the creator of the form
    const form = await prisma.form.findUnique({
        where: { id: parseInt(formId) },
        select: { userId: true },
    });

    if (!form || form.userId !== parseInt(userId)) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Fetch answers for the form
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
    const { answerId, status } = await request.json();

    if (!userId) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    try {
        // Check if the user is the creator of the form
        const form = await prisma.form.findUnique({
        where: { id: parseInt(formId) },
        select: { userId: true },
        });

        if (!form || form.userId !== parseInt(userId)) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Update the status
        await prisma.status.update({
        where: { answerId: parseInt(answerId) },
        data: status,
        });

        return NextResponse.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating answer status:', error);
        return NextResponse.json({ error: 'Failed to update answer status' }, { status: 500 });
    }
}