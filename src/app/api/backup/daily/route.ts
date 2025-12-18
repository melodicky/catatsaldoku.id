import { NextResponse } from "next/server";
import { performDailyBackup } from "@/lib/backup/daily-backup";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret-change-in-production';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await performDailyBackup();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Backup completed. ${result.totalBackedUp} users backed up.`,
        details: result.results
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Daily backup endpoint. Use POST with authorization.' 
  });
}
