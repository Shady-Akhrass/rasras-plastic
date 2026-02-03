# RasRas Plastics ERP

A comprehensive Enterprise Resource Planning (ERP) system for RasRas Plastics, featuring a robust Spring Boot backend, a modern Vite-based web frontend, and a cross-platform mobile application.

## 🏗️ Project Structure

The repository is organized into several key areas:

*   **`web/backend/`**: Spring Boot application (Java 17, Maven, MySQL).
*   **`web/frontend/`**: React application (TypeScript, Vite, Tailwind CSS).
*   **`mob/`**: Mobile application (React Native/Expo).
*   **`scripts/`**: PowerShell helper scripts for development and deployment.
*   **`doc/`**: Project documentation and specifications.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
*   **Java 17** (for the Backend)
*   **Node.js 18+** (for Frontend and Mobile)
*   **MySQL 8.0**
*   **Git**

---

### 🔙 Backend Setup & Run

1.  **Database Configuration**:
    *   Create a database named `rasrasplastics` in MySQL.
    *   Configure `web/backend/src/main/resources/application.properties` with your MySQL credentials.
2.  **Run the Backend**:
    ```powershell
    cd web/backend
    .\mvnw.cmd spring-boot:run
    ```
    *   **API Base URL**: `http://localhost:8080/api`
    *   **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`

---

### 💻 Web Frontend Setup & Run

1.  **Install Dependencies**:
    ```powershell
    cd web/frontend
    npm install
    ```
2.  **Run Development Server**:
    ```powershell
    npm run dev
    ```
    *   Access the site at the URL provided in the terminal (usually `http://localhost:5173`).

---

### 📱 Mobile App Setup & Run

1.  **Install Dependencies**:
    ```powershell
    cd mob
    npm install
    ```
2.  **Start Expo**:
    ```powershell
    npx expo start
    ```
    *   Use the Expo Go app on your phone or an emulator to scan the QR code.

---

## 🛠️ Helper Scripts

We provide an interactive launcher for common tasks like branching and updates:
```powershell
.\scripts\main.ps1
```

---

## 🔄 Git Workflow (For Collaborators)

This section is for collaborators who are new to Git. Commands below are for PowerShell on Windows.

### 1) Configure Git (One-time)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf true
git config --global credential.helper manager-core
```

### 2) Feature Branching
Always work on a branch, never directly on `main`:
1.  **Pull latest main**: `git checkout main && git pull origin main`
2.  **Create branch**: `git checkout -b feature/your-feature-name`
3.  **Commit changes**: `git add . && git commit -m "feat: description"`
4.  **Push and PR**: `git push -u origin feature/your-feature-name`

### 3) Common Commands
*   `git status`: See what changes are staged/unstaged.
*   `git log --oneline`: See a brief history of commits.
*   `git pull --rebase origin main`: Update your branch with the latest changes from main.
