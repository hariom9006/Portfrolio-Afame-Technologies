
// Select navigation elements
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

// Mobile navigation menu
menuToggle.addEventListener("click", function () {

    navLinks.classList.toggle("open");

    const isOpen = navLinks.classList.contains("open");

    menuToggle.textContent = isOpen ? "✕" : "☰";

    menuToggle.setAttribute("aria-expanded", isOpen);

});

// Close menu when clicking a navigation link
document.querySelectorAll(".nav-links a").forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.classList.remove("open");

        menuToggle.textContent = "☰";

        menuToggle.setAttribute("aria-expanded", "false");

    });

});

// Automatically update copyright year
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();
