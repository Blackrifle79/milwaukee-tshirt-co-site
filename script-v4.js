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
// 5. QUOTE FORM SUBMISSION (VALIDATION + FIXED STORAGE PATHS)
// ------------------------------------------------------------
document.getElementById("quoteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("quoteStatus");
  status.innerText = "Submitting… Please wait.";

  // ------------------------------------------------------------
  // GATHER FORM VALUES
  // ------------------------------------------------------------
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const name = `${firstName} ${lastName}`.trim();

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
  // VALIDATION FOR NOT NULL DB FIELDS
  // ------------------------------------------------------------
  if (!firstName || !lastName) {
    status.innerText = "❌ Please enter first AND last name.";
    return;
  }

  if (!email) {
    status.innerText = "❌ Please enter an email address.";
    return;
  }

  // ------------------------------------------------------------
  // 5A – INSERT QUOTE
  // ------------------------------------------------------------
const insertPayload = {
    // ⬇️ ADD THESE TWO LINES ⬇️
    first_name: firstName, 
    last_name: lastName, 
    // ⬆️ ADD THESE TWO LINES ⬆️
    
    name,
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
  // 5B – BUILD FINAL FOLDER NAME
  // ------------------------------------------------------------
  const lastNameSlug = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const folderName = `${quoteNumber}_${lastNameSlug}`;

  // ------------------------------------------------------------
  // 5C – CREATE FOLDER
  // ------------------------------------------------------------
  const placeholderBlob = new Blob(["keep"], { type: "text/plain" });
  const placeholderPath = `${folderName}/.keep`;

  const { error: placeholderError } = await supabase.storage
    .from("quotes")
    .upload(placeholderPath, placeholderBlob, { upsert: true });

  if (placeholderError) {
    console.error("FOLDER CREATE ERROR:", placeholderError);
  }

  // ------------------------------------------------------------
  // 5D – UPLOAD ART FILE
  // ------------------------------------------------------------
  let stored_art_path = null;

  if (artFile) {
    const filePath = `${folderName}/${artFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("quotes")
      .upload(filePath, artFile, { upsert: true });

    if (uploadError) {
      console.error("UPLOAD ERROR:", uploadError);
      status.innerText = "❌ Error uploading artwork.";
      return;
    }

    stored_art_path = filePath;
  }

  // ------------------------------------------------------------
  // 5E – SAVE ART URL BACK TO QUOTE ROW
  // ------------------------------------------------------------
  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      art_url: stored_art_path
    })
    .eq("id", quoteRow.id);

  if (updateError) {
    console.error("UPDATE ERROR:", updateError);
    status.innerText = "❌ Error saving file details.";
    return;
  }

  // ------------------------------------------------------------
  // 5F – DONE
  // ------------------------------------------------------------
  status.innerText = `✅ Quote #${quoteNumber} submitted successfully!`;
  document.getElementById("quoteForm").reset();
});
