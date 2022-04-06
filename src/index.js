const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  
  const currentUser = users.find(user => user.username === username);
  if (!currentUser) return res.status(404).json({ error: 'User not found' });
  
  req.user = currentUser;
  return next()
}

function checksExistsUserTodo(req, res, next) {
  const { user } = req;
  const { id } = req.params;

  const currentTodo = user.todos.find(todo => todo.id === id);
  if (!currentTodo) return res.status(404).json({ error: 'Todo not exists!' });
  
  req.todo = currentTodo;
  return next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const userExists = users.some(user => user.username === username);
  if (userExists) return res.status(400).json({ error: 'User already exists!' });

  const newUser = {
    id: uuidv4(),
    username,
    name,
    todos: [],
  }

  users.push(newUser);

  return res.status(201).json(newUser);
});

app.use(checksExistsUserAccount);

app.get('/todos', (req, res) => {
  const { user: { todos }} = req;
  return res.json(todos);
});

app.post('/todos', (req, res) => {
  const { title, deadline } = req.body;
  const { user: { todos }} = req;
  
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }
  
  todos.push(newTodo);
  return res.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserTodo, (req, res) => {
  const { title, deadline } = req.body;
  const { todo } = req;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserTodo, (req, res) => {
  const { todo } = req;
  todo.done = true;
  
  return res.json(todo);
});

app.delete('/todos/:id', checksExistsUserTodo, (req, res) => {
  const { user: { todos }, todo } = req;
  const todoIndex = todos.indexOf(todo);

  todos.splice(todoIndex, 1);
  return res.status(204).send()
});

module.exports = app;