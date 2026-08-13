import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  // Simple authentication - you'll call this with a secret
  if (authHeader !== 'Bearer setup-secret-12345') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Run migrations
    await execAsync('npx prisma migrate deploy');

    // Run seed
    await execAsync('npx prisma db seed');

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully! Sample users created.'
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Setup failed',
      details: error.message
    }, { status: 500 });
  }
}
