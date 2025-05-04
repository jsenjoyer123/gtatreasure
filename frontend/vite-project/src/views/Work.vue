<template>
    <div class="work-container">
      <div class="work-header">
        <h2>Рабочий портал</h2>
        <div class="status">🟢 Онлайн</div>
      </div>
      
      <div class="tasks">
        <div class="task-card">
          <h3>Текущие задачи</h3>
          <ul>
            <li>✅ Завершить проект Vue</li>
            <li>⏳ Провести код-ревью</li>
            <li>📅 Планирование спринта</li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .work-container {
    padding: 20px;
    height: 100%;
  }
  
  .work-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .tasks {
    display: grid;
    gap: 20px;
  }
  
  .task-card {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .task-card h3 {
    color: #007aff;
    margin-bottom: 15px;
  }
  
  .task-card ul {
    list-style: none;
    padding: 0;
  }
  
  .task-card li {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  </style>