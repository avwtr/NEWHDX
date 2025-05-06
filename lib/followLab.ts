import { supabase } from "@/lib/supabaseClient"

// Check if user is following the lab
export async function isFollowingLab(labId: string, userId: string) {
  const { data, error } = await supabase
    .from("labFollowers")
    .select("id")
    .eq("labId", labId)
    .eq("userId", userId)
    .maybeSingle();
  return !!data;
}

// Follow a lab
export async function followLab(labId: string, userId: string) {
  const { error } = await supabase
    .from("labFollowers")
    .insert([{ labId, userId }]);
  return !error;
}

// Unfollow a lab
export async function unfollowLab(labId: string, userId: string) {
  const { error } = await supabase
    .from("labFollowers")
    .delete()
    .eq("labId", labId)
    .eq("userId", userId);
  return !error;
} 