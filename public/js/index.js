import { sendRequest } from "./sendRequest.js";

const form = document.getElementById('form')
let signIn = ''
const switchToForm = () => {
    registration.style.display = 'none'
    authorization.style.display = 'none'
    back.style.display = 'block'
    form.style.display = 'flex'
}
const switchFromForm = () => {
    registration.style.display = 'block'
    authorization.style.display = 'block'
    back.style.display = 'none'
    form.style.display = 'none'
}
const showBtn = () => {
    registration.style.display = 'block'
    authorization.style.display = 'block'
}
registration.addEventListener('click', () => {
    signIn = 'registration'
    switchToForm()
})
authorization.addEventListener('click', () => {
    signIn = 'authorization'
    switchToForm()
})
back.addEventListener('click', () => {
    signIn = ''
    switchFromForm()
})

submit.addEventListener('click', (event) => {
    event.preventDefault()
    const user = {
        login: login.value,
        password: password.value
    }
    sendRequest({ method: 'POST', pathname: `signIn/${signIn}`, body: user })
})