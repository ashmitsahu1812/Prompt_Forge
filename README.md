# Prompt Forge

**Prompt Forge** is a high-fidelity AI Prompt Studio designed for developers, researchers, and prompt engineers who demand precision and persistence. It provides a state-of-the-art environment to craft, manage, test, evaluate, and compare AI prompts with a robust, disk-backed architecture.

![Prompt Forge](/window.svg) <!-- Replace with actual screenshot when available -->

## 🚀 Key Features

*   **Prompt Management:** Versioned prompt blueprints with instant rollback and manual "Neural Buffer" editing.
*   **Persistent Architecture:** Unlike many prototypes using ephemeral storage, Prompt Forge uses a disk-backed JSON engine for **Auth, Teams, Plugins, and logs**, ensuring your workflow survives server restarts.
*   **Orchestration & Testing:** Design complex test suites with dynamic variables to validate prompt robustness across multiple scenarios.
*   **Dynamic Model Selection:** Switch between high-performance models (Mistral, Llama, Gemma, Phi) on the fly during execution.
*   **Execution Transparency:** Detailed audit logs with side-by-side "Sent Payload" visibility to verify exact variable substitutions.
*   **Plugin Ecosystem:** A functional, persistent plugin system allowing you to install custom scorers and workflow extensions directly from the UI.
*   **Template Forge:** Save your best work as templates or browse a collection of pre-defined, high-quality blueprints.

## 🛠️ Technology Stack

*   **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
*   **UI Library:** [React 19](https://react.dev/)
*   **Styling:** [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) (Tailwind CSS v4 for utility-first components)
*   **Persistence:** File-System JSON Engine (Robust disk-backed storage)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 📂 Architecture Overview

*   `src/app/api/...`: Backend API routes handling core logic, including prompt execution (`/execute`), managing test suites, fetching templates, and logging results.
*   `src/app/prompts/...`: Advanced interfaces for creating and versioning prompts.
*   `src/app/compare`: Parallel comparison engine for identifying model drift and output quality.
*   `src/app/results/[id]`: High-fidelity execution audits with quality logs and neural scorers.
*   `src/lib/...`: Shared logic for Auth, Plugin registries, and Team management—all migrated to permanent disk storage.
*   `data/`: The central registry for prompts, templates, test suites, execution logs, and plugin configurations.

## 💻 Getting Started

### Prerequisites

Ensure you have Node.js (v18 or higher) and npm (or pnpm/yarn) installed.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ashmitsahu1812/Prompt_Forge.git
    cd Prompt_Forge
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    Create a `.env` file with your `HF_TOKEN` and other optional secrets.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the Prompt Forge studio.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR for new plugins, templates, or features. 

## 📝 License

This project is open-source and available for personal and educational use.
