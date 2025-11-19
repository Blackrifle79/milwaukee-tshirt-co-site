console.log("🔥 REAL script-v4.js LOADED — timestamp:", Date.now());

// ------------------------------------------------------------
// 1. IMAGE SLIDER
// ------------------------------------------------------------
window.onload = function () {
  let slideIndex = 0;
  const slides = document.querySelectorAll(".fade-slide");

  function showNextSlide() {
    slides[slideIndex].classList.remove("active");
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add("active");
  }

  setInterval(showNextSlide, 5000);
};


// ------------------------------------------------------------
// 2. SUPABASE INITIALIZATION
// ------------------------------------------------------------
const SUPABASE_URL = "https://hrercslgttmmtbcjbgpz.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZXJjc2xndHRtbXRiY2piZ3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTUxNTIsImV4cCI6MjA3ODk3MTE1Mn0.ajqkYr3snQFReGCKJQe53Qe_Aa6zeMmTKbn_TAQZ2CI";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ------------------------------------------------------------
// 3. LOAD GARMENT TYPES
// ------------------------------------------------------------
async function loadGarments() {
  const dropdown = document.getElementById("garment_type");
  dropdown.innerHTML = `<option>Loading garment types...</option>`;

  const { data, error } = await supabase
    .from("garment_catalog")
    .select("name, active");

  if (error) {
    console.error("Garment load error:", error);
    dropdown.innerHTML = `<option>Error loading types</option>`;
    return;
  }

  if (!data || data.length === 0) {
    dropdown.innerHTML = `<option>No garments available</option>`;
    return;
  }

  const activeRows = data.filter(row => row.active === true);

  const uniqueNames = [...new Set(activeRows.map(row => row.name))];

  dropdown.innerHTML =
    uniqueNames
      .map(name => `<option value="${name}">${name}</option>`)
      .join("");
}


// ------------------------------------------------------------
// 4. PAGE LOAD
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadGarments();
});


// ------------------------------------------------------------
// 5. QUOTE FORM SUBMISSION (UPDATED WITH AUTO-FOLDER STORAGE)
// ------------------------------------------------------------
document.getElementById("quoteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("quoteStatus");
  status.innerText = "Submitting… Please wait.";

  // ------------------------------------------------------------
  // GATHER FORM VALUES & IMPLEMENT NAME SPLIT LOGIC
  // ------------------------------------------------------------
  const firstName = document.getElementById("firstName").value.trim(); // NEW
  const lastName = document.getElementById("lastName").value.trim();   // NEW
  const name = `${firstName} ${lastName}`.trim(); // COMBINED for DB 'name' column
  
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const garment_type = document.getElementById("garment_type").value;
  const quality = document.getElementById("quality").value;
  const colors = parseInt(document.getElementById("colors").value);
  const quantity = parseInt(document.getElementById("quantity").value);
  const deadline = document.getElementById("deadline").value || null;
  const instructions = document.getElementById("instructions").value.trim();
  const artFile = document.getElementById("artfile").files[0] || null;

  // ------------------------------------------------------------
  // 5A – INSERT QUOTE (database generates quote_number)
  // ------------------------------------------------------------
  const insertPayload = {
    name, // Uses the combined name
    email,
    phone,
    garment_type,
    quality,
    colors,
    quantity,
    deadline,
    instructions,
    created_at: new Date().toISOString()
  };

  console.log("DATA BEING INSERTED:", insertPayload);

  const { data: quoteRow, error: insertError } = await supabase
    .from("quotes")
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) {
    console.error("INSERT ERROR:", insertError);
    status.innerText = "❌ Database error submitting your quote.";
    return;
  }

  const quoteNumber = quoteRow.quote_number;
  console.log("Assigned Quote Number:", quoteNumber);
  
  // ------------------------------------------------------------
  // NEW: CREATE FOLDER NAME (QuoteNumber_LastNameSlug)
  // ------------------------------------------------------------
  // 1. Convert the last name to a lowercase, URL-safe string
  const lastNameSlug = lastName.toLowerCase().replace(/[^a-z0-9]/g, ''); 
  // 2. Combine the quote number and the slug for the folder path
  const folderName = `${quoteNumber}_${lastNameSlug}`;
  console.log("Assigned Folder Name:", folderName);
  
  // ------------------------------------------------------------
  // 5B – ENSURE FOLDER EXISTS (create .keep placeholder)
  // ------------------------------------------------------------
  const placeholderBlob = new Blob(["keep"], { type: "text/plain" });
  // Path now uses the new folderName
  const placeholderPath = `quotes/${folderName}/.keep`; 

  const { error: placeholderError } = await supabase.storage
    .from("quotes_bucket")
    .upload(placeholderPath, placeholderBlob, { upsert: true });

  if (placeholderError) {
    console.error("FOLDER CREATE ERROR:", placeholderError);
  }

  // ------------------------------------------------------------
  // 5C – UPLOAD ART IF PROVIDED
  // ------------------------------------------------------------
  let stored_art_path = null;

  if (artFile) {
    // Path now uses the new folderName
    const filePath = `quotes/${folderName}/${artFile.name}`; 

    const { error: uploadError } = await supabase.storage
      .from("quotes_bucket")
      .upload(filePath, artFile, { upsert: true });

    if (uploadError) {
      console.error("UPLOAD ERROR:", uploadError);
      status.innerText = "❌ Error uploading artwork.";
      return;
    }

    stored_art_path = filePath;
  }

  // ------------------------------------------------------------
  // 5D – SAVE FILE PATHS BACK INTO THE QUOTE ROW (using art_url)
  // ------------------------------------------------------------
  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      art_url: stored_art_path // Corrected key (art_url)
    })
    .eq("id", quoteRow.id);

  if (updateError) {
    console.error("UPDATE ERROR:", updateError);
    status.innerText = "❌ Error saving file details.";
    return;
  }

  // ------------------------------------------------------------
  // 5E – SUCCESS
  // ------------------------------------------------------------
  status.innerText = `✅ Quote #${quoteNumber} submitted successfully!`;
  document.getElementById("quoteForm").reset();
});