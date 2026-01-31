// Word lists for Neon Doodle
const WORD_LISTS = {
    easy: [
        'cat', 'dog', 'sun', 'moon', 'tree', 'house', 'car', 'ball', 'fish', 'bird',
        'apple', 'book', 'chair', 'door', 'flower', 'hat', 'key', 'lamp', 'phone', 'star',
        'bed', 'cup', 'eye', 'hand', 'heart', 'pizza', 'smile', 'snow', 'water', 'cloud'
    ],
    medium: [
        'airplane', 'bicycle', 'butterfly', 'campfire', 'computer', 'dinosaur', 'dolphin',
        'elephant', 'fireworks', 'hamburger', 'helicopter', 'icecream', 'keyboard', 'lighthouse',
        'mushroom', 'newspaper', 'octopus', 'parachute', 'rainbow', 'sandwich', 'skateboard',
        'telescope', 'umbrella', 'volcano', 'waterfall', 'basketball', 'calendar', 'detective',
        'envelope', 'fountain'
    ],
    hard: [
        'astronaut', 'avalanche', 'blueprint', 'chameleon', 'chandelier', 'constellation',
        'earthquake', 'electricity', 'fingerprint', 'graduation', 'hibernation', 'imagination',
        'kaleidoscope', 'labyrinth', 'marshmallow', 'nightmare', 'observatory', 'philosophy',
        'quicksand', 'reflection', 'skyscraper', 'supermarket', 'thermometer', 'translation',
        'underwater', 'ventriloquist', 'watermelon', 'xylophone', 'photograph', 'trampoline'
    ]
};

function getRandomWords(count = 3) {
    const allWords = [...WORD_LISTS.easy, ...WORD_LISTS.medium, ...WORD_LISTS.hard];
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function generateHint(word) {
    return word.replace(/[a-zA-Z]/g, '_');
}

module.exports = { WORD_LISTS, getRandomWords, generateHint };
