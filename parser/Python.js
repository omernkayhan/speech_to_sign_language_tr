const {spawn, execSync} = require("child_process");

class Python {
    static parse(...args) {
        return execSync(__dirname + '/../python/dist/main.exe ' + args.join(' ')).toString()
    }
}

module.exports = Python;