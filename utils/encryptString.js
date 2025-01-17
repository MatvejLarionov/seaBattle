const crypto = require('crypto')
const encryptString = (str) => {
    str = str.toString()
    const hash = crypto.createHash('sha1')
    return hash.update(`Hello world!${str}scriptJava`).digest('hex')
}
module.exports = encryptString