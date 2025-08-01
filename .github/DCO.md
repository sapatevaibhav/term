# Developer Certificate of Origin (DCO)

## What is DCO?

The Developer Certificate of Origin (DCO) is a lightweight way for contributors to certify that they wrote or otherwise have the right to submit the code they are contributing to the project.

## How to Sign Off Your Commits

### For New Commits
Use the `-s` flag when committing:
```bash
git commit -s -m "your commit message"
```

### For Existing Commits

#### Single Commit
```bash
git commit --amend -s
```

#### Multiple Commits
```bash
# For the last n commits
git rebase --signoff HEAD~n

# For all commits in your branch
git rebase --signoff main
```

### Manual Sign-off
Add this line to your commit message:
```
Signed-off-by: Your Name <your.email@example.com>
```

## DCO Text

By making a contribution to this project, I certify that:

1. The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or

2. The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or

3. The contribution was provided directly to me by some other person who certified (1), (2) or (3) and I have not modified it.

4. I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.

## Troubleshooting

### Check if commits are signed
```bash
git log --show-signature
```

### Configure git for automatic sign-off
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Create an alias for signed commits
```bash
git config --global alias.cs 'commit -s'
```

Then use `git cs -m "message"` instead of `git commit -s -m "message"`.

## Why DCO?

- **Legal Protection**: Provides legal protection for both contributors and maintainers
- **Simple Process**: Lightweight alternative to Contributor License Agreements (CLAs)
- **Transparency**: Creates a clear audit trail of contributions
- **Industry Standard**: Used by major projects like Linux kernel, Docker, and many CNCF projects
