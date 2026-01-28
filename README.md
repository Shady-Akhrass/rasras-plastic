
```markdown
# RasRas Plastic Web

A full-stack web application for RasRas Plastic with React TypeScript + Vite frontend and Java Spring Boot backend.

## Project Structure

```
web/
├── frontend/    # React TypeScript + Vite application
└── backend/     # Java Spring Boot application
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) and **npm** (v9 or higher)
- **Java JDK** (v17 or higher)
- **Maven** (v3.6 or higher)

## Frontend Setup

### Installation

1. Navigate to the frontend directory:
```bash
cd web/frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Frontend

To start the Vite development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Backend Setup

### Installation

1. Navigate to the backend directory:
```bash
cd web/backend
```

2. Install dependencies (Maven will handle this automatically):
```bash
mvn clean install
```

### Running the Backend

Run the Spring Boot application using Maven:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## Running the Full Stack Application

### Development Mode

1. **Terminal 1** - Start the backend:
```bash
cd web/backend
mvn spring-boot:run
```

2. **Terminal 2** - Start the frontend:
```bash
cd web/frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Environment Variables

### Backend (application.properties)
Configure in `web/backend/src/main/resources/application.properties`
```

You can now copy this entire content and save it as `README.md` in your project root directory!