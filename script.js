// Main Hub Script

document.addEventListener('DOMContentLoaded', () => {
    console.log('Unlimited Games Hub Loaded');
    
    // Future: Fetch game list from a JSON file and dynamically render cards.
    // For now, we rely on static HTML for the game cards.

    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
             // Optional: Add sound effect or more complex animation logic here
        });
    });
});
