import { NextResponse } from 'next/server';
import { getAllOptions } from '@/server/database';
import { withErrorHandler } from '@/lib/api-handler';

export const GET = withErrorHandler(async () => {
  const options = await getAllOptions();
  return NextResponse.json(options);
});
