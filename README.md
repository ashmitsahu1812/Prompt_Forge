# Prompt Forge

**Prompt Forge** is a minimalist, SaaS-style AI Prompt Studio designed for developers, researchers, and prompt engineers. It provides a comprehensive platform to craft, manage, test, evaluate, and compare AI prompts efficiently.

![Prompt Forge](/window.svg) <!-- Replace with actual screenshot when available -->

## 🚀 Key Features

*   **Prompt Management:** Create, refine, and organize your prompt engineering workflows in a distraction-free environment.
*   **Test Suites:** Design multiple test cases and dynamic specific variables to validate the robustness of your prompts under different scenarios.
*   **Execution & Evaluation:** Run prompts directly through the platform and carefully analyze generated results and execution logs.
*   **Comparison Engine:** A side-by-side comparison view to track performance, accuracy, token usage, and overall output quality between different prompt iterations.
*   **Template Library:** Access and utilize a robust collection of pre-defined, high-quality prompt templates to accelerate development.
*   **Minimalist UI:** A clean, modern, and high-fidelity user interface prioritizing stability and a professional user experience. 

## 🛠️ Technology Stack

This project is built using modern web development technologies:

*   **Framework:** [Next.js 16](https://nextjs.org/) (utilizing the App Router)
*   **UI Library:** [React 19](https://react.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 📂 Architecture Overview

The application follows a standard Next.js App Router structure:

*   `src/app/api/...`: Backend API routes handling core logic, including prompt execution (`/execute`), managing test suites, fetching templates, and logging results.
*   `src/app/prompts/...`: Interfaces for creating (`/new`) and editing (`/[id]`) individual prompts.
*   `src/app/compare`: The side-by-side prompt comparison engine.
*   `src/app/results/[id]`: Interfaces for viewing execution history and detailed result cards.
*   `src/components/...`: Reusable functional frontend UI elements (e.g., `Sidebar`, `RippleEffect`, `LayoutClient`).
*   `data/`: Local JSON-based storage engine handling the persistence of prompts, templates, test suites, and execution logs.

## 💻 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

Ensure you have Node.js (v18 or higher recommended) and npm (or yarn/pnpm/bun) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ashmitsahu1812/Prompt_Forge.git
   ```
2. Navigate into the project directory:
   ```bash
   cd Prompt_Forge
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the application locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your web browser to access the Prompt Forge studio.

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! Feel free to check the [issues page](https://github.com/ashmitsahu1812/Prompt_Forge/issues). 

## 📝 License

This project is open-source and available for personal and educational use.
