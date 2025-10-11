import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  gemini_key?: string;
  avatar_url?: string;
}

/**
 * Get the current authenticated user's profile information
 * @returns Promise that resolves to user profile or null if not authenticated
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = createClientComponentClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata.full_name || '',
    gemini_key: user.user_metadata.gemini_key,
    avatar_url: user.user_metadata.avatar_url,
  };
}

/**
 * Check if the current user is authenticated
 * @returns Promise that resolves to true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get a user's public profile by their ID
 * @param userId The user ID to fetch profile for
 * @returns Promise that resolves to public user profile data
 */
export async function getUserPublicProfile(userId: string): Promise<Omit<UserProfile, 'gemini_key'> | null> {
  const supabase = createClientComponentClient();
  
  // Fetch user from auth.users 
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data as Omit<UserProfile, 'gemini_key'>;
}
