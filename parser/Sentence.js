const Word = require("./Word");

class Sentence {

    words = [];

    static animationData = {
        words: ['baba', 'benim', 'değil', 'getirmek', 'yarın', 'yemek', 'ben', 'sen', 'çok', 'okul', 'gitmek', '(F)yemek'],
        letters: ['a', 't', 'e', 'c']
    };

    constructor(sentence) {
        this.sentence = sentence;
        this.findWords();
        this.processed = this.toString();
    }

    findWords() {
        this.sentence.split(' ').map((word, index) => {
            const wordObject = new Word(word, this);
            if (wordObject.prefixes.length) {
                this.words.push(...wordObject.prefixes);
            }
            this.words.push(wordObject);
            if (wordObject.postfixes.length) {
                this.words.push(...wordObject.postfixes);
            }
            if (wordObject.sentenceStartWords.length) {
                const sentenceStartWords = wordObject.sentenceStartWords.filter(w => (index !== 0 && this.sentence.split(' ')[0].toLowerCase() !== w.original.toLowerCase()));
                this.words = this.words = [...sentenceStartWords, ...this.words];
            }
        });
        this.words = this.words.map(word => {
            if (Sentence.animationData.words.includes(word.toString())) {
                word.animationData = {
                    type: 'word',
                    animation: word.toString(),
                }
            } else {
                const letters = word.toString().split('');
                if (letters.filter(l => Sentence.animationData.letters.includes(l)).length === letters.length) {
                    word.animationData = {
                        type: 'letters',
                        name: word.toString(),
                        letters: letters.map(l => {
                            return {
                                type: 'letter',
                                animation: l
                            }
                        })
                    }
                } else {
                    word.animationData = {
                        type: 'word',
                        animation: 'undefined'
                    }
                }
            }
            return word;
        });
    }

    toString() {
        return this.words.map(w => w.toString()).join(' ');
    }
}

module.exports = Sentence;