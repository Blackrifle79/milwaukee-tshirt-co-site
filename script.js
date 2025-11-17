// --- SUPABASE INIT ---
const { createClient } = supabase;

const db = createClient(
  "https://hrercslgttmmtbcjbgpz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZXJjc2xndHRtbXRiY2piZ3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTUxNTIsImV4cCI6MjA3ODk3MTE1Mn0.ajqkYr3snQFReGCKJQe53Qe_Aa6zeMmTKbn_TAQZ2CI"
);


// --- IMAGE SLIDER ---
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


// --- LOAD GARMENT TYPES INTO DROPDOWN ---
async function loadGarments() {
  const dropdown = document.getElementById("garment_type");

  dropdown.innerHTML = `<option>Loading garment types...</option>`;

  const { data, error } = await db
    .from("garment_catalog")
    .select("name")
    .eq("active", true);

  if (error) {
    dropdown.innerHTML = `<option>Error loading types</option>`;
    return;
  }

  // Get unique garment names only
  const uniqueNames = [...new Set(data.map(row => row.name))];

  dropdown.innerHTML = uniqueNames
    .map(name => `<option value="${name}">${name}</option>`)
    .join("");
}

loadGarments();


// --- QUOTE FORM SUBMISSION ---
document.getElementById("quoteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("quoteStatus");
  status.innerText = "Submitting...";

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const garment_type = document.getElementById("garment_type").value;
  const quality = document.getElementById("quality").value;
  const colors = parseInt(document.getElementById("colors").value);
  const quantity = parseInt(document.getElementById("quantity").value);
  const deadline = document.getElementById("deadline").value;
  const instructions = document.getElementById("instructions").value;
  const fileInput = document.getElementById("artfile");

  let art_url = null;

  // --- ARTWORK UPLOAD ---
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const filePath = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await db
      .storage
      .from("quote-art")
      .upload(filePath, file);

    if (uploadError) {
      status.innerText = "Upload failed: " + uploadError.message;
      return;
    }

    const { data: pub } = db.storage
      .from("quote-art")
      .getPublicUrl(filePath);

    art_url = pub.publicUrl;
  }


  // --- INSERT ROW & RETURN IT ---
  const { data: quoteRow, error } = await db
    .from("quotes")
    .insert({
      name,
      email,
      phone,
      garment_type,
      quality,
      colors,
      quantity,
      deadline,
      instructions,
      art_url
    })
    .select("*")
    .single();

  if (error) {
    status.innerText = "Database error: " + error.message;
    return;
  }

  // Extract assigned quote number
  const quoteNumber = quoteRow.quote_number;

  status.innerText = `Quote submitted! Your quote number is #${quoteNumber}.`;

  document.getElementById("quoteForm").reset();
});
