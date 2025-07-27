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
