const app = require("./app");
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  console.log(`📊 API доступно: http://localhost:${PORT}/api/tasks`);
  console.log(`🎨 Интерфейс: http://localhost:${PORT}`);
});
