const crypto = require('crypto')
const encryptString = (str) => {
    str = str.toString()
    const hash = crypto.createHash('sha1')
    return hash.update(str).digest('hex')
}
module.exports = encryptString