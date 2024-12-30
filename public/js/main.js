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
profile.addEventListener("click", () => location = "/profile.html")


const webSocket = new WebSocket(`ws://localhost:3000`)

webSocket.onopen = () => {
    webSocket.send(JSON.stringify({
        type: "authorization",
        id: userId
    }))
}

const btnRequestToJoin = document.getElementById('btnRequestToJoin')
const inp = document.getElementById('inpLogin')
btnRequestToJoin.addEventListener('click', (event) => {
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
const status = document.getElementById("status")
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
            status.innerText = "connect"
            break;
        case "rejectJoin":
            text.innerText = `${inp.value} отклонил запрос`
            dialogResponse.showModal()
            break;
        case "partnerIsNotFound":
            text.innerText = `${inp.value} не найден`
            dialogResponse.showModal()
            break;
        case "disconnect":
            form.style.display = "block"
            playContainer.style.display = "none"
            text.innerText = `${inp.value} отключился`
            dialogResponse.showModal()
            break;
        case "partnerIsDisconnect":
            status.innerText = "disconnect"
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

disconnection.addEventListener("click", () => {
    webSocket.send(JSON.stringify({
        type: "disconnect",
    }))
    form.style.display = "block"
    playContainer.style.display = "none"
})

btnClose.addEventListener("click", () => {
    dialogResponse.close()
})