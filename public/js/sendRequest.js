export const sendRequest = async ({ baseUrl, method, pathname, body }) => {
    const url = `${baseUrl || ''}/${pathname}`
    const config = {
        method: method || 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    }
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        config.body = JSON.stringify(body)
    }
    const text = (await fetch(url, config)).text()
    try {
        return JSON.parse(await text)
    } catch (error) {
        
    }

    return text
}