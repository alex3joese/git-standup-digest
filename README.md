# git-standup-digest

> Generates a readable daily standup summary from your recent git commits across repos

---

## Installation

```bash
npm install -g git-standup-digest
```

---

## Usage

Run from any directory to scan git repositories and generate a standup summary:

```bash
git-standup-digest
```

By default, it scans the current directory and its subdirectories for git repos and summarizes commits from the last 24 hours.

### Options

```bash
git-standup-digest --since "2 days ago"   # Look back further
git-standup-digest --path ~/projects      # Specify a root directory
git-standup-digest --author "Jane Doe"    # Filter by author
git-standup-digest --format markdown      # Output as Markdown
```

### Example Output

```
📋 Standup Summary — Monday, June 10, 2025

🗂 my-api
  - Fixed authentication bug in login endpoint
  - Added rate limiting middleware

🗂 frontend-app
  - Refactored dashboard component
  - Updated dependencies

🗂 infra-scripts
  - Wrote deploy script for staging environment
```

---

## Configuration

You can add a `.standuprc` file to your home directory:

```json
{
  "path": "~/projects",
  "author": "your-git-username",
  "since": "yesterday"
}
```

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss any major changes.

---

## License

[MIT](LICENSE)