# Development Guide

## Getting Started

### Prerequisites
- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher (or pnpm)
- **Git**: For version control

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd LegacyAftercareAssistant

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5174`

### Electron Development

```bash
# Run with Electron (desktop app)
npm run electron:dev
```

This starts both the Vite dev server and Electron, with hot reload enabled.

## Development Workflow

### Code Structure

1. **Components**: React components in `src/components/`
2. **Services**: Business logic in `src/services/`
3. **Types**: TypeScript definitions in `src/types/`
4. **Utils**: Helper functions in `src/utils/`

### Adding a New Feature

1. **Define Types**: Add interfaces to `src/types/index.ts`
2. **Create Service**: Add business logic to appropriate service file
3. **Build Component**: Create React component in appropriate folder
4. **Wire Up**: Integrate into `App.tsx` or parent component
5. **Add Storage**: Update `storageService.ts` if persistence needed

### Code Style

- **TypeScript**: Strict mode enabled, no `any` types
- **React**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Imports**: Grouped (React, types, services, components)
- **Comments**: JSDoc for public APIs

### TypeScript Configuration

- **Strict Mode**: Enabled
- **No Unused Locals/Parameters**: Enforced
- **No Implicit Any**: Enforced
- **Target**: ES2020
- **Module**: ESNext

### Linting

```bash
npm run lint
```

Currently uses TypeScript compiler for type checking. ESLint can be added if needed.

## Testing

### Manual Testing Checklist

1. **License Activation**: Test trial and full license activation
2. **Data Persistence**: Verify all data saves/loads correctly
3. **Mode Switching**: Test standalone vs embedded modes
4. **Export**: Test text export functionality
5. **Navigation**: Test all tabs and views

### Type Checking

```bash
# Type check without building
npx tsc --noEmit
```

This should pass with zero errors before committing.

## Building

### Development Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

### Production Build

```bash
npm run electron:build
```

Creates platform-specific installers:
- **Windows**: NSIS installer + portable
- **macOS**: DMG + ZIP
- **Linux**: AppImage + DEB

## Debugging

### Browser DevTools

When running `npm run dev`, use browser DevTools:
- React DevTools extension recommended
- Network tab (should show no requests after activation)
- Console for errors/warnings

### Electron DevTools

When running `npm run electron:dev`:
- DevTools automatically open
- Same debugging capabilities as browser
- Access to Electron APIs in console

### Common Issues

1. **Port Already in Use**: Change port in `vite.config.ts`
2. **Type Errors**: Run `npx tsc --noEmit` to see all errors
3. **Storage Issues**: Clear localStorage in DevTools
4. **License Issues**: Check `licenseService.ts` logs

## Git Workflow

### Branch Naming
- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation updates
- `refactor/description`: Code refactoring

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Reference issues if applicable

### Before Committing

1. **Type Check**: `npx tsc --noEmit` passes
2. **Lint**: `npm run lint` passes
3. **Test**: Manual testing completed
4. **Build**: `npm run build` succeeds

## Environment Setup

### Vite Configuration

Located in `vite.config.ts`:
- Port: 5174
- Base path: `./` (relative for Electron)
- React plugin configured
- Source maps: Disabled in production

### Electron Configuration

Located in `electron/main.js`:
- Window size: 1200x800
- DevTools: Enabled in development
- Security: Context isolation enabled

### TypeScript Configuration

Located in `tsconfig.json`:
- Strict mode enabled
- React JSX transform
- ES2020 target
- Module resolution: bundler

## Dependencies

### Production Dependencies
- `react`, `react-dom`: UI framework
- `lucide-react`: Icons
- `jspdf`: PDF generation (currently placeholder)
- `uuid`: ID generation

### Development Dependencies
- `typescript`: Type checking
- `vite`: Build tool
- `electron`: Desktop runtime
- `tailwindcss`: Styling
- `@vitejs/plugin-react`: React support

### Adding Dependencies

```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name
```

## Styling

### Tailwind CSS

- Configuration: `tailwind.config.js`
- Custom colors: `accent-gold`, `vault-dark`, etc.
- Custom utilities: Card shadows, borders

### CSS Variables

Defined in `src/index.css`:
- Color system (matches LLV)
- Border radius
- Spacing

### Component Styling

- Use Tailwind utility classes
- Custom classes in `index.css` for complex patterns
- Inline styles only for dynamic values

## Data Storage

### localStorage Keys

All keys prefixed with `aftercare_*`:
- `aftercare_profile`: User profile
- `aftercare_plan`: Task plan
- `aftercare_documents`: Uploaded documents
- `aftercare_contacts`: Contact entries
- `aftercare_checklist`: Executor checklist
- `aftercare_license_file`: License data
- `aftercare_license_key`: License
- `aftercare_license_activated`: Activation date
- `aftercare_device_id`: Device fingerprint
- `aftercare_trial_status`: Trial information

### Storage Service

Use `storageService` for all data operations:
- Never access localStorage directly
- Service handles serialization/deserialization
- Service provides type safety

## License System

### Development License

For development, you can:
1. Use trial mode (14 days)
2. Use test licenses (if available)
3. Bypass license check (modify `licenseService.ts`)

### License Flow

1. User enters license
2. `licenseService.activateLicense()` called
3. Server validation (one-time)
4. Local license file created
5. Device binding established
6. Future validation is 100% local

## Common Tasks

### Adding a New View

1. Create component in `src/components/`
2. Add route in `App.tsx` navigation
3. Add icon to `NAV_ITEMS`
4. Implement view component
5. Add storage if needed

### Adding a New Service

1. Create file in `src/services/`
2. Export functions or class
3. Add types if needed
4. Import and use in components

### Modifying Task Generation

1. Edit `src/services/taskGenerationEngine.ts`
2. Modify task templates
3. Update phase logic if needed
4. Test with various profiles

### Adding Script Templates

1. Edit `src/services/scriptTemplates.ts`
2. Add new template object
3. Include placeholders
4. Test rendering in ScriptsView

## Performance Tips

1. **Memoization**: Use `useMemo` for expensive calculations
2. **Callbacks**: Use `useCallback` for event handlers passed to children
3. **Lazy Loading**: Consider code splitting for large components
4. **Storage**: Batch localStorage writes when possible

## Security Considerations

1. **No External Calls**: Except license activation
2. **Input Validation**: Validate all user inputs
3. **XSS Prevention**: React handles this, but be careful with `dangerouslySetInnerHTML`
4. **License Security**: Device binding prevents key sharing

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all imports are correct
- Check for circular dependencies

### Electron Won't Start
- Verify Node.js version (18+)
- Check `electron/main.js` for errors
- Verify Vite dev server is running

### Data Not Persisting
- Check browser localStorage in DevTools
- Verify `storageService` is being used
- Check for JSON serialization errors

### License Issues
- Clear license data from localStorage
- Check device fingerprint generation
- Verify license server connectivity (dev mode)

