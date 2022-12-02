const usersLink = 'http://localhost:8080/rest/players'
const userCountLink = 'http://localhost:8080/rest/players/count'
let saveButtonId = 0

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

function deleteUser(url, userIndex, users) {
    const user = users[userIndex];
    if (user === undefined) {
        alert('Something went wrong, user was not deleted, page is to be re-rendered.')
        return
    }

    return fetch(url + '/' + user.id, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            return true
        } else {
            alert('Something went wrong: User was not deleted.')
        }
    })
}

function editUser(url, user) {
    const userToSend = {}
    const editableProps = ['name', 'title', 'race', 'profession', 'banned']
    editableProps.forEach(prop => {
        userToSend[prop] = user[prop]
    })

    return fetch(url + '/' + user.id, {
        method: 'POST',
        headers: new Headers({'content-type': 'application/json'}),
        body: JSON.stringify(userToSend)
    }).then(response => {
        if (response.ok) {
            return true
        } else {
            alert('Something went wrong: User was not edited.')
        }
    })
}

function createUser(url, user) {
    return fetch(url, {
        method: 'POST',
        headers: new Headers({'content-type': 'application/json'}),
        body: JSON.stringify(user)
    }).then(response => {
        if (response.ok) {
            alert('User @' + user.name + 'has been created successfully.')
            return true
        } else {
            alert('Something went wrong: User was not created.')
        }
    })
}

function getUsersParams(pageNumber, pageSize) {
    return '?pageNumber=' + pageNumber + '&pageSize=' + pageSize;
}

function renderUserTable(users) {
    const tableBody = document.getElementById('tableBody')
    $(tableBody).empty()
    let i = 0;
    const props = ['id', 'name', 'title', 'race', 'profession', 'level', 'birthday', 'banned']
    users.forEach(user => {
        let row = ''
        row += '<tr>'
        props.forEach(prop => {
            if (prop !== 'birthday') {
                row += '<td title="' + prop + '">' + user[prop] + '</td>'
            } else {
                const day = new Date(user[prop]).toLocaleDateString()
                row += '<td title="' + prop + '">' + day + '</td>'
            }
        })
        const id = 'button' + i;
        row += '<td><img src="img/edit.png" title="' + i + '" alt="Edit" class="container" id="' + id + '"></td>'
        row += '<td><img src="img/delete.png" title="' + i + '" alt="Delete" class="container"></td>'
        row += '</tr>'
        tableBody.innerHTML += row
        i++;
    })
}

function renderPagesButtons(usersCount, pageSize, pages, pageNumber) {
    pages.innerHTML = 'Pages: '
    const numberOfPages = Math.ceil(usersCount / pageSize)
    let row = ''
    for (let i = 1; i <= numberOfPages; i++) {
        if (i !== pageNumber + 1) {
            row += '<button class="button">' + i + '</button>'
        } else {
            row += '<button class="selectedButton" id="pageNumber">' + i + '</button>'
        }
    }
    pages.innerHTML += row
}

function getPageSize() {
    const selector = document.getElementById('accountsToBeShown')
    const selectedIndex = selector.value
    return selector.options[selectedIndex].text
}

function makeSelect(cell, elements) {
    const text = cell.textContent
    const title = cell.title
    let select = '<td contentEditable="true" class="editableText" title="' + title + '"><select class="SelectWithinTable">'
    select += '<option>' + text + '</option>'
    elements.forEach(e => {
        if (e !== text) {
            select += '<option>' + e + '</option>'
        }
    })
    select += '</select></td>'
    cell.outerHTML = select
}

(async () => {

    async function renderPage(pageSize, pageNumber) {
        if (pageNumber == null) {
            pageNumber = 0;
        }

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

        const pages = document.getElementById('paging')
        await renderPagesButtons(usersCount, pageSize, pages, pageNumber)
    }

    const pageSize = await getPageSize()
    await renderPage(pageSize)

    const selector = document.getElementById('accountsToBeShown')
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

    const userTable = document.getElementById('userTable')
    userTable.addEventListener('click', async (event) => {
        const button = event.target.alt
        const pageNumber = document.getElementById('pageNumber').innerText - 1
        const pageSize = await getPageSize()
        switch (button) {
            case "Delete": {
                const userIndex = event.target.title
                const usersParams = getUsersParams(pageNumber, pageSize)
                const users = await getRequest(usersLink, usersParams)
                await deleteUser(usersLink, userIndex, users)
                await renderPage(pageSize, pageNumber)
                break
            }
            case "Edit": {
                const cells = event.target.parentNode.parentNode.childNodes
                let i = 0
                cells.forEach(cell => {
                    if (i === 1 || i === 2) {
                        const text = cell.textContent
                        const title = cell.title
                        cell.outerHTML = '<td contentEditable="true" class="editableText" title="' + title + '"><input type="text" value="' + text + '"></td>'
                    } else if (i === 3) {
                        const races = ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT']
                        makeSelect(cell, races);
                    } else if (i === 4) {
                        const professions = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID']
                        makeSelect(cell, professions)
                    } else if (i === 7) {
                        const options = ['true', 'false']
                        makeSelect(cell, options)
                    } else if (i === 8) {
                        cell.outerHTML = '<td><img src="img/save.png" alt="Save" class="container" id=saveButton"' + saveButtonId + '"></td>'
                        saveButtonId++
                    }
                    i++
                })
                break
            }
            case "Save": {
                const cells = event.target.parentNode.parentNode.childNodes
                let i = 0
                const editedUser = {}
                cells.forEach(cell => {
                    if (i < 8) {
                        const userProp = cell.title
                        if (userProp === 'name' || userProp === 'title') {
                            const text = cell.children[0]
                            editedUser[userProp] = text.value
                        } else if (userProp === 'race' || userProp === 'profession' || userProp === 'banned') {
                            const selector = cell.children[0]
                            editedUser[userProp] = selector.value
                        } else {
                            editedUser[userProp] = cell.textContent
                        }
                        i++
                    }
                })
                await editUser(usersLink, editedUser)
                await renderPage(pageSize, pageNumber)
            }
        }
    })

    const createButton = document.getElementById('createButton')
    createButton.addEventListener('click', async () => {
        const userCreateForm = document.getElementById('createPlayer')
        const form = userCreateForm.children[2]
        const newUser = {}
        for (let i = 0; i < form.length; i++) {
            const node = form[i]
            const prop = node.labels[0].id
            if (prop !== 'birthday') {
                if (node.nodeName === 'INPUT') {
                    newUser[prop] = node.value
                } else if (node.nodeName === 'SELECT') {
                    newUser[prop] = node[node.selectedIndex].value
                }
            } else {
                const birthday = new Date(node.value)
                newUser[prop] = birthday.getTime()
            }
        }
        await createUser(usersLink, newUser)
        const pageSize = await getPageSize()
        await renderPage(pageSize)
    })

})()
