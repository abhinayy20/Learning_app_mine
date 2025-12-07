# Contributing to Learning Platform

Thank you for your interest in contributing! This project is designed to be a learning resource for DevOps practices.

## How to Contribute

### Reporting Issues

1. Check if the issue already exists
2. Use issue templates
3. Provide clear reproduction steps
4. Include environment details

### Suggesting Enhancements

1. Open a GitHub Discussion first
2. Describe the use case
3. Explain why it's beneficial for learning

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test locally with `docker-compose up`
5. Update documentation if needed
6. Commit with clear messages
7. Push and create a Pull Request

## Development Guidelines

### Code Style

- **Node.js/TypeScript**: Follow ESLint rules
- **Python**: Follow PEP 8, use Black formatter
- **Go**: Follow `gofmt` standards
- **Terraform**: Use `terraform fmt`

### Testing

- Write unit tests for business logic
- Ensure >80% code coverage
- Test Docker builds locally
- Validate Kubernetes manifests

### Commits

Use conventional commits:
```
feat: add user authentication endpoint
fix: resolve database connection timeout
docs: update getting started guide
chore: upgrade dependencies
```

### Documentation

- Update README.md when adding features
- Add inline comments for complex logic
- Create runbooks for new operational procedures
- Update architecture diagrams if structure changes

## Project Structure

```
LEARNING_PROJECT/
├── apps/               # Application code
├── infrastructure/     # Terraform IaC
├── kubernetes/         # K8s manifests & Helm charts
├── gitops/            # ArgoCD applications
├── ci-cd/             # Pipeline definitions
└── docs/              # Documentation
```

## Learning Resources

This project is educational. When contributing:
- Prioritize clarity over cleverness
- Add comments explaining "why", not just "what"
- Create labs/examples for new concepts
- Consider beginners when writing docs

## Questions?

- 💬 GitHub Discussions for general questions
- 🐛 GitHub Issues for bugs
- 📧 Email: devops@learningplatform.com

Thank you for helping others learn DevOps! 🚀
