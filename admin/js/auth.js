// ================================
// LOGIN FUNCTION
// ================================
async function login() {
    while (!window.client) {
        await new Promise(r => setTimeout(r, 10));
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const status = document.getElementById("login-status");

    status.innerText = ""; // no “checking”

    const { data, error } = await window.client.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error(error);
        status.innerText = "Invalid email or password.";
        return;
    }

    window.location.href = "/admin/dashboard.html";
}
