//в квадратных скобках стоит boolean т.е заполнен ли файл или нет. Файл заполнен если в нем 10 юзеров
const fs = require('fs')
const path = require('path')
const pathJsons = './data/usersJsons'
const filesController = {
    getNumberFile(fileName) {
        return Number(fileName.split(/\(|\)/)[1])
    },
    getFileName(num) {
        return `users(${num})[1].json`
    },
    lockFile(fileName) {
        const arr = fileName.split(/(\[|\])/)
        arr[2] = 0
        const newName = arr.join("")
        fs.renameSync(path.join(pathJsons, fileName), path.join(pathJsons, newName))
    },
    unlockFile(fileName) {
        const arr = fileName.split(/(\[|\])/)
        arr[2] = 1
        const newName = arr.join("")
        fs.renameSync(path.join(pathJsons, fileName), path.join(pathJsons, newName))
    },
    isUnLockFile(fileName) {
        return fileName.split(/\[|\]/)[1] == 1
    }
}
const usersData = {
    limitInFile: 10,
    create(user) {
        const names = fs.readdirSync(pathJsons)
        const unfullFile = names.find(item => filesController.isUnLockFile(item))
        if (unfullFile) {
            const data = JSON.parse(fs.readFileSync(path.join(pathJsons, unfullFile), 'utf8'))
            let i = 0
            for (; i < data.length - 1; i++) {
                if (data[i + 1].id - data[i].id > 1)
                    break
            }
            user.id = data[i].id + 1
            const index = user.id % this.limitInFile
            data.splice(index, 0, user)
            const pathFile = path.join(pathJsons, unfullFile)
            fs.writeFileSync(pathFile, JSON.stringify(data))
            if (data.length >= this.limitInFile) {
                filesController.lockFile(unfullFile)
            }
        } else {
            user.id = names.length * this.limitInFile
            const pathFile = path.join(pathJsons, `users(${names.length})[1].json`)
            fs.writeFileSync(pathFile, JSON.stringify([user]))
        }
    },
    read(filterParams) {
        const names = fs.readdirSync(pathJsons)
        let data = []
        names.forEach((item) => {
            data = data.concat(JSON.parse(fs.readFileSync(path.join(pathJsons, item))))
        })

        if (filterParams) {
            return data.filter(item => {
                for (let i in filterParams) {
                    if (filterParams[i] !== item[i].toString())
                        return false
                }
                return true
            })
        }
        return data
    },
    // // update() {

    // // },
    // // delete(id) {
    // //     id = Number(id)
    // //     const pathFile = path.join(pathJsons, `data(${Math.floor(id / 10)}).json`)
    // //     let data = JSON.parse(fs.readFileSync(pathFile, 'utf8'))
    // //     data = JSON.stringify(data.filter(item => item.id !== id))
    // //     if (data === '[]')
    // //         fs.rmSync(pathFile)
    // //     else
    // //         fs.writeFileSync(pathFile, data)
    // // }
}

module.exports = usersData