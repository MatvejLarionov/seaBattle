import { sendRequest } from "./sendRequest.js";

const userId = sessionStorage.getItem("id")
if (userId) {
    const user = await sendRequest({ method: "GET", pathname: `users/${userId}` })
    login.innerText = user.login
    if (user.ava)
        ava.src = user.ava
}
else
    location = "/"

login.addEventListener("click", () => {
    inpNewPassword.style.display = "none"

    editForm.style.display = "block"
    inpLogin.style.display = "block"
})
password.addEventListener("click", () => {
    inpLogin.style.display = "none"

    editForm.style.display = "block"
    inpNewPassword.style.display = "block"
})

submit.addEventListener("click", (event) => {
    event.preventDefault()
    const user = {
        login: inpLogin.value || undefined,
        oldPassword: inpOlgPassword.value || undefined,
        newPassword: inpNewPassword.value || undefined
    }
    if ((user.login || user.newPassword) && user.oldPassword) {
        const data = sendRequest({ method: "PATCH", pathname: `users/${userId}`, body: user })
        console.log(data)
    } else {
        error.innerText = "заполните поля"
    }
})