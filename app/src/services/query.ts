const settings = { 
    endpoint: '/api/v1',
    host: 'http://127.0.0.1',
    port: 8000
};

export async function QueryChats() {
    const response = await fetch(`${settings.host}:${settings.port}/${settings.endpoint}/chats`, {method: 'GET'});
    console.log(response);
    return await response.json();
}