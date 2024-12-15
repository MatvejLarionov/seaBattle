//в квадратных скобках стоит boolean т.е заполнен ли файл или нет. Файл заполнен если в нем 10 юзеров
const fs = require('fs')
const path = require('path')
const pathJsons = './data/usersJsons'
const filesController = {
    directory: pathJsons,
    nameFiles: "users",
    getNumberFile(fileName) {
        return Number(fileName.split(/\(|\)/)[1])
    },
    getListOfNumOfFile() {
        return fs.readdirSync(this.directory).map(item => this.getNumberFile(item))
    },
    getFileName(num) {
        const fileNames = fs.readdirSync(pathJsons)
        return fileNames.find(item => this.getNumberFile(item) == num)
    },
    getData(num) {
        const file = this.getFileName(num)
        const pathName = path.join(this.directory, file)
        return JSON.parse(fs.readFileSync(pathName, "utf8"))
    },
    setData(num, data) {
        const file = this.getFileName(num)
        const pathName = path.join(this.directory, file)
        fs.writeFileSync(pathName, JSON.stringify(data))
    },
    createNewFile(data) {
        const num = this.getListOfNumOfFile().at(-1) + 1
        const pathFile = path.join(this.directory, `${this.nameFiles}(${num})[1].json`)
        let text = ''
        if (data)
            text = JSON.stringify(data)
        fs.writeFileSync(pathFile, text)
    },
    lockFile(num) {
        const oldPath = path.join(this.directory, `${this.nameFiles}(${num})[1].json`)
        const newPath = path.join(this.directory, `${this.nameFiles}(${num})[0].json`)
        try {
            fs.renameSync(oldPath, newPath)
        } catch (error) {

        }
    },
    unlockFile(num) {
        const oldPath = path.join(this.directory, `${this.nameFiles}(${num})[0].json`)
        const newPath = path.join(this.directory, `${this.nameFiles}(${num})[1].json`)
        try {
            fs.renameSync(oldPath, newPath)
        } catch (error) {

        }
    },
    isUnLockFile(num) {
        const fileName = this.getFileName(num)
        return fileName.split(/\[|\]/)[1] == 1
    }
}
const usersData = {
    limitInFile: 10,
    create(user) {
        const names = filesController.getListOfNumOfFile()
        const unfullFile = names.find(item => filesController.isUnLockFile(item))
        if (unfullFile !== undefined) {
            const data = filesController.getData(unfullFile)
            let i = 0
            for (; i < data.length - 1; i++) {
                if (data[i + 1].id - data[i].id > 1)
                    break
            }
            user.id = data[i].id + 1
            const index = user.id % this.limitInFile
            data.splice(index, 0, user)
            filesController.setData(unfullFile, data)
            if (data.length >= this.limitInFile) {
                filesController.lockFile(unfullFile)
            }
        } else {
            user.id = names.length * this.limitInFile
            filesController.createNewFile([user])
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
    getUserById(id) {
        const fileNum = Math.floor(id / this.limitInFile)
        const data = filesController.getData(fileNum)
        return data.find(item => item.id === id)
    }
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