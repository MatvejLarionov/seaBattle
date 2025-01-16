import { game } from "./game.js"

const createElement = ({ tagName, id, className, type, callback }) => {
    const el = document.createElement(tagName)
    if (id)
        el.id = id
    if (className)
        el.classList.add(className)
    if (type && callback) {
        el.addEventListener(type, callback)
    }
    return el
}

export const page = {
    container: document.getElementById("container"),
    components: {
        userContainer: (() => {
            const el = createElement({
                tagName: "div", id: "userContainer", class: "userContainer"
            })
            el.innerHTML =
                `<img src="/img/ava.jpg" alt="ava" class="ava" id="ava">
            <p class="login" id="login"></p>
            <p id="step"></p>`
            return el
        })(),
        partnerContainer: (() => {
            const el = createElement({
                tagName: "div", id: "partnerContainer", class: "partnerContainer"
            })
            el.innerHTML =
                `<p>подключён к <span id="partnerLogin"></span></p>
            <p>статус <span id="status"></span></p>
            <p id="step"></p>`
            return el
        })(),
        form: (() => {
            const el = createElement({
                tagName: "form", id: "form"
            })
            el.innerHTML =
                `<input type="text" placeholder="partner login" id="inpLogin">
            <button id="btnRequestToJoin">запросить присоедениться</button>`
            return el
        })(),
        playContainer: (() => {
            const el = createElement({
                tagName: "div", id: "playContainer"
            })
            el.innerHTML =
                `<button id="ready">ready to play</button>
            <button id="disconnection">отключится</button>`
            return el
        })(),
        gameContainer: (() => {
            const el = createElement({
                tagName: "div", id: "gameContainer", className: "gameContainer"
            })
            return el
        })(),
        gameField: (() => {
            const el = createElement({
                tagName: "div", id: "gameField", className: "gameField"
            })
            return el
        })(),
        partnerGameField: (() => {
            const el = createElement({
                tagName: "div", id: "partnerGameField", className: "gameField"
            })
            return el
        })(),
        userGameContainer: (() => {
            const el = createElement({
                tagName: "div", id: "userGameContainer", className: "userGameContainer"
            })
            return el
        })(),
        partnerGameContainer: (() => {
            const el = createElement({
                tagName: "div", id: "partnerGameContainer", className: "partnerGameContainer"
            })
            return el
        })(),

        dialogRequest: document.getElementById("dialogRequest"),
        dialogResponse: document.getElementById("dialogResponse"),
        dialogEndGame: document.getElementById("dialogEndGame")
    },

    get userLogin() {
        return this.components.userContainer.querySelector("#login")
    },
    get partnerLogin() {
        return this.components.partnerContainer.querySelector("#partnerLogin")
    },

    get status() {
        return this.components.partnerContainer.querySelector("#status")
    },

    replaceHTML(html = '', object) {
        for (const key in object) {
            while (html.includes(object[key])) {
                html.replace(`{{${key}}}`, object[key])
            }
        }
    },
    addEventListener(btnId, type, callback) {
        for (const key in this.components) {
            const btn = this.components[key].querySelector(`#${btnId}`)
            if (btn !== null) {
                btn.addEventListener(type, callback)
                break
            }
        }
    },
    setPartner(partner) {
        this.partnerLogin.innerText = partner.login
        this.status.innerText = partner.status
    },
    setConnectingPage(user) {
        this.container.innerHTML = ""
        this.container.append(this.components.userContainer, this.components.form)
        this.userLogin.innerText = user.login
    },
    setConnectingPageWithPartner(user) {
        this.container.innerHTML = ""
        this.container.append(this.components.userContainer,
            this.components.partnerContainer,
            this.components.playContainer)

        this.userLogin.innerText = user.login
    },
    setFillingField(field) {
        this.container.innerText = ""
        this.components.gameContainer.innerHTML = ""
        this.components.gameContainer.append(
            this.components.partnerContainer,
            this.components.playContainer,
            this.components.gameField
        )
        this.container.append(this.components.gameContainer)
        game.fillingField(field)
    },
    setBattle(field, partnerField, isStep) {
        this.container.innerHTML = ""
        this.components.gameContainer.innerHTML = ""
        this.components.userGameContainer.append(
            this.components.userContainer,
            this.components.gameField
        )
        this.components.partnerGameContainer.append(
            this.components.partnerContainer,
            this.components.partnerGameField
        )
        this.components.gameContainer.append(
            this.components.userGameContainer,
            this.components.partnerGameContainer
        )
        this.container.append(this.components.gameContainer)
        this.setStep(isStep)
        game.battle(field, partnerField)
    },
    setStep(isStep) {
        const temp = ["ждёт", "ходит"]
        this.components.userContainer.querySelector("#step").innerText = temp[Number(isStep)]
        this.components.partnerContainer.querySelector("#step").innerText = temp[Number(!isStep)]
    },
    changeStatus(status) {
        this.status.innerText = status
    },
    openDialogRequest(partner) {
        document.getElementById("partnerLoginInDialog").innerText = partner.login
        this.components.dialogRequest.showModal()
    },
    openDialogResponse(text) {
        document.getElementById("text").innerText = text
        this.components.dialogResponse.showModal()
    },
    openDialogEndGame(partner) {
        this.components.dialogEndGame.querySelector("#gamer").innerText = partner
        this.components.dialogEndGame.showModal()
    }
}