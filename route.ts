import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    const snippets = await prisma.snippet.findMany({
      where: query
        ? {
            OR: [
              { title: { contains: query } },
              { language: { contains: query } },
              { tags: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(snippets);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar snippets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, code, language, tags } = body;

    if (!title || !code || !language) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes.' },
        { status: 400 }
      );
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        description,
        code,
        language,
        tags: tags || '',
      },
    });

    return NextResponse.json(snippet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar snippet' }, { status: 500 });
  }
}