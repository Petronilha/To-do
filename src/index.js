const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(express.json())

const users = []

function checkIfExistUser(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json({ ERROR: 'User not exists' })
  }

  request.user = user

  return next()
}

app.post('/create', (request, response) => {
  const { name, username } = request.body

  const user = users.some(user => user.username === username)

  if (user) {
    return response.status(400).json({
      ERROR: 'This account already exist.'
    })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).json({ Message: 'User created' })
})

app.get('/account', checkIfExistUser, (request, response) => {
  const { user } = request

  return response.json([user.name, user.todos])
})

app.post('/todos', checkIfExistUser, (request, response) => {
  const { title, deadline } = request.body

  const { user } = request

  const todosCreate = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todosCreate)

  return response.status(201).json(todosCreate)
})

app.put('/todos/:id', checkIfExistUser, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const change = user.todos.find(change => change.id === id)

  if (!change) {
    return response.status(404).json({ error: 'Todo not exists' })
  }

  change.title = title
  change.deadline = new Date(deadline)

  return response.json(change)
})

app.patch('/todos/:id/done', checkIfExistUser, (request, response) => {
  const { id } = request.params
  const { user } = request

  const change = user.todos.find(change => change.id === id)

  if (!change) {
    return response.status(404).json({ error: 'Todo not exists' })
  }

  change.done = true

  return response.json(change)
})

app.delete('/todos/:id', checkIfExistUser, (request, response) => {
  const { user } = request
  const { id } = request.params

  const changeIndex = user.todos.findIndex(change => change.id === id)

  if (changeIndex === -1) {
    return response.status(404).json({ error: 'Todo not exists' })
  }

  user.todos.splice(changeIndex, 1)

  return response.status(204).json()
})

app.listen(3333, () => {
  console.log('To-do working...')
})
