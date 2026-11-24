import { supabase } from './supabase';

const MAX_BYTES = 10 * 1024 * 1024;

export const TOO_LARGE = 'too_large';

export async function uploadFile(file: File, folder: string): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error(TOO_LARGE);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from('media')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}
