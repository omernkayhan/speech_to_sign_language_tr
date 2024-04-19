const {spawn, execSync} = require("child_process");

class Python {
    static parse(...args) {
        //console.log(__dirname + '/../python/dist/main.exe ' + args.join(' '))
        const result = execSync(__dirname + '/../python/dist/main.exe ' + args.join(' ')).toString();
        //console.log(result)
        return result;
    }
}

module.exports = Python;