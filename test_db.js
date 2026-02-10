import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lznmcazzmzwlfxsczlba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bm1jYXp6bXp3bGZ4c2N6bGJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Njc0NjEsImV4cCI6MjA4NjA0MzQ2MX0._WYeX_gkIMCGMzTeHiBSI7VJRZrfoNvE-rK1kKaXQt8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log("--- Testing lesson_questions Fetch ---");
    const { data, error } = await supabase
        .from('lesson_questions')
        .select('*');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data count:", data.length);
        console.log("Sample Data:", JSON.stringify(data[0], null, 2));
    }
}

testFetch();
