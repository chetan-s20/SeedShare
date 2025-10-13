import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types/database.types';

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return profile as Profile;
}

export async function checkRole(requiredRoles: string[]): Promise<boolean> {
  const profile = await getCurrentUser();
  
  if (!profile) return false;
  
  return requiredRoles.includes(profile.role);
}
