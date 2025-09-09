import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get('lang') || 'en').toLowerCase();

  try {
    const filePath = path.join(process.cwd(), '..', 'content', 'lessons', `${id}.${lang}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(raw);
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }
}
