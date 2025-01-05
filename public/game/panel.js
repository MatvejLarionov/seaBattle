export const panel = {
    selectedElement: undefined,
    element: (() => {
        const el = document.createElement("div")
        el.id = "panel"
        el.classList.add("panel")
        return el
    })(),
    addElement(length) {
        const div = document.createElement("div")
        div.id = "ship"
        div.classList.add("ship")
        for (let i = 0; i < length; i++) {
            div.append(document.createElement("div"))
        }

        div.addEventListener("click", () => {
            if (this.selectedElement) {
                this.selectedElement.classList.remove("selectedElement")
            }
            this.selectedElement = div
            div.classList.add("selectedElement")
        })

        this.element.append(div)
    },
    fillIn(arrShipSize) {
        document.addEventListener("click", (event) => {
            if (this.selectedElement) {
                const arrEl = Object.values(this.selectedElement.getElementsByTagName("div"))
                if (!arrEl.includes(event.target)) {
                    this.selectedElement.classList.remove("selectedElement")
                    this.selectedElement = undefined
                }
            }
        })

        arrShipSize.forEach(item => {
            this.addElement(item)
        })
    },
    removeSelectedElement() {
        if (this.selectedElement)
            this.element.removeChild(this.selectedElement)
    },
    get lengthSelectedElement() {
        if (this.selectedElement)
            return Object.values(this.selectedElement.getElementsByTagName("div")).length
    }
}