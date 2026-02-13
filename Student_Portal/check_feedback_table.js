import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTable() {
    console.log('Checking for lesson_feedback table...');
    const { data, error } = await supabase
        .from('lesson_feedback')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        console.error('Code:', error.code);
    } else {
        console.log('Table exists. Data:', data);
    }
}

checkTable();
