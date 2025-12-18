import { createClient } from "@/lib/supabase/server";

export async function performDailyBackup() {
  try {
    const supabase = await createClient();
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) throw profilesError;

    let totalBackedUp = 0;
    const backupResults = [];

    for (const profile of profiles || []) {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id);

      const { data: savingsGoals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', profile.id);

      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', profile.id);

      const { error: backupError } = await supabase
        .from('user_data_backup')
        .insert({
          user_id: profile.id,
          profile_data: profile,
          transactions_data: transactions || [],
          savings_goals_data: savingsGoals || [],
          categories_data: categories || [],
          backup_date: new Date().toISOString(),
        });

      if (!backupError) {
        totalBackedUp++;
        backupResults.push({ user_id: profile.id, status: 'success' });
      } else {
        backupResults.push({ user_id: profile.id, status: 'failed', error: backupError.message });
      }
    }

    await supabase.from('backup_logs').insert({
      backup_type: 'daily_automatic',
      status: 'completed',
      record_count: totalBackedUp,
      details: { results: backupResults },
      backup_date: new Date().toISOString(),
    });

    return { success: true, totalBackedUp, results: backupResults };
  } catch (error) {
    const supabase = await createClient();
    await supabase.from('backup_logs').insert({
      backup_type: 'daily_automatic',
      status: 'failed',
      record_count: 0,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      backup_date: new Date().toISOString(),
    });

    return { success: false, error };
  }
}

export async function getBackupHistory(limit = 30) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('backup_logs')
    .select('*')
    .order('backup_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function restoreUserData(userId: string, backupId: string) {
  const supabase = await createClient();
  
  const { data: backup, error: fetchError } = await supabase
    .from('user_data_backup')
    .select('*')
    .eq('id', backupId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !backup) {
    throw new Error('Backup not found');
  }

  await supabase
    .from('profiles')
    .update(backup.profile_data)
    .eq('id', userId);

  return { success: true, backup };
}
