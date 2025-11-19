async function loadDashboard() {
    // 1. Wait until the initialized client is available
    while (!window.client) {
        await new Promise(r => setTimeout(r, 10));
    }

    // --- REMOVED: Database query for 'quotes' table ---

    // Load ticket folders (storage)
    const { data: tickets, error: tErr } = await window.client 
        .storage
        .from("quotes_bucket")
        .list("", { limit: 100 });

    // Assuming your HTML now has a div with id="tickets"
    const ticketDiv = document.getElementById("tickets");
    
    // Safety check: ensure the element exists
    if (!ticketDiv) {
        console.error("HTML element with id='tickets' not found.");
        return;
    }
    
    ticketDiv.innerHTML = "<h2>Ticket Folders</h2>";

    if (tErr) {
        console.error("Storage error:", tErr);
        ticketDiv.innerHTML += "<p>Error loading ticket folders. Check policies.</p>";
    } else {
        // Check if data is present and loop through it
        if (tickets && tickets.length > 0) {
            tickets.forEach(folder => {
                // This displays the name of the file or folder
                ticketDiv.innerHTML += `<div>${folder.name}</div>`;
            });
        } else {
            ticketDiv.innerHTML += "<p>No files or folders found in the quotes_bucket root.</p>";
        }
    }
}

loadDashboard();