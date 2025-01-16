import { sendRequest } from "../js/sendRequest.js"
import { game } from "./game.js"
import { page } from "./pages.js"
const userId = sessionStorage.getItem('id')
if (!userId) {
    window.location = '/'
}
const user = await sendRequest({ method: "GET", pathname: `users/${userId}` })
page.setConnectingPage(user)
let partner = null

const webSocket = new WebSocket(`ws://${location.hostname}:${location.port}`)
game.setWebSocket(webSocket)
webSocket.onopen = () => {
    webSocket.send(JSON.stringify({
        type: "authorization",
        id: userId
    }))
}

const inp = document.getElementById('inpLogin')
const dialogRequest = document.getElementById("dialogRequest")
const dialogResponse = document.getElementById("dialogResponse")

const eventListners = {
    btnRequestToJoin: {
        type: "click",
        callback: (event) => {
            event.preventDefault()
            const sendObj = {
                type: "requestToJoin",
                login: inp.value
            }
            webSocket.send(JSON.stringify(sendObj))
        }
    },
    accept: {
        type: "click",
        callback: () => {
            webSocket.send(JSON.stringify({
                type: "acceptJoin",
            }))
            dialogRequest.close()
        }
    },
    reject: {
        type: "click",
        callback: () => {
            webSocket.send(JSON.stringify({
                type: "rejectJoin",
            }))
            dialogRequest.close()
        }
    },
    disconnection: {
        type: "click",
        callback: () => {
            webSocket.send(JSON.stringify({
                type: "disconnect",
            }))
            page.setConnectingPage(user)
        }
    },
    btnClose: {
        type: "click",
        callback: () => {
            dialogResponse.close()
        }
    },
    ready: {
        type: "click",
        callback: () => {
            const obj = {
                "ready to play": "readyToPlay",
                "not ready to play": "notReadyToPlay"
            }
            webSocket.send(JSON.stringify({
                type: obj[ready.innerText]
            }))
            if (ready.innerText === "ready to play")
                ready.innerText = "not ready to play"
            else
                ready.innerText = "ready to play"
        }
    }
}
for (const key in eventListners) {
    const type = eventListners[key].type
    const callback = eventListners[key].callback
    page.addEventListener(key, type, callback)
}

webSocket.onmessage = (e) => {
    const body = JSON.parse(e.data)
    switch (body.type) {
        case "setPartner":
            partner = body.partner
            page.setPartner(partner)
            break;
        case "requestToJoin":
            page.openDialogRequest(partner)
            break;
        case "acceptJoin":
            page.setConnectingPageWithPartner(user)
            break;
        case "rejectJoin":
            page.openDialogResponse(`${partner.login} отклонил запрос`)
            partner = null
            break;
        case "partnerIsNotFound":
            page.openDialogResponse(`${inp.value} не найден`)
            break;
        case "disconnect":
            page.setConnectingPage(user)
            page.openDialogResponse(`${partner.login} отключился`)
            break;
        case "changeStatus":
            partner.status = body.status
            page.changeStatus(partner.status)
            break;
        case "setGameStage":
            switch (body.gameStage) {
                case "fillingField":
                    const ready = document.getElementById("ready")
                    if (ready !== null)
                        ready.innerText = "ready to play"
                    page.setFillingField(body.field)
                    break;
                case "battle":
                    page.setBattle(body.field, body.partnerField)
                    break;
                default:
                    break;
            }
            break;
        case "setOnField":
            game.setOnField(body.data)
            break;
        case "setOnPartnerField":
            game.setOnPartnerField(body.data)
            break;
        default:
            break;
    }
}