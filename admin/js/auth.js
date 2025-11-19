// Redirect to login if not authenticated
(async () => {
    if (!window.client) {
        console.error("Supabase client missing.");
        window.location.href = "login.html";
        return;
    }

    const { data: { session } } = await window.client.auth.getSession();

    if (!session) {
        window.location.href = "login.html";
    }
})();
