//в квадратных скобках стоит boolean т.е заполнен ли файл или нет. Файл заполнен если в нем 10 юзеров
const fs = require('fs')
const path = require('path')
const pathJsons = './data/usersJsons'
const usersData = {
    create(user) {
        const names = fs.readdirSync(pathJsons)
        const unfullFile = names.find(item => {
            if (item.split(/\[|\]/)[1] == 1)
                return true;
        })
        if (unfullFile) {
            const data = JSON.parse(fs.readFileSync(path.join(pathJsons, unfullFile), 'utf8'))
            if (data.length > 0) {
                user.id = data.at(-1).id + 1
            }
            else
                user.id = (names.length - 1) * 10
            data.push(user)
            const pathFile = path.join(pathJsons, unfullFile)
            fs.writeFileSync(pathFile, JSON.stringify(data))
            if (data.length >= 10) {
                const arr = unfullFile.split(/(\[|\])/)
                arr[2] = 0
                const newName = arr.join('')
                fs.renameSync(pathFile, path.join(pathJsons, newName))
            }
        } else {
            user.id = names.length * 10
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