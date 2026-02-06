# Architecture Documentation

## Overview

AfterPassing Guide is a React-based desktop application built with Electron, providing administrative guidance for families handling paperwork after a death. The application is designed to be fully local (no cloud dependencies) and can run in two modes: standalone or embedded within Local Legacy Vault.

## Technology Stack

- **Frontend Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.0
- **Desktop Runtime**: Electron 27.0
- **Styling**: Tailwind CSS 3.3
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Storage**: Browser localStorage (fully local, no cloud)

## Application Modes

### Standalone Mode
- Independent desktop application
- Own license activation system (license only; no trial)
- Device-bound licensing
- No external dependencies after activation

### Embedded Mode (Add-on)
- Runs inside Local Legacy Vault
- Reads data directly from LLV vault
- Uses LLV's licensing system
- Shares data context with LLV

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared components (DisclaimerBanner)
│   ├── documents/      # Document management view
│   ├── executor/       # Executor tools (checklist, contacts)
│   ├── license/        # License activation
│   ├── onboarding/     # First-run wizard
│   ├── scripts/        # Script templates view
│   ├── settings/       # Settings/profile management
│   └── tasks/          # Task views (Focus, Checklist)
├── services/           # Business logic layer
│   ├── executorService.ts      # Executor checklist & contacts
│   ├── exportService.ts         # PDF/text export generation
│   ├── licenseService.ts        # License activation & validation
│   ├── llvIntegration.ts        # LLV data access layer
│   ├── scriptTemplates.ts       # Phone/letter/email templates
│   ├── storageService.ts        # Local storage abstraction
│   ├── taskGenerationEngine.ts  # Core task generation logic
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── deviceFingerprint.ts     # Device ID generation
├── App.tsx             # Main application component
├── main.tsx            # React entry point
└── vite-env.d.ts       # Vite environment types
```

## Core Architecture Patterns

### Service Layer Pattern
All business logic is encapsulated in service classes/modules:
- **Singleton Services**: `licenseService`, `storageService`
- **Stateless Services**: `taskGenerationEngine`, `executorService`, `exportService`
- **Integration Layer**: `llvIntegration` handles mode switching

### Component Architecture
- **Container Components**: `App.tsx` manages global state and routing
- **View Components**: Each tab has a dedicated view component
- **Presentational Components**: Reusable UI components in `common/`

### Data Flow
1. **Initialization**: `App.tsx` loads data from `storageService`
2. **User Interaction**: Components call services to update data
3. **Persistence**: Services use `storageService` to save to localStorage
4. **State Updates**: React state updates trigger re-renders

## Key Services

### StorageService
- **Purpose**: Abstraction layer for localStorage
- **Pattern**: Singleton
- **Methods**: Save/load for profile, plan, documents, contacts, checklist
- **Storage Keys**: Prefixed with `aftercare_*`

### LicenseService
- **Purpose**: License activation, validation, device binding
- **Pattern**: Singleton
- **Features**:
  - License validation (16-char format)
  - Device fingerprint binding
  - Offline validation (local license file)
  - License transfer support

### TaskGenerationEngine
- **Purpose**: Generate personalized task plans
- **Pattern**: Stateless functions
- **Input**: Profile, LLV records (optional)
- **Output**: AftercarePlan with tasks organized by phase
- **Phases**: FIRST_48_HOURS, WEEK_1, WEEKS_2_6, DAYS_60_90, LONG_TERM

### LLVIntegration
- **Purpose**: Bridge to Local Legacy Vault
- **Pattern**: Singleton with mode detection
- **Modes**: 
  - `STANDALONE`: Mock data, manual entry
  - `EMBEDDED`: Read from LLV storage
- **Features**: Vault summary loading, add-on state management

## State Management

### Global State (App.tsx)
- Profile, Plan, Documents, Contacts, Checklist
- Navigation state (active tab)
- License status
- Loading states

### Local State (Components)
- Form inputs
- UI interactions (expanded/collapsed)
- Temporary UI state

### Persistent State (localStorage)
- All user data (profile, plan, documents, etc.)
- License information
- Trial status
- User preferences

## Data Models

### AftercareProfile
User profile with role, relationship, location, optional details.

### AftercarePlan
Complete task plan with:
- Profile reference
- Tasks array (organized by phase)
- Metadata (created/updated dates)

### AftercareTask
Individual task with:
- Phase, category, status
- Title, description, reason
- Related vault record IDs
- Completion tracking

### ExecutorChecklistItem
Executor-specific checklist items with categories and status.

### ContactEntry
Contact information with type classification and status.

## Security & Privacy

### Data Storage
- **100% Local**: All data stored in browser localStorage
- **No Cloud**: Zero network calls after initial license activation
- **Device-Bound**: License tied to device fingerprint

### License Security
- Device fingerprinting (hardware-based)
- Local license file validation
- Offline-first validation
- No license transmission after activation

### Privacy
- No analytics
- No telemetry
- No external API calls (except license activation)
- System fonts only (no external font loading)

## Build & Deployment

### Development
- `npm run dev`: Vite dev server (port 5174)
- `npm run electron:dev`: Electron with hot reload

### Production
- `npm run build`: TypeScript compilation + Vite build
- `npm run electron:build`: Electron builder (creates installers)

### Output
- `dist/`: Web assets (HTML, JS, CSS)
- Electron installers (DMG, NSIS, AppImage, etc.)

## Environment Variables

- `VITE_LICENSE_SERVER_URL`: License server endpoint (default: https://server.localpasswordvault.com)
- `DEV`: Development mode flag (Vite auto-detected)

## Type Safety

- **Strict TypeScript**: All code is fully typed
- **No `any` types**: Strict mode enforced
- **Interface-driven**: All data structures have TypeScript interfaces
- **Type exports**: All types exported from `src/types/index.ts`

## Error Handling

- **Service Errors**: Caught and logged, user-friendly messages
- **Storage Errors**: Graceful fallbacks, data validation
- **License Errors**: Clear error messages, retry mechanisms
- **No Error Boundaries**: Currently missing (see FUNCTIONALITY_GAPS.md)

## Performance Considerations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: useMemo/useCallback for expensive operations
- **Local Storage**: Efficient serialization/deserialization
- **No Network**: Zero latency after activation

## Future Architecture Considerations

See `FUNCTIONALITY_GAPS.md` for known issues:
- Error boundaries needed
- PDF generation (currently placeholder)
- Document summarization (currently mock)

