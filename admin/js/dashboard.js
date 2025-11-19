async function loadDashboard() {
    // 1. Add the wait loop for safety, assuming the client is initialized in another deferred script
    while (!window.client) {
        await new Promise(r => setTimeout(r, 10));
    }

    // Load recent quotes
    const { data: quotes, error: qErr } = await window.client 
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

    const quoteDiv = document.getElementById("quotes");
    quoteDiv.innerHTML = "<h2>Recent Quotes</h2>";

    if (qErr) {
        quoteDiv.innerHTML += "<p>Error loading quotes.</p>";
    } else {
        quotes?.forEach(q => {
            quoteDiv.innerHTML += `
                <div>
                    <strong>#${q.quote_number || "?"}</strong> —
                    ${q.name || q.customer_name || "Unknown"} —
                    ${q.created_at}
                </div>
            `;
        });
    }

    // Load ticket folders (storage)
    // FIX: Changed 'supabase' to 'window.client' and confirmed bucket name is 'quotes_bucket'
    const { data: tickets, error: tErr } = await window.client 
        .storage
        .from("quotes_bucket")
        .list("", { limit: 100 });

    const ticketDiv = document.getElementById("tickets");
    ticketDiv.innerHTML = "<h2>Ticket Folders</h2>";

    if (tErr) {
        ticketDiv.innerHTML += "<p>Error loading ticket folders.</p>";
    } else {
        tickets?.forEach(folder => {
            ticketDiv.innerHTML += `<div>${folder.name}</div>`;
        });
    }
}

loadDashboard();