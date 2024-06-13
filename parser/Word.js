const {getWords, getData} = require("./SignLanguage");
const Python = require("./Python");

class Word {

    static synonims = {
        'ile': 've',
    };

    prefixes = [];
    postfixes = [];
    sentence = null;
    sentenceStartWords = [];
    beforeWord = null;
    constructor(word, sentence, beforeWord = null) {
        this.beforeWord = beforeWord;
        this.original = word;
        this.firstCharCapitalized = word.capitalizeFirstLetter();
        this.lowerCase = word.turkishToLower();
        this.sentence = sentence;
        this.processSynonyms();
        if(!isNaN(word)){
            this.root = this.lowerCase;
            this.type = 'sayı';
            this.meanings = null;
            this.suffixes = [];
        } else if (getWords().includes(this.lowerCase)) {
            this.root = this.lowerCase;
            this.type = getData().find(w => w.word.word.includes(this.lowerCase)).data[0].badges[0]
            this.meanings = getData().find(w => w.word.word.includes(this.lowerCase)).data;
            this.suffixes = [];
        } else {
            const data = this.getNlpData();
            if (data) {
                this.root = data.root;
                this.type = data.type;
                this.meanings = getData().find(w => w.word.word.includes(this.root))?.data ?? [];
                this.suffixes = data.suffixes;
            }else{
                this.root = this.lowerCase;
                this.type = 'isim';
                this.meanings = [];
                this.suffixes = [];
            }
        }

        this.processSpecialVerbs();
        this.processPrefix();

    }

    processSynonyms(){
        this.lowerCase = Word.synonims[this.lowerCase] ?? this.lowerCase;
    }

    processSpecialVerbs(){
        if(this.root === 'yemek' && this.type === 'fiil'){
            this.root = `(F)${this.root}`;
        }

        if(this.root === 'yemek' && this.beforeWord && this.beforeWord.type === 'isim'){
            this.root = `(F)${this.root}`;
            this.type = 'fiil';
        }
    }

    processPrefix() {
        this.prefixes = [];

        //Birinci Tekil Kişi
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'içe' && [2, 3].includes(parseInt(s.type.split('-')[1]))).length) {
            this.prefixes.push(new Word('benim', this.sentence));
        }
        //İkinci Tekil Kişi
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'içe' && [6, 7].includes(parseInt(s.type.split('-')[1]))).length) {
            this.prefixes.push(new Word('senin', this.sentence));
        }
        //Üçüncü Tekil Kişi
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'içe' && [10, 11].includes(parseInt(s.type.split('-')[1]))).length) {
            this.prefixes.push(new Word('onun', this.sentence));
        }

        //Çokluk
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'içe' && [1, 30].includes(parseInt(s.type.split('-')[1]))).length) {
            this.prefixes.push(new Word('çok', this.sentence));
        }

        //Olumsuzluk (fçe-20, fçe-21, fçe-34)
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'fçe' && [20, 21, 34].includes(parseInt(s.type.split('-')[1]))).length) {
            this.postfixes.push(new Word('değil', this.sentence));
        }

        //1. tekil kişi fiil (fçe-22, fçe-23, fçe-24)
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'fçe' && [22, 23, 24].includes(parseInt(s.type.split('-')[1]))).length) {
            this.sentenceStartWords.push(new Word('ben', this.sentence));
        }

        //2. tekil kişi fiil (fçe-25, fçe-26)
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'fçe' && [25, 26].includes(parseInt(s.type.split('-')[1]))).length) {
            this.sentenceStartWords.push(new Word('sen', this.sentence));
        }

        //1. çoğul kişi fiil (fçe-27, fçe-28, fçe-29, fçe-30)
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'fçe' && [27, 28, 29, 30].includes(parseInt(s.type.split('-')[1]))).length) {
            this.sentenceStartWords.push(new Word('biz', this.sentence));
        }

        //2. çoğul kişi fiil (fçe-31, fçe-32)
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'fçe' && [31, 32].includes(parseInt(s.type.split('-')[1]))).length) {
            this.sentenceStartWords.push(new Word('siz', this.sentence));
        }

        //3. çoğul kişi fiil (fçe-33)
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'fçe' && [33].includes(parseInt(s.type.split('-')[1]))).length) {
            this.sentenceStartWords.push(new Word('onlar', this.sentence));
        }

        //şimdiki zaman (fçe-3, fçe-4)
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'fçe' && [3, 4].includes(parseInt(s.type.split('-')[1]))).length) {
            this.sentenceStartWords.push(new Word('şimdi', this.sentence));
        }

    }

    static mekMakSelector(root){
        const kalinHarfler = ['a', 'ı', 'o', 'u'];
        const inceHarfler = ['e', 'i', 'ö', 'ü'];
        const kalinSayi = root.split('').filter(r => r !== ' ').filter(r => kalinHarfler.includes(r)).length;
        const inceSayi = root.split('').filter(r => r !== ' ').filter(r => inceHarfler.includes(r)).length;
        return (kalinSayi > inceSayi) ? 'mak' : 'mek';
    }

    getNlpData() {
        const word = this.lowerCase;
        try {
            const responseRaw = Python.parse(`"${word}"`).trim();
            const response = JSON.parse(responseRaw);
            let data = response.data.replace(new RegExp(response.word.split('(')[0] + '\\(.*?\\)' + '\\+', 'g'), '').split('+').filter(d => d !== '');
            let root = (response.word.match(/(?<=\{).+?(?=\})/g) ?? response.word.split('('))[0];
            let type = response.word.match(/(?<=\().+?(?=\))/g)[0];
            const suffixes = data.map(d => {
                if(d.split('{').length === 1){
                    root = d.split('(')[0];
                    type = d.split('(')[1].split(')')[0];
                    return false;
                }else {
                    const suffix = d.split('(')[0];
                    const type = d.split('{')[1].split('}')[0];
                    const description = d.split('(')[1].split(')')[0];
                    return {
                        suffix,
                        type,
                        description
                    }
                }
            }).filter(d => d !== false);
            root = (type === 'fiil') ? root + Word.mekMakSelector(root) : root;
            return {
                root,
                type,
                suffixes
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    toString() {
        return this.root;
    }

    toObject() {
        return {
            original: this.original,
            firstCharCapitalized: this.firstCharCapitalized,
            lowerCase: this.lowerCase,
            root: this.root,
            type: this.type,
            meanings: this.meanings,
            suffixes: this.suffixes,
            prefixes: this.prefixes,
            postfixes: this.postfixes
        }
    }
}

module.exports = Word;