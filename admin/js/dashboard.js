async function loadDashboard() {
    // Wait for Supabase client
    while (!window.client) {
        await new Promise(r => setTimeout(r, 10));
    }

    // Load root of bucket
    const { data, error } = await window.client
        .storage
        .from("quotes_bucket")
        .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });

    const ticketDiv = document.getElementById("tickets");

    if (!ticketDiv) {
        console.error("tickets div not found");
        return;
    }

    ticketDiv.innerHTML = "<h2>Ticket Folders</h2>";

    if (error) {
        ticketDiv.innerHTML += "<p>Error loading ticket folders.</p>";
        console.error("Storage error:", error);
        return;
    }

    // Filter folders ONLY
    const folders = data.filter(item =>
        item.type === "dir" ||
        item.type === "folder" ||
        item.type === "directory"
    );

    if (folders.length === 0) {
        ticketDiv.innerHTML += "<p>No ticket folders found.</p>";
        return;
    }

    let html = "<ul>";
    folders.forEach(f => {
        html += `
            <li>
                <a class="ticket-link" href="/admin/ticket.html?folder=${encodeURIComponent(f.name)}">
                    ${f.name}
                </a>
            </li>
        `;
    });
    html += "</ul>";

    ticketDiv.innerHTML += html;
}

document.addEventListener("DOMContentLoaded", loadDashboard);
