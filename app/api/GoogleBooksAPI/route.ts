// app/api/GoogleBooksAPI/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required.' }, { status: 400 });
  }

  try {
    const apiRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}`
    );

    if (!apiRes.ok) {
      throw new Error(`Google Books API responded with status ${apiRes.status}`);
    }

    const data = await apiRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Google Books API:', error);
    return NextResponse.json({ error: 'Error fetching data from Google Books API.' }, { status: 500 });
  }
}
