# Contributing Guidelines

## Code of Conduct

- Be respectful and professional
- Focus on user experience and code quality
- Follow existing code patterns and conventions
- Write clear, maintainable code

## Development Process

### 1. Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

### 2. Development

1. Make your changes
2. Ensure TypeScript compiles: `npx tsc --noEmit`
3. Test your changes manually
4. Follow code style guidelines

### 3. Testing

Before submitting:
- [ ] TypeScript compiles without errors
- [ ] No linter errors
- [ ] Manual testing completed
- [ ] All existing functionality still works

### 4. Commit

1. Write clear commit messages
2. Use present tense: "Add feature" not "Added feature"
3. Be descriptive but concise
4. Reference issues if applicable

### 5. Submit

1. Push to your fork
2. Create a pull request
3. Describe your changes clearly
4. Reference any related issues

## Code Standards

### TypeScript

- **Strict Mode**: Always enabled
- **No `any` Types**: Use proper types or `unknown`
- **Type Safety**: All functions and variables must be typed
- **Interfaces**: Prefer interfaces over types for objects
- **Exports**: Export types from `src/types/index.ts`

### React

- **Functional Components**: Use function components, not classes
- **Hooks**: Use hooks for state and side effects
- **Props**: Define prop interfaces for all components
- **Naming**: PascalCase for components, camelCase for functions

### Code Style

- **Imports**: Group and order:
  1. React imports
  2. Type imports
  3. Service imports
  4. Component imports
  5. Utility imports
- **Formatting**: Use consistent indentation (2 spaces)
- **Comments**: JSDoc for public APIs, inline for complex logic
- **Naming**: 
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Types/Interfaces: PascalCase

### File Organization

- **One Component Per File**: Each component in its own file
- **Service Files**: One service per file
- **Types**: All types in `src/types/index.ts`
- **Utils**: Helper functions in `src/utils/`

## Content Guidelines

### Language & Tone

- **Supportive**: Use calm, supportive language
- **Non-Prescriptive**: Avoid "must" or "required"
- **Optional**: Use "you may wish to" or "many families choose to"
- **No Legal Advice**: Never interpret legal documents
- **No Financial Advice**: Never recommend asset distribution

### User Experience

- **No Urgency**: Avoid creating urgency or pressure
- **Respectful**: Acknowledge difficulty of situation
- **Clear**: Use simple, clear language
- **Helpful**: Provide actionable guidance

## Pull Request Process

### PR Requirements

1. **Clear Description**: Explain what and why
2. **Type Check**: Must pass `npx tsc --noEmit`
3. **No Breaking Changes**: Unless explicitly discussed
4. **Documentation**: Update docs if needed
5. **Testing**: Manual testing completed

### Review Process

- Maintainers will review within 48 hours
- Address feedback promptly
- Keep PR focused (one feature/fix per PR)
- Rebase on main before merging

## Areas for Contribution

### High Priority

- Error boundaries implementation
- PDF generation (jsPDF integration)
- Document summarization (real implementation)
- Trial expiration enforcement
- Unit tests

### Medium Priority

- Performance optimizations
- Accessibility improvements
- Additional script templates
- Export format improvements
- UI/UX enhancements

### Low Priority

- Code documentation
- Type improvements
- Refactoring
- Build optimizations

## Bug Reports

### Before Reporting

1. Check existing issues
2. Verify it's a bug, not a feature request
3. Test in latest version

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 11]
- Node: [e.g., 18.0.0]
- Version: [e.g., 1.0.0]

**Screenshots**
If applicable
```

## Feature Requests

### Before Requesting

1. Check existing issues
2. Consider if it aligns with project goals
3. Think about implementation complexity

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this needed?

**Proposed Solution**
How should it work?

**Alternatives**
Other approaches considered

**Additional Context**
Any other relevant information
```

## Questions

For questions:
1. Check existing documentation
2. Search closed issues
3. Open a discussion/question issue

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (Proprietary - Local Vault Software).

## Recognition

Contributors will be recognized in:
- Release notes
- Documentation (if significant contribution)
- Project credits

Thank you for contributing!

