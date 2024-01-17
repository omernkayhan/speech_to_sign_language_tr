const data = require('./data.json');
class SignLanguage {
    static getData() {
        return data;
    }

    static getWords() {
        const words = [];
        data.map(w => w.word.word.map(ww => words.push(ww)));
        return words;
    }

    static getPatterns() {
        const words = [];
        data.map(w => w.word.word.map(ww => words.push(ww)));
        return words.filter(w => w.includes(' '));
    }
}

module.exports = SignLanguage;