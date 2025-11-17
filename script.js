document.getElementById("quoteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Quote request submitted");
});

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Contact form submitted");
});

window.onload = function () {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.fade-slide');

    function showNextSlide() {
        slides[slideIndex].classList.remove('active');
        slideIndex = (slideIndex + 1) % slides.length;
        slides[slideIndex].classList.add('active');
    }

    setInterval(showNextSlide, 5000);
};

