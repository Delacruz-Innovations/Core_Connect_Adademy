import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Checking Supabase connection...");
    try {
        const { data, error } = await supabase.from('profiles').select('count').single();
        if (error) throw error;
        console.log("Profiles count:", data);

        const { data: courses, error: cError } = await supabase.from('courses').select('id, title').limit(5);
        if (cError) throw cError;
        console.log("Courses found:", courses.length);

        const { data: apps, error: aError } = await supabase.from('applications').select('id').limit(5);
        if (aError) throw aError;
        console.log("Applications found:", apps.length);

    } catch (err) {
        console.error("Supabase Error:", err.message);
    }
}

check();
