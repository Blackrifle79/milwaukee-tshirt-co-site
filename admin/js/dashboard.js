async function loadDashboard() {
    // Load recent quotes
    const { data: quotes, error: qErr } = await supabase
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
    const { data: tickets, error: tErr } = await supabase
        .storage
        .from("quotes")
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
