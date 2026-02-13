const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './Student_Portal/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function diag() {
    console.log('--- DIAGNOSTIC: ASSIGNMENT SUBMISSIONS RAW ---');

    const { data: subs, error } = await supabase
        .from('assignment_submissions')
        .select('id, assignment_id, reviewed_status, grade_score, user_id')
        .limit(20);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.table(subs);
}

diag();
