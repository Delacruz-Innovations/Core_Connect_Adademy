import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkJane() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', 'jane_student')
        .single();

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Profile found:', data);
    }
}

checkJane();
