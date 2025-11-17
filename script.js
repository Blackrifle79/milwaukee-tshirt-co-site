// --- SUPABASE INIT (must come first) ---
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


// --- QUOTE FORM SUBMISSION ---
document.getElementById("quoteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("quoteStatus");
  status.innerText = "Submitting...";

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const garment_type = document.getElementById("garment_type").value;
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


  // --- INSERT INTO QUOTES TABLE & RETURN ROW (INCLUDES quote_number) ---
  const { data: quoteRow, error } = await db
    .from("quotes")
    .insert({
      name,
      email,
      phone,
      garment_type,
      colors,
      quantity,
      deadline,
      instructions,
      art_url
    })
    .select("*")
    .single();   // return exactly one row


  if (error) {
    status.innerText = "Database error: " + error.message;
    return;
  }

  // Extract the assigned quote number
  const quoteNumber = quoteRow.quote_number;
  console.log("Assigned quote number:", quoteNumber);

  status.innerText = `Quote submitted! Your quote number is #${quoteNumber}.`;

  // Reset form
  document.getElementById("quoteForm").reset();
});
