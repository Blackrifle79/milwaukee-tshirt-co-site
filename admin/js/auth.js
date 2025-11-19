// Redirect to login if not authenticated
async function verifyAuth() {
    // Wait until client is available
    while (!window.client) {
        await new Promise(r => setTimeout(r, 10));
    }

    const { data: { session } } = await window.client.auth.getSession();

    if (!session) {
        window.location.href = "login.html";
    }
}

verifyAuth();
