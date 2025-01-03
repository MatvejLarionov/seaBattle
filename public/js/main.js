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

submit.addEventListener("click", async (event) => {
    event.preventDefault()
    const user = {
        login: inpLogin.value || undefined,
        oldPassword: inpOlgPassword.value || undefined,
        password: inpNewPassword.value || undefined
    }
    if ((user.login || user.password) && user.oldPassword) {
        const data = await sendRequest({ method: "PATCH", pathname: `users/${userId}`, body: user })
        if (data.error) {
            error.innerText = data.error
        }
        else {
            error.innerText = "changed successfully"
        }
    } else {
        error.innerText = "заполните поля"
    }
})

play.addEventListener("click", () => {
    location = "/game/game.html"
})