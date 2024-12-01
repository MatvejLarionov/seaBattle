import { sendRequest } from "./sendRequest.js";

const form = document.getElementById('form')
let signIn = ''
const switchToForm = () => {
    navContainer.style.display = 'none'
    back.style.display = 'block'
    form.style.display = 'flex'
}
const clearForm = () => {
    login.value = ''
    password.value = ''
    responseText.innerText = ''
}
const switchFromForm = () => {
    clearForm()
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

submit.addEventListener('click', async (event) => {
    event.preventDefault()
    const resTextTemplate = {
        loginRepeat: "Такой пользователь уже существует"
    }
    const user = {
        login: login.value,
        password: password.value
    }
    const res = await sendRequest({ method: 'POST', pathname: `signIn/${signIn}`, body: user })
    responseText.innerText = ''
    if (res.error === null) {
        window.location='/main'
    }
    else {
        responseText.innerText = resTextTemplate[res.error]
    }
})