import { createClient as createServerClient } from '@/lib/supabase/server';

export async function getMyBusiness() {
  const supabase = await createServerClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  const { data } = await supabase.from('businesses').select('*').eq('owner_id', user.user.id).single();
  return data;
}

export async function getServices(businessId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase.from('services').select('*').eq('business_id', businessId).order('created_at');
  return data ?? [];
}

export async function getBookings(businessId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase.from('bookings').select('*, services(name)').eq('business_id', businessId).order('start_at', { ascending: false });
  return data ?? [];
}
