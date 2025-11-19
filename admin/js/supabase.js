// ------------------------------------------------------------
// Supabase Admin Client (Browser)
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = "https://hrercslgttmmtbcjbgpz.supabase.co";
    const SUPABASE_KEY = "sb_publishable_Mq9i8gZNN9blreJp05olCw_Hu2jib2H";

    if (typeof supabase === "undefined") {
        console.error("❌ Supabase library failed to load.");
        return;
    }

    // Create the client using the global `supabase` from the CDN
    window.client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log("✅ Supabase client initialized.");
});
