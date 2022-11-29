const requestUrl = 'http://127.0.0.1:8080/rest/players'

function getRequest(url) {
    return fetch(url).then(response => {
        if (response.ok) {
            return response.json()
        } else {
            return response.json().then(error => {
                const e = new Error('Bad request')
                e.data = error;
                throw e
            })
        }
    })
}

let users = getRequest(requestUrl)
    .then(data => console.log(data))
    .catch(err => console.log(err));
