import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const filename = request.nextUrl.searchParams.get('filename') || 'ephlats-photo.jpg';

  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  // Only proxy Firebase Storage URLs
  if (
    !url.startsWith('https://firebasestorage.googleapis.com/') &&
    !url.startsWith('https://storage.googleapis.com/')
  ) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: 'Fetch failed' }, { status: 502 });

  const blob = await res.blob();
  const contentType = res.headers.get('content-type') || 'image/jpeg';

  return new NextResponse(blob, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
