// ====================================
// ADMIN MENU (Injected on every page)
// ====================================
function insertAdminMenu() {
    const menu = document.createElement("div");
    menu.className = "admin-menu";

    menu.innerHTML = `
        <button class="menu-btn" onclick="goHome()">Home</button>
        <button class="menu-btn" onclick="logout()">Log Out</button>
    `;

    document.body.prepend(menu);
}

function goHome() {
    window.location.href = "/admin/dashboard.html";
}

async function logout() {
    if (!window.client) return;
    await window.client.auth.signOut();
    window.location.href = "/admin/login.html";
}

document.addEventListener("DOMContentLoaded", insertAdminMenu);
