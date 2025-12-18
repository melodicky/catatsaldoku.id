import { createClient } from "@/lib/supabase/server";
import { checkAndCreateNotifications } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await checkAndCreateNotifications(user.id);

  return NextResponse.json({ success: true });
}
