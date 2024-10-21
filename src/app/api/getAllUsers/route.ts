import prisma from "../../db/db";

export async function GET(request: Request) {
    return Response.json(await prisma.user.findMany())
}