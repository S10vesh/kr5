document.addEventListener("DOMContentLoaded", function () {
  // Элементы DOM
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskModal = document.getElementById("taskModal");
  const closeBtns = document.querySelectorAll(".close-btn");
  const taskForm = document.getElementById("taskForm");
  const modalTitle = document.getElementById("modalTitle");
  const taskIdInput = document.getElementById("taskId");
  const titleInput = document.getElementById("title");
  const descriptionInput = document.getElementById("description");
  const statusSelect = document.getElementById("status");
  const prioritySelect = document.getElementById("priority");

  const todoTasks = document.getElementById("todo-tasks");
  const inProgressTasks = document.getElementById("in-progress-tasks");
  const doneTasks = document.getElementById("done-tasks");

  const todoCount = document.getElementById("todo-count");
  const inProgressCount = document.getElementById("in-progress-count");
  const doneCount = document.getElementById("done-count");
  const totalTasks = document.getElementById("totalTasks");

  // Базовый URL API
  const API_URL = "/api/tasks";

  // Текущий режим модального окна (create/edit)
  let isEditMode = false;
  let currentTaskId = null;

  // Загрузить задачи с сервера
  async function loadTasks() {
    try {
      showLoading();
      const response = await fetch(API_URL);
      const result = await response.json();

      if (result.success) {
        renderTasks(result.data);
        updateStats(result.data);
      }
    } catch (error) {
      console.error("Ошибка при загрузке задач:", error);
      alert("Не удалось загрузить задачи. Проверьте подключение к серверу.");
    } finally {
      hideLoading();
    }
  }

  // Показать индикатор загрузки
  function showLoading() {
    const columns = document.querySelectorAll(".tasks");
    columns.forEach((column) => {
      column.innerHTML = '<div class="loading">Загрузка...</div>';
    });
  }

  // Скрыть индикатор загрузки
  function hideLoading() {
    // Удаляем индикаторы загрузки
    const loadingElements = document.querySelectorAll(".loading");
    loadingElements.forEach((el) => el.remove());
  }

  // Отобразить задачи на доске
  function renderTasks(tasks) {
    // Очистить колонки
    todoTasks.innerHTML = "";
    inProgressTasks.innerHTML = "";
    doneTasks.innerHTML = "";

    // Если нет задач
    if (tasks.length === 0) {
      const emptyMessage = '<div class="empty-message">Нет задач</div>';
      todoTasks.innerHTML = emptyMessage;
      inProgressTasks.innerHTML = emptyMessage;
      doneTasks.innerHTML = emptyMessage;
      return;
    }

    // Распределить задачи по колонкам
    tasks.forEach((task) => {
      const taskElement = createTaskElement(task);

      switch (task.status) {
        case "todo":
          todoTasks.appendChild(taskElement);
          break;
        case "in-progress":
          inProgressTasks.appendChild(taskElement);
          break;
        case "done":
          doneTasks.appendChild(taskElement);
          break;
      }
    });
  }

  // Создать элемент задачи
  function createTaskElement(task) {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task";
    taskDiv.setAttribute("data-id", task.id);
    taskDiv.setAttribute("data-priority", task.priority);

    // Форматирование даты
    const createdDate = new Date(task.createdAt).toLocaleDateString("ru-RU");

    // Получение названия статуса
    let statusText = "";
    let statusClass = "";

    switch (task.status) {
      case "todo":
        statusText = "К выполнению";
        statusClass = "status-todo";
        break;
      case "in-progress":
        statusText = "В процессе";
        statusClass = "status-in-progress";
        break;
      case "done":
        statusText = "Выполнено";
        statusClass = "status-done";
        break;
    }

    // Получение названия приоритета
    let priorityText = "";
    let priorityClass = "";
    switch (task.priority) {
      case "low":
        priorityText = "Низкий";
        priorityClass = "priority-low";
        break;
      case "medium":
        priorityText = "Средний";
        priorityClass = "priority-medium";
        break;
      case "high":
        priorityText = "Высокий";
        priorityClass = "priority-high";
        break;
    }

    taskDiv.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <span class="task-status ${statusClass}">${statusText}</span>
            </div>
            <div class="task-description">${escapeHtml(
              task.description || "Без описания"
            )}</div>
            <div class="task-footer">
                <div class="task-meta">
                    <div><small>Создано: ${createdDate}</small></div>
                    <div><small class="priority ${priorityClass}">Приоритет: ${priorityText}</small></div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-edit" data-id="${task.id}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="btn btn-delete" data-id="${task.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `;

    return taskDiv;
  }

  // Обновить статистику
  function updateStats(tasks) {
    const todoTasksCount = tasks.filter(
      (task) => task.status === "todo"
    ).length;
    const inProgressTasksCount = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;
    const doneTasksCount = tasks.filter(
      (task) => task.status === "done"
    ).length;

    todoCount.textContent = todoTasksCount;
    inProgressCount.textContent = inProgressTasksCount;
    doneCount.textContent = doneTasksCount;
    totalTasks.textContent = `Всего задач: ${tasks.length}`;
  }

  // Открыть модальное окно для создания задачи
  function openCreateModal() {
    isEditMode = false;
    currentTaskId = null;
    modalTitle.textContent = "Новая задача";
    taskForm.reset();
    taskIdInput.value = "";
    taskModal.classList.add("active");
    titleInput.focus();
  }

  // Открыть модальное окно для редактирования задачи
  async function openEditModal(taskId) {
    try {
      const response = await fetch(`${API_URL}/${taskId}`);
      const result = await response.json();

      if (result.success) {
        isEditMode = true;
        currentTaskId = taskId;
        modalTitle.textContent = "Редактировать задачу";

        const task = result.data;
        taskIdInput.value = task.id;
        titleInput.value = task.title;
        descriptionInput.value = task.description || "";
        statusSelect.value = task.status;
        prioritySelect.value = task.priority;

        taskModal.classList.add("active");
        titleInput.focus();
      } else {
        alert("Не удалось загрузить задачу для редактирования");
      }
    } catch (error) {
      console.error("Ошибка при загрузке задачи:", error);
      alert("Не удалось загрузить задачу для редактирования");
    }
  }

  // Закрыть модальное окно
  function closeModal() {
    taskModal.classList.remove("active");
    taskForm.reset();
    isEditMode = false;
    currentTaskId = null;
  }

  // Отправить форму (создание/редактирование задачи)
  async function handleFormSubmit(e) {
    e.preventDefault();

    const taskData = {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      status: statusSelect.value,
      priority: prioritySelect.value,
    };

    if (!taskData.title) {
      alert("Название задачи обязательно");
      titleInput.focus();
      return;
    }

    try {
      let response;

      if (isEditMode && currentTaskId) {
        // Редактирование существующей задачи
        response = await fetch(`${API_URL}/${currentTaskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });
      } else {
        // Создание новой задачи
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });
      }

      const result = await response.json();

      if (result.success) {
        closeModal();
        loadTasks();

        // Небольшая задержка для лучшего UX
        setTimeout(() => {
          if (isEditMode) {
            showNotification("Задача успешно обновлена", "success");
          } else {
            showNotification("Задача успешно создана", "success");
          }
        }, 300);
      } else {
        showNotification(`Ошибка: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error);
      showNotification("Не удалось сохранить задачу", "error");
    }
  }

  // Удалить задачу
  async function deleteTask(taskId) {
    if (!confirm("Вы уверены, что хотите удалить эту задачу?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        loadTasks();
        showNotification("Задача успешно удалена", "success");
      } else {
        showNotification(`Ошибка: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
      showNotification("Не удалось удалить задачу", "error");
    }
  }

  // Показать уведомление
  function showNotification(message, type = "info") {
    // Создаем элемент уведомления
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Добавляем в body
    document.body.appendChild(notification);

    // Удаляем через 3 секунды
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Экранирование HTML для безопасности
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Делегирование событий для кнопок редактирования и удаления
  function handleTaskActions(e) {
    // Редактирование задачи
    if (e.target.closest(".btn-edit")) {
      const taskId = e.target.closest(".btn-edit").getAttribute("data-id");
      openEditModal(taskId);
    }

    // Удаление задачи
    if (e.target.closest(".btn-delete")) {
      const taskId = e.target.closest(".btn-delete").getAttribute("data-id");
      deleteTask(taskId);
    }

    // Перемещение задачи (drag & drop упрощенный)
    if (e.target.closest(".task")) {
      const taskElement = e.target.closest(".task");
      // Можно добавить логику для drag & drop
    }
  }

  // Обработчики событий
  addTaskBtn.addEventListener("click", openCreateModal);

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  taskForm.addEventListener("submit", handleFormSubmit);

  // Закрытие модального окна при клике вне его
  taskModal.addEventListener("click", function (e) {
    if (e.target === taskModal) {
      closeModal();
    }
  });

  // Обработка действий с задачами
  document.addEventListener("click", handleTaskActions);

  // Загрузить задачи при старте
  loadTasks();

  // Автоматическое обновление каждые 30 секунд (опционально)
  setInterval(loadTasks, 30000);
});
