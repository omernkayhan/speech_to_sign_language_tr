const Sentence = require("./Sentence");

class Prompt {
    constructor(prompt) {
        this.original = prompt;
        this.processed = [
            prompt
        ];
        this.process();
        this.sentence = new Sentence(this.last);
    }
    get last() {
        return this.processed[this.processed.length - 1];
    }
    static processUpperCase(sentence) {
        return sentence.turkishToLower();
    }
    static processPunctuation(sentence) {
        return sentence.replaceAll(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').replaceAll("'", ' ');
    }
    static processWhitespace(sentence) {
        return sentence.replace(/\s{2,}/g,' ');
    }
    process() {
        this.processed.push(Prompt.processUpperCase(this.last));
        this.processed.push(Prompt.processPunctuation(this.last));
        this.processed.push(Prompt.processWhitespace(this.last));
    }
}

module.exports = Prompt;