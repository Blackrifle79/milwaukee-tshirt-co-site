// ------------------------------------------------------------
// Supabase Admin Client (Browser)
// ------------------------------------------------------------

// Your project URL
const SUPABASE_URL = "https://hrercslgttmmtbcjbgpz.supabase.co";

// Your REAL publishable (anon) key here
const SUPABASE_KEY = "sb_publishable_Mq9i8gZNN9blreJp05olCw_Hu2jib2H";

// Create the client using the global `supabase` from the CDN
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Expose globally
window.client = client;
