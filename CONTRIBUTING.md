# 👋 Welcome to the `term` Project – Contributing Guide

[![Contributing](https://img.shields.io/badge/Contribute-Guidelines-blue.svg)](./CONTRIBUTING.md)


Thank you for showing interest in contributing to `term` – an AI-powered, cross-platform terminal assistant built with **Tauri**, **React**, **Rust**, and **TypeScript**. Your contributions help improve the tool and make it more robust and accessible for the developer community. 🌍💻

---

## 🚀 Project Overview

`term` provides a minimal terminal-like interface enhanced with AI features. It supports:
- Shell command execution
- Natural language queries
- Secure API key management
- Autocompletion
- Cross-platform support (Linux, Windows, macOS)

For a full overview, see the [README.md](./README.md)

---

## 🧑‍💻 How Can You Contribute?

You can contribute in multiple ways:
- 🐛 Report or fix bugs
- 🧩 Suggest or implement new features
- 🧪 Add tests
- 📝 Improve documentation
- 🌐 Optimize accessibility and cross-platform behavior

---

## 🧰 Development Setup

### ✅ Prerequisites

Make sure these are installed:

| Tool         | Usage                        |
|--------------|------------------------------|
| Node.js ≥ v18 | Frontend build system        |
| pnpm (preferred) or npm | Dependency management |
| Rust         | Backend (Tauri CLI & commands) |
| Tauri CLI    | Desktop application interface |
| Git          | Version control              |

### 🧪 OS-specific Dependencies

#### 🐧 Ubuntu/Debian:
```bash
sudo apt update
sudo apt install build-essential libwebkit2gtk-4.1-dev librsvg2-dev
```

#### 🪟 Windows:
- Install [Rust via rustup](https://rustup.rs/)
- Install Node.js
- Install Visual Studio Build Tools (with C++ workload)
- Follow [Tauri Windows prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

---

## ⚙️ Setup Steps

```bash
# 1. Fork the repo
git clone https://github.com/<your-username>/term.git
cd term

# 2. Install dependencies
pnpm install  # or npm install

# 3. Install Rust and Tauri CLI
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install create-tauri-app tauri-cli

# 4. Run the project
npx tauri dev  # or npm run tauri dev
```

---

## 🔐 API Key Management

When the app launches for the first time, you’ll be prompted to enter your OpenAI API key.

### 🔑 Manual Commands
- **Set API key**:  
  ```bash
  setapikey sk-xxxx
  ```
- **Reset API key**:  
  ```bash
  resetapikey
  ```

Stored securely in a `.term/` folder at the project root.

---

## 📁 Project Structure

```bash
term/
├── src/            # React frontend (UI, logic, hooks)
├── src-tauri/      # Rust backend (commands, API key logic)
├── public/         # Static assets
├── __tests__/      # Unit and integration tests
├── .github/        # GitHub workflows & issue templates
├── .husky/         # Pre-commit hooks
├── package.json    # Scripts & dependencies
├── tailwind.config.js
└── vite.config.ts
```

---

## ✍️ Git & Branching Workflow

### 🪢 Create a Branch
Use a descriptive name:
```bash
git checkout -b feat/<feature-name>
```

Examples:
- `feat/command-history`
- `fix/macos-crash`
- `docs/update-readme`

---

### ✅ Commit Message Guidelines (Conventional Commits)

| Type    | Description                            |
|---------|----------------------------------------|
| feat    | New feature                            |
| fix     | Bug fix                                |
| docs    | Documentation only changes             |
| style   | Formatting, missing semicolons, etc.   |
| refactor| Code refactor without behavior change  |
| test    | Adding or updating tests               |
| chore   | Misc tasks (configs, deps)             |

Example:
```
feat: add autocomplete for shell commands
```

---

## 🧪 Linting, Formatting, and Testing

### ✅ Code Formatting
Before committing:
```bash
pnpm format
```

### ✅ Linting
```bash
pnpm lint
```

### 🧪 Run Tests
```bash
pnpm test
```

Make sure all tests pass before opening a PR.

---

## 🧵 Pull Request Process

1. Push your branch:
   ```bash
   git push origin feat/your-feature-name
   ```

2. Go to your fork on GitHub → Click **“Compare & Pull Request”**

3. Fill in the PR template:
   - Title: `feat: improve key management UX`
   - Description: What, why, how
   - Link related issues (e.g., `Closes #30`)
   - Add screenshots if visual

4. Submit for review.

---

## 🤝 Code Review Expectations

Your PR will be reviewed for:
- Clarity of changes
- Coding standards (TS/React/Rust)
- Proper commit style
- Manual verification & working locally

Be open to suggestions and iterate based on feedback. 😄

---

## 📦 Before You Push

- ✅ Tested locally (`npx tauri dev`)
- ✅ Linting and formatting passed
- ✅ Commit messages follow convention
- ✅ PR links to relevant issue

---

## 🧑‍⚖️ Code of Conduct

We follow a standard [Code of Conduct](./CODE_OF_CONDUCT.md). Please be respectful, inclusive, and professional in all discussions and contributions.

---

## 💡 Tips for GSSoC Contributors

- Check issues labeled `good first issue`, `level1`, or `documentation`
- Ask for assignment before starting
- Engage respectfully with maintainers
- Link your Discord or GitHub profile in the PR (if allowed)

---

## 📬 Need Help?

- Open a GitHub Discussion or Issue
- Tag maintainers or project leads
- Reach out via GSSoC channels

---

## 🙏 Thank You for Contributing!

Your input makes a big difference. We're excited to build this with you. Happy coding! 🚀
