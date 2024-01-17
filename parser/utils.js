String.prototype.turkishToUpper = function () {
    let string = this;
    const letters = {"i": "İ", "ş": "Ş", "ğ": "Ğ", "ü": "Ü", "ö": "Ö", "ç": "Ç", "ı": "I"};
    string = string.replace(/(([iışğüçö]))+/g, function (letter) {
        return letters[letter];
    })
    return string.toUpperCase();
}

String.prototype.turkishToLower = function () {
    let string = this;
    const letters = {"İ": "i", "I": "ı", "Ş": "ş", "Ğ": "ğ", "Ü": "ü", "Ö": "ö", "Ç": "ç"};
    string = string.replace(/(([İIŞĞÜÇÖ]))+/g, function (letter) {
        return letters[letter];
    })
    return string.toLowerCase();
}

String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).turkishToUpper() + this.slice(1);
}