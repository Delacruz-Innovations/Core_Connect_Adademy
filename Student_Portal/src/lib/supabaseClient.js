import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Client Initializing...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase credentials! Check your .env file.");
} else {
    console.log('✅ Supabase credentials loaded');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
