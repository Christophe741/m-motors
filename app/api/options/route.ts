import { NextResponse } from 'next/server';
import { getAllOptions } from '@/server/database';

export async function GET() {
  try {
    const options = await getAllOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
