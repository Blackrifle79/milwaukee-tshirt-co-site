// Redirect to login if not authenticated
async function verifyAuth() {
    // Wait until client is available
    while (!window.client) {
        await new Promise(r => setTimeout(r, 10));
    }

    const { data: { session } } = await window.client.auth.getSession();

    const currentPage = window.location.pathname;

    // ❗ Prevent infinite redirect loop on login page
    if (!session && !currentPage.includes("login.html")) {
        window.location.href = "login.html";
    }
}

verifyAuth();
