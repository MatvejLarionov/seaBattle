import { sendRequest } from "./sendRequest.js"
const userId = sessionStorage.getItem('id')
const bodyHtml = sendRequest({ method: "GET", pathname: `main/bodyHtml/${userId}` })
bodyHtml.then(res=>document.body.innerHTML = res)