import { sendRequest } from "./sendRequest.js"
const userId = sessionStorage.getItem('id')
const showMainPage = async () => {
    if (!userId) {
        window.location = '/'
        return
    }
    const user = await sendRequest({ method: "GET", pathname: `users/${userId}` })
    login.innerText = user.login
}
await showMainPage()


const webSocket = new WebSocket(`ws://localhost:3000`)

webSocket.onopen = () => {
    webSocket.send(JSON.stringify({
        type: "setLogin",
        login: login.innerText
    }))
}

const btn = document.getElementById('btn')
const inp = document.getElementById('inpLogin')
btn.addEventListener('click', (event) => {
    event.preventDefault()
    const sendObj = {
        type: "request to join",
        login: inp.value
    }
    webSocket.send(JSON.stringify(sendObj))
})

const dialogRequest = document.getElementById("dialogRequest")
const dialogResponse = document.getElementById("dialogResponse")
const partnerLogin = document.getElementById("partnerLogin")
webSocket.onmessage = (e) => {
    const body = JSON.parse(e.data)
    switch (body.type) {
        case "request to join":
            partnerLogin.innerText = body.partnerLogin
            dialogRequest.showModal()
            break;
        case "acceptJoin":
            playContainer.style.display = "block"
            partnerLogin1.innerText = body.partnerLogin
            form.style.display = "none"
            break;
        case "rejectJoin":
            text.innerText = `${inp.value} отклонил запрос`
            dialogResponse.showModal()
            break;
        case "notFound":
            text.innerText = `${inp.value} не найден`
            dialogResponse.showModal()
            break;
        default:
            break;
    }
}

accept.addEventListener("click", () => {
    webSocket.send(JSON.stringify({
        type: "acceptJoin",
    }))
    dialogRequest.close()
})

reject.addEventListener("click", () => {
    webSocket.send(JSON.stringify({
        type: "rejectJoin",
    }))
    dialogRequest.close()
})
btnClose.addEventListener("click", () => {
    dialogResponse.close()
})