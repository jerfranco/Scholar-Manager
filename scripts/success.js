
    // Check if there is a success message in the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const successMessage = urlParams.get('success');

    // If a success message exists, display it in the message placeholder
    if (successMessage) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = successMessage;
        messageElement.style.color = 'green'; // Set the text color to green
        messageElement.style.textAlign = 'center'; // Center the text
    }

