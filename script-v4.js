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

  // Only include active garments
  const activeRows = data.filter(row => row.active === true);

  const uniqueNames = [...new Set(activeRows.map(row => row.name))];

  dropdown.innerHTML =
    uniqueNames
      .map(name => `<option value="${name}">${name}</option>`)
      .join("");
}


// ------------------------------------------------------------
// 4. GENERATE QUOTE NUMBER
// ------------------------------------------------------------
function generateQuoteNumber() {
  return Date.now();
}


// ------------------------------------------------------------
// 5. ENSURE PAGE LOADS CORRECTLY
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadGarments();
});


// ------------------------------------------------------------
// 6. QUOTE FORM SUBMISSION
// ------------------------------------------------------------
document.getElementById("quoteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("quoteStatus");
  status.innerText = "Submitting… Please wait.";

  // Gather form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const garment_type = document.getElementById("garment_type").value;
  const quality = document.getElementById("quality").value;
  const colors = parseInt(document.getElementById("colors").value);
  const quantity = parseInt(document.getElementById("quantity").value);
  const deadline = document.getElementById("deadline").value || null;
  const instructions = document.getElementById("instructions").value.trim();
  const artFile = document.getElementById("artfile").files[0] || null;

  const quoteNumber = generateQuoteNumber();
  const folderPath = `quotes/${quoteNumber}`;

  // ------------------------------------------------------------
  // 6A – ARTWORK UPLOAD
  // ------------------------------------------------------------
  let artwork_url = null;

  if (artFile) {
    const uploadPath = `${folderPath}/${artFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("quote-art")
      .upload(uploadPath, artFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      status.innerText = "❌ Artwork upload failed.";
      return;
    }

    const { data: pub } = supabase.storage
      .from("quote-art")
      .getPublicUrl(uploadPath);

    artwork_url = pub.publicUrl;
  }

  // ------------------------------------------------------------
  // 6B – INSERT QUOTE
  // ------------------------------------------------------------
  const { data, error } = await supabase
    .from("quotes")
    .insert([
      {
        quote_number: quoteNumber,
        name,
        email,
        phone,
        garment_type,
        quality,
        colors,
        quantity,
        deadline,
        instructions,
        art_url: artwork_url,

        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Insert error:", error);
    status.innerText = "❌ Database error submitting your quote.";
    return;
  }

  // SUCCESS
  status.innerText = `✅ Quote submitted! Your quote number is ${quoteNumber}.`;
  document.getElementById("quoteForm").reset();
});
