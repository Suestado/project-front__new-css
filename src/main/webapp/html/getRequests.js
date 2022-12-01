function getRequest(url, params) {
    return fetch(url + params).then(response => {
        if (response.ok) {
            return response.json()
        } else {
            return response.json().then(error => {
                const e = new Error('Bad request')
                e.data = error
                throw e
            })
        }
    })
}


function getUsersParams(pageNumber, pageSize) {
    return '?pageNumber=' + pageNumber + '&pageSize=' + pageSize;
}

function renderUserTable(users) {
    const tableBody = document.getElementById('tableBody')
    $(tableBody).empty()
    users.forEach(user => {
        let row = ''
        row += '<tr>'
        for (const prop in user) {
            row += '<td>' + user[prop] + '</td>'
        }
        row += '</tr>'
        tableBody.innerHTML += row
    })
}

function renderPagesButtons(usersCount, pageSize, pages) {
    pages.innerHTML = 'Pages:'
    const numberOfPages = Math.ceil(usersCount / pageSize)
    let row = ''
    for (let i = 1; i <= numberOfPages; i++) {
        row += '<button class=button>' + i + '</button>'
    }
    pages.innerHTML += row
}

function getPageSize() {
    const selector = document.getElementById('accountsToBeShown')
    const selectedIndex = selector.value
    return selector.options[selectedIndex].text
}

(async () => {

    const usersLink = 'http://localhost:8080/rest/players'
    const userCountLink = 'http://localhost:8080/rest/players/count'
    const pageSize = await getPageSize()

    async function renderPage(pageSize, pageNumber) {
        if (pageNumber == null) {
            pageNumber = 0;
        }

        const pages = document.getElementById('paging')
        const usersParams = getUsersParams(pageNumber, pageSize)

        const users = await getRequest(usersLink, usersParams)
            .then(users => {
                return users
            })
            .catch(console.error)

        const usersCount = await getRequest(userCountLink, '')
            .then(usersCount => {
                return usersCount
            })
            .catch(console.error)

        await renderUserTable(users)
        await renderPagesButtons(usersCount, pageSize, pages)
    }

    await renderPage(pageSize)

    selector.addEventListener('change', async (event) => {
        const pageSize = event.target.selectedOptions[0].innerText
        await renderPage(pageSize)
    })

    const divPaging = document.getElementById('paging')
    divPaging.addEventListener('click', async (event) => {
        const pageNumber = event.target.textContent - 1
        const pageSize = await getPageSize()
        await renderPage(pageSize, pageNumber)
    })

})()
