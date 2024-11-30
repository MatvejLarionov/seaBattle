import { sendRequest } from "./sendRequest.js";

const form = document.getElementById('form')
let signIn = ''
const switchToForm = () => {
    navContainer.style.display = 'none'
    back.style.display = 'block'
    form.style.display = 'flex'
}
const switchFromForm = () => {
    navContainer.style.display = 'flex'
    back.style.display = 'none'
    form.style.display = 'none'
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