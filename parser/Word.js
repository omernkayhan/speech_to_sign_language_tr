const {getWords, getData} = require("./SignLanguage");
const Python = require("./Python");

class Word {
    prefixes = [];
    postfixes = [];
    constructor(word) {
        this.original = word;
        this.firstCharCapitalized = word.capitalizeFirstLetter();
        this.lowerCase = word.turkishToLower();
        if (getWords().includes(this.lowerCase)) {
            this.root = this.lowerCase;
            this.type = getData().find(w => w.word.word.includes(this.lowerCase)).data[0].badges[0]
            this.meanings = getData().find(w => w.word.word.includes(this.lowerCase)).data;
            this.suffixes = [];
        } else {
            const data = this.getNlpData();
            if (data) {
                this.root = data.root;
                this.type = data.type;
                this.meanings = getData().find(w => w.word.word.includes(this.root)).data ?? [];
                this.suffixes = data.suffixes;
            }else{
                this.root = this.lowerCase;
                this.type = 'isim';
                this.meanings = [];
                this.suffixes = [];
            }
        }
        this.processPrefix();
    }

    processPrefix() {
        this.prefixes = [];
/*
        //Çokluk
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'içe' && [1].includes(parseInt(s.type.split('-')[1]))).length) {
            this.prefixes.push('çok');
        }
*/
        //Birinci Tekil Kişi
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'içe' && [2, 3].includes(parseInt(s.type.split('-')[1]))).length) {
            this.prefixes.push('benim');
        }
        //İkinci Tekil Kişi
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'içe' && [6, 7].includes(parseInt(s.type.split('-')[1]))).length) {
            this.prefixes.push('senin');
        }
        //Üçüncü Tekil Kişi
        if (this.suffixes.filter(s => s.type.split('-')[0] === 'içe' && [10, 11].includes(parseInt(s.type.split('-')[1]))).length) {
            this.prefixes.push('onun');
        }
    }

    getNlpData() {
        const word = this.lowerCase;
        try {
            const responseRaw = Python.parse(`"${word}"`).trim();
            const response = JSON.parse(responseRaw);
            let data = response.data.replace(new RegExp(response.word.split('(')[0] + '\\(.*?\\)' + '\\+', 'g'), '').split('+').filter(d => d !== '');
            const suffixes = data.map(d => {
                const suffix = d.split('(')[0];
                const type = d.split('{')[1].split('}')[0];
                const description = d.split('(')[1].split(')')[0];
                return {
                    suffix,
                    type,
                    description
                }
            });
            let root = (response.word.match(/(?<=\{).+?(?=\})/g) ?? response.word.split('('))[0];
            const type = response.word.match(/(?<=\().+?(?=\))/g)[0];
            root = (type === 'fiil') ? root + 'mek' : root;
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
        return (this.prefixes.length > 0 ? (this.prefixes.join(' ') + ' ') : '') + this.root + (this.postfixes.length > 0 ? (' ' + this.postfixes.join(' ')) : '');
    }
}

module.exports = Word;