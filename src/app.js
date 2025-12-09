const express = require("express");
const path = require("path");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов (custom middleware)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Статические файлы
app.use(express.static(path.join(__dirname, "../public")));

// Данные задач
let tasks = [
  {
    id: uuidv4(),
    title: "Изучить Express.js",
    description: "Освоить основы фреймворка Express.js",
    status: "todo",
    priority: "high",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "Создать API",
    description: "Реализовать REST API для канбан-доски",
    status: "in-progress",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "Написать документацию",
    description: "Добавить README и комментарии в код",
    status: "done",
    priority: "low",
    createdAt: new Date().toISOString(),
  },
];

// API Routes

// GET все задачи
app.get("/api/tasks", (req, res) => {
  const { status } = req.query;

  if (status) {
    const filteredTasks = tasks.filter((task) => task.status === status);
    return res.json({
      success: true,
      count: filteredTasks.length,
      data: filteredTasks,
    });
  }

  res.json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

// GET задачу по ID
app.get("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: `Задача с ID ${id} не найдена`,
    });
  }

  res.json({
    success: true,
    data: task,
  });
});

// POST создать задачу
app.post("/api/tasks", (req, res) => {
  const { title, description, status = "todo", priority = "medium" } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Название задачи обязательно",
    });
  }

  const newTask = {
    id: uuidv4(),
    title: title.trim(),
    description: description ? description.trim() : "",
    status,
    priority,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: "Задача успешно создана",
    data: newTask,
  });
});

// PUT обновить задачу
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Задача с ID ${id} не найдена`,
    });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
  };

  res.json({
    success: true,
    message: "Задача успешно обновлена",
    data: tasks[taskIndex],
  });
});

// DELETE удалить задачу
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Задача с ID ${id} не найдена`,
    });
  }

  tasks.splice(taskIndex, 1);

  res.json({
    success: true,
    message: "Задача успешно удалена",
  });
});

// Главная страница
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// 404 ошибка
app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

module.exports = app;
