# AfterPassing Guide

Administrative guidance tool for families handling paperwork and notifications after a death.

## ⚠️ Important Disclaimer

**This application provides administrative guidance only. It does not provide legal, financial, or medical advice.**

For legal, financial, or tax matters, please consult appropriate professionals.

## Features

**Note**: This is a single-product application. All features are included - no tiers.

- **Personalized Task Plan**: Tasks organized by timeline (First 48 Hours → Long Term)
- **Progress Tracking**: Track completion status for each task
- **Document Management**: Upload and organize important documents
- **Script Templates**: Phone scripts, letters, and email templates
- **Executor Tools**: Comprehensive checklist and contact workbook
- **Export**: Text-based export (PDF generation in progress)
- **14-Day Trial**: Free trial with device binding
- **Fully Local**: All data stored locally, no cloud dependencies

## Running Modes

### Standalone
Run as an independent desktop application with its own license.

### Embedded (Add-on)
Run inside Local Legacy Vault as a paid add-on, reading data directly from the vault.

## Development

### Prerequisites
- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher (or pnpm)
- **Git**: For version control

### Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5174)
npm run dev

# Run with Electron (desktop app)
npm run electron:dev

# Build for production
npm run electron:build
```

### Developer Documentation

Comprehensive developer documentation is available in the `docs/` directory:

- **[Architecture Guide](docs/ARCHITECTURE.md)**: System architecture, patterns, and design decisions
- **[Development Guide](docs/DEVELOPMENT.md)**: Setup, workflow, debugging, and best practices
- **[API Documentation](docs/API.md)**: Complete service API reference
- **[Contributing Guide](docs/CONTRIBUTING.md)**: How to contribute

### Type Checking

```bash
# Check TypeScript types without building
npx tsc --noEmit
```

### Linting

```bash
# Run linter
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── common/         # Shared components
│   ├── documents/      # Document management
│   ├── executor/       # Executor tools
│   ├── onboarding/     # First-run wizard
│   ├── scripts/        # Script templates
│   ├── settings/       # Settings view
│   └── tasks/          # Task list and overview
├── services/
│   ├── executorService.ts    # Executor checklist & contacts
│   ├── llvIntegration.ts     # LLV data access layer
│   ├── scriptTemplates.ts    # Phone/letter templates
│   ├── storageService.ts     # Local storage
│   └── taskGenerationEngine.ts # Core task generation
├── types/
│   └── index.ts        # TypeScript definitions
├── App.tsx             # Main application
└── main.tsx            # Entry point
```

## Content Guidelines

All generated content follows these rules:
- Never uses "must" or "required by law"
- Uses "many families choose to" or "you may wish to"
- Does not interpret wills, trusts, or legal directions
- Does not recommend how assets should be distributed
- Provides administrative organization, not legal counsel

## License

Proprietary - Local Vault Software



