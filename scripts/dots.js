document.addEventListener('DOMContentLoaded', function() {
    const offerContainer = document.getElementById('offer');
    const sections = offerContainer.querySelectorAll('section');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;

    // Function to update the dot indicators based on the current index
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Function to find the currently visible section based on scroll position
    function findCurrentSection() {
        let closestSectionIndex = 0;
        let closestDistance = Infinity;

        sections.forEach((section, index) => {
            const sectionLeft = section.getBoundingClientRect().left;
            const distance = Math.abs(sectionLeft);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestSectionIndex = index;
            }
        });

        // Update the currentIndex if it has changed
        if (currentIndex !== closestSectionIndex) {
            currentIndex = closestSectionIndex;
            updateDots();
        }
    }

    // Set an interval to automatically scroll every 3 seconds (optional)
    // setInterval(() => {
    //     currentIndex = (currentIndex + 1) % sections.length;
    //     sections[currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'center' });
    //     updateDots();
    // }, 3000);

    // Event listener for manual scrolling to detect the current visible section
    offerContainer.addEventListener('scroll', () => {
        findCurrentSection();
    });

    // Event listener for clicking on dots to navigate to the respective section
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            sections[currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'center' });
            updateDots();
        });
    });

    // Initial update of the dot indicators
    updateDots();
});