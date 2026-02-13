import { createClient } from '@supabase/supabase-client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './Student_Portal/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function diag() {
    console.log('--- DIAGNOSTIC: ASSIGNMENT SUBMISSIONS ---');

    // 1. Get a student ID (arbitrarily picking the first one from profiles if possible, or we might need the user to provide one. 
    // Let's just list all submissions to see status and scores.)
    const { data: subs, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .limit(10);

    if (error) {
        console.error('Error fetching submissions:', error);
        return;
    }

    console.log('Submissions found:', subs.length);
    subs.forEach(s => {
        console.log(`ID: ${s.id} | Status: ${s.reviewed_status} | Score: ${s.grade_score} | AssignmentID: ${s.assignment_id}`);
    });
}

diag();
