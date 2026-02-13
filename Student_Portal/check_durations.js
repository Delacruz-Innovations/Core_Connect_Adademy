import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDurations() {
    console.log('Checking lesson durations...');
    const { data: lessons, error } = await supabase
        .from('lessons')
        .select('id, title, duration_seconds')
        .limit(10);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Sample Lessons:', lessons);
        const hasDuration = lessons.some(l => l.duration_seconds > 0);
        console.log('Has explicit duration data:', hasDuration);
    }
}

checkDurations();
