# Code Organization

This document describes the codebase organization and structure.

## Directory Structure

```
src/
├── components/          # React components organized by feature
│   ├── common/         # Shared/reusable components
│   ├── documents/      # Document management
│   ├── executor/       # Executor tools
│   ├── license/        # License activation & trial
│   ├── onboarding/     # First-run wizard
│   ├── scripts/        # Script templates
│   ├── settings/       # Settings/profile
│   └── tasks/          # Task views
│   └── index.ts        # Barrel export for all components
├── constants/          # Application constants
│   ├── navigation.tsx  # Navigation configuration
│   └── documentTypes.ts # Document type definitions
├── services/           # Business logic layer
│   ├── executorService.ts
│   ├── exportService.ts
│   ├── licenseService.ts
│   ├── llvIntegration.ts
│   ├── scriptTemplates.ts
│   ├── storageService.ts
│   ├── taskGenerationEngine.ts
│   ├── trialService.ts
│   └── index.ts        # Barrel export for all services
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── utils/              # Utility functions
│   ├── deviceFingerprint.ts
│   ├── formatting.ts
│   └── index.ts        # Barrel export for all utilities
├── App.tsx             # Main application component
├── main.tsx            # React entry point
└── vite-env.d.ts       # Vite environment types
```

## Organization Principles

### 1. Feature-Based Component Organization
Components are organized by feature/domain, not by type. This makes it easier to find related code.

### 2. Barrel Exports
Index files (`index.ts`) provide clean imports:
- `src/components/index.ts` - All component exports
- `src/services/index.ts` - All service exports
- `src/utils/index.ts` - All utility exports

### 3. Constants Extraction
Application constants are extracted to dedicated files:
- Navigation configuration
- Document types
- Future: Other constants as needed

### 4. Utility Functions
Common utility functions are centralized:
- Formatting utilities (dates, text, file sizes)
- Device fingerprinting
- Future: Validation, parsing, etc.

### 5. Type Safety
- All types in `src/types/index.ts`
- Use `type` imports for type-only imports
- Strict TypeScript configuration

### 6. Import Organization
Consistent import order:
1. React imports
2. Third-party library imports
3. Type imports (`import type`)
4. Constants
5. Services
6. Components
7. Utils
8. Relative imports

## Best Practices

### File Naming
- Components: PascalCase (e.g., `DocumentsView.tsx`)
- Services: camelCase (e.g., `storageService.ts`)
- Utils: camelCase (e.g., `formatting.ts`)
- Constants: camelCase (e.g., `navigation.tsx`)
- Types: PascalCase interfaces/types

### Code Organization Within Files
1. Imports (grouped and ordered)
2. Type/interface definitions
3. Constants
4. Component/function definitions
5. Exports

### Service Pattern
- Singleton services use `getInstance()` pattern
- Stateless services export functions directly
- All services are exported via barrel export

### Component Pattern
- Functional components with hooks
- Props interfaces defined at top
- Local state with `useState`
- Effects with `useEffect`
- Callbacks with `useCallback` when needed

## Future Improvements

- [ ] Split types by domain (profile, task, document, etc.)
- [ ] Add custom hooks for common patterns
- [ ] Create context providers if needed
- [ ] Add validation utilities
- [ ] Extract more constants as needed

