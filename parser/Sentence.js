const Word = require("./Word");

class Sentence {
    constructor(sentence) {
        this.sentence = sentence;
        this.words = this.findWords();
        this.processed = this.toString();
    }

    findWords() {
        return this.sentence.split(' ').map(word => new Word(word))
    }

    toString(){
        return this.words.map(w => w.toString()).join(' ');
    }
}

module.exports = Sentence;