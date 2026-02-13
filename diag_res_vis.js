const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './Student_Portal/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function diag() {
    console.log('--- DIAGNOSTIC: RESOURCE VISIBILITY ---');

    const { data, error } = await supabase
        .from('resources')
        .select('visibility_status');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const statuses = [...new Set(data.map(d => d.visibility_status))];
    console.log('Actual statuses in DB:', statuses);
}

diag();
