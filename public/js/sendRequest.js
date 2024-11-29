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
    const data = await fetch(url, config)
    return await data.json()
}