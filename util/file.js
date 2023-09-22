const fs = require('fs')

const deleteFile = (pathFile) => {
    fs.unlink(pathFile, (err) => {
        if (err) {
            throw (err)
        }
    })
}
exports.deleteFile = deleteFile;