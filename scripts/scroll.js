document.addEventListener('DOMContentLoaded', function() {
    const offerContainer = document.getElementById('offer');
    const sections = offerContainer.querySelectorAll('section');

    // Function to scroll to the next section based on the current position
    let currentIndex = 0;

    function scrollToNextSection() {
        // Increment to the next section, reset if at the end
        currentIndex = (currentIndex + 1) % sections.length;
        // Scroll to the next section
        sections[currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'start' });
    }

    // Set an interval to automatically scroll every 3 seconds
    setInterval(scrollToNextSection, 3000);
});