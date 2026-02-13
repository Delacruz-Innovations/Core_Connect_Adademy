import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

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
        console.error('Error fetching resources:', error);
        return;
    }

    const statuses = [...new Set(data.map(d => d.visibility_status))];
    console.log('Actual statuses in DB:', statuses);
}

diag();
