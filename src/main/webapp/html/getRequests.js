const usersLink = 'http://localhost:8080/rest/players'
const userCountLink = 'http://localhost:8080/rest/players/count'

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

let users = getRequest(usersLink)
    .then(data => {
        users = data
        const table = document.getElementById('userTable')
        users.forEach(user => {
            let row = ''
            row += '<tr>'
            for (const prop in user) {
                row += '<td>' + user[prop] + '</td>'
            }
            row += '</tr>'
            table.innerHTML += row
        })
    })
    .catch(err => console.log(err))

let usersCount = getRequest(userCountLink)
    .then(data => {
        usersCount = data
    })
