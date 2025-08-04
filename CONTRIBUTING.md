# Contributing to Term

Thank you for your interest in contributing to Term! This guide will help you get started with the contribution process.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/term.git
   cd term
   ```
3. **Set up the development environment**:
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Rust (if not already installed)
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   
   # Install Tauri CLI
   cargo install tauri-cli
   ```
4. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style
- **Frontend**: Follow TypeScript best practices, use functional components with hooks
- **Backend**: Follow Rust conventions and use `cargo fmt` for formatting
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) format
- **DCO**: All commits must be signed off (see below)

### Testing
- Run tests before submitting: `npm test`
- Add tests for new features
- Ensure cross-platform compatibility

### Documentation
- Update README.md for significant changes
- Add JSDoc comments for new functions
- Update inline code comments

## ⚖️ Developer Certificate of Origin (DCO)

### What is DCO?
The Developer Certificate of Origin (DCO) is a lightweight way for contributors to certify that they have the right to submit their code under the project's license.

### Required Sign-off
**All commits must include a DCO sign-off.** This is enforced by our CI/CD pipeline.

### How to Sign Off Commits

#### New Commits
```bash
git commit -s -m "feat: add new terminal command support"
```

#### Existing Commits
```bash
# For the last commit
git commit --amend -s

# For multiple commits (last 3 in this example)
git rebase --signoff HEAD~3

# For all commits in your branch (assuming you branched from main)
git rebase --signoff main
```

#### Manual Sign-off
Add this line to your commit message:
```
Signed-off-by: Your Name <your.email@example.com>
```

### Git Configuration
Set up your git identity:
```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```

Create an alias for signed commits:
```bash
git config --global alias.cs 'commit -s'
# Now you can use: git cs -m "your message"
```

## 🔄 Contribution Workflow

### 1. Create an Issue (Optional but Recommended)
- Check if an issue already exists
- For bugs: include reproduction steps, environment details
- For features: describe the use case and proposed solution

### 2. Development Process
```bash
# Keep your fork updated
git remote add upstream https://github.com/zoxilsi/term.git
git fetch upstream
git checkout main
git merge upstream/main

# Create your feature branch
git checkout -b feature/amazing-feature

# Make your changes with signed commits
git add .
git commit -s -m "feat: add amazing feature"

# Run tests
npm test
npm run lint
npm run build

# Push to your fork
git push origin feature/amazing-feature
```

### 3. Submit a Pull Request
1. Go to GitHub and create a Pull Request
2. Fill out the PR template completely
3. Ensure all CI checks pass
4. Respond to review feedback promptly

## 🧪 Testing Your Changes

### Frontend Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Backend Tests
```bash
cd src-tauri
cargo test              # Run Rust tests
cargo test -- --nocapture  # Run with output
```

### Manual Testing
```bash
npm run tauri dev       # Start development server
```

## 🏷️ Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
Signed-off-by: Your Name <your.email@example.com>
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `perf`: Performance improvements
- `build`: Build system changes

### Examples
```bash
git commit -s -m "feat: add AI command autocompletion"
git commit -s -m "fix: resolve terminal output formatting issue"
git commit -s -m "docs: update installation instructions"
git commit -s -m "test: add unit tests for command processor"
```

## 🐛 Reporting Issues

### Bug Reports
Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots/logs if applicable

### Feature Requests
Include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Additional context

## 📞 Getting Help

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and general discussion
- **Code Review**: Maintainers will review PRs and provide feedback

## 🎯 Areas for Contribution

- 🐛 **Bug Fixes**: Check the issues labeled `bug`
- ✨ **Features**: Check issues labeled `enhancement` or `feature`
- 📚 **Documentation**: Improve README, code comments, or add examples
- 🧪 **Testing**: Increase test coverage or add integration tests
- 🎨 **UI/UX**: Improve the terminal interface and user experience
- ⚡ **Performance**: Optimize command execution or UI responsiveness

## ⚠️ Important Notes

1. **DCO Compliance**: Non-compliant PRs will be automatically rejected
2. **Code Review**: All changes require review before merging
3. **Breaking Changes**: Must be discussed in an issue first
4. **Backwards Compatibility**: Maintain compatibility when possible
5. **Cross-Platform**: Test on different operating systems when relevant

## 🙏 Thank You

Your contributions help make Term better for everyone. We appreciate your time and effort in improving this project!

---

For more details about DCO, see [.github/DCO.md](.github/DCO.md).
=======
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