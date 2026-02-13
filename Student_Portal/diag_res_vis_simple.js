import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://lznmcazzmzwlfxsczlba.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bm1jYXp6bXp3bGZ4c2N6bGJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwMDAwMDAsImV4cCI6MjAyNjU3NjAwMH0.xxxx' // Need actual key
);
// I'll just use the one from .env if possible.
