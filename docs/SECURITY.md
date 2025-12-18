# Security Documentation

## Data Encryption

### All User Data is Encrypted

All sensitive user data stored in localStorage is encrypted using **AES-GCM 256-bit encryption** before storage.

**Encrypted Data:**
- User profile (name, relationship, location, etc.)
- Task plans and task data
- Uploaded documents metadata
- Contact entries
- Executor checklist items
- Settings and preferences

**Not Encrypted (Non-Sensitive):**
- License information (needed for offline validation)
- Trial status (non-sensitive metadata)
- UI state flags

### Encryption Implementation

- **Algorithm**: AES-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: 16-byte random salt per encryption
- **IV**: 12-byte random initialization vector per encryption
- **Key Source**: Device fingerprint (hardware-based, unique per device)

### Encryption Flow

1. Data is serialized to JSON
2. Device fingerprint is retrieved (cached after first call)
3. Random salt and IV are generated
4. Encryption key is derived from device fingerprint + salt using PBKDF2
5. Data is encrypted using AES-GCM
6. Salt, IV, and encrypted data are combined and base64-encoded
7. Encrypted string is stored in localStorage

### Decryption Flow

1. Encrypted data is retrieved from localStorage
2. Data is checked if it's encrypted (legacy plaintext support for migration)
3. Base64 data is decoded
4. Salt, IV, and encrypted data are extracted
5. Encryption key is derived from device fingerprint + salt
6. Data is decrypted using AES-GCM
7. JSON is parsed and returned

### Security Properties

- **Device-Bound**: Data can only be decrypted on the same device (device fingerprint required)
- **Unique Per Encryption**: Each encryption uses a unique salt and IV
- **No Key Storage**: Encryption key is derived on-the-fly, never stored
- **Forward Secrecy**: Even if one encryption is compromised, others remain secure
- **Authenticated Encryption**: AES-GCM provides both confidentiality and authenticity

## Network Security

### Zero Data Transmission

**After license activation, the application makes ZERO network calls.**

The only network call in the entire application is:
- **License Activation**: One-time call to license server during activation
  - Endpoint: `https://server.localpasswordvault.com/api/aftercare/license/activate`
  - Method: POST
  - Data Sent: License key, device ID, product identifier
  - Data Received: Activation status, device binding confirmation
  - **No user data is transmitted**

### Network Call Audit

**Verified Network Calls:**
1. `src/services/licenseService.ts` - Line 274: License activation (one-time)
2. `src/services/licenseService.ts` - Line 376: License transfer (one-time, user-initiated)

**No Other Network Calls:**
- ❌ No analytics
- ❌ No telemetry
- ❌ No error reporting to external services
- ❌ No data synchronization
- ❌ No cloud backup
- ❌ No external API calls
- ❌ No font loading from external sources
- ❌ No CDN resources

### External Link Safety

The Electron preload script (`electron/preload.js`) provides safe external link handling:
- Only allows user-initiated external links
- Validates URL format (https/http only)
- Blocks javascript: and data: schemes
- Length limits to prevent abuse

## Data Storage

### LocalStorage Only

All data is stored in browser localStorage:
- **Location**: Browser's localStorage (Electron app data directory)
- **Persistence**: Survives app restarts
- **Scope**: Per-installation (not synced across devices)
- **Encryption**: All user data encrypted before storage

### Storage Keys

All storage keys are prefixed with `aftercare_*`:
- `aftercare_profile` - Encrypted user profile
- `aftercare_plan` - Encrypted task plan
- `aftercare_documents` - Encrypted documents metadata
- `aftercare_contacts` - Encrypted contact entries
- `aftercare_checklist` - Encrypted executor checklist
- `aftercare_settings` - Encrypted settings
- `aftercare_license_file` - Unencrypted license file (non-sensitive)
- `aftercare_license_key` - Unencrypted license key (non-sensitive)
- `aftercare_trial_status` - Unencrypted trial metadata (non-sensitive)

## Privacy Guarantees

### What We Don't Do

- ❌ **No Analytics**: Zero tracking, zero telemetry
- ❌ **No Data Collection**: No user behavior tracking
- ❌ **No Cloud Sync**: Data never leaves the device
- ❌ **No External Services**: No third-party integrations
- ❌ **No Network Monitoring**: No network activity after activation
- ❌ **No User Identification**: Device fingerprint is for encryption only, not tracking

### What We Do

- ✅ **100% Local**: All data stored on device
- ✅ **Encrypted Storage**: All sensitive data encrypted
- ✅ **Device-Bound**: Data tied to device for security
- ✅ **Offline-First**: Works completely offline after activation
- ✅ **No External Dependencies**: System fonts, no external resources

## Security Best Practices

### For Developers

1. **Never add network calls** except for license activation
2. **Always use encryption** for user data via `storageService`
3. **Never log sensitive data** to console in production
4. **Validate all inputs** before processing
5. **Use type-safe code** (TypeScript strict mode)

### For Users

1. **Keep device secure**: Encryption key is device-bound
2. **Backup data**: Export data if needed (future feature)
3. **Clear data**: Use "Reset Data" in Settings when done
4. **Shared computers**: Clear data after use

## Threat Model

### Protected Against

- ✅ **Data Theft**: Encrypted storage prevents plaintext access
- ✅ **Device Loss**: Data encrypted, requires device fingerprint
- ✅ **Malware**: No network calls = no data exfiltration
- ✅ **Cloud Breaches**: No cloud storage = no cloud breaches
- ✅ **Third-Party Tracking**: No analytics or telemetry

### Not Protected Against

- ⚠️ **Physical Access**: If device is unlocked, data is accessible
- ⚠️ **Malware on Device**: Keyloggers, screen capture, etc.
- ⚠️ **Device Theft**: If device is unlocked, data accessible
- ⚠️ **OS-Level Attacks**: System-level malware could access memory

## Compliance

### Data Protection

- **GDPR**: No data leaves device, no processing agreements needed
- **HIPAA**: No PHI transmission, but users should consult professionals
- **CCPA**: No data collection, no sale of data

### Legal Disclaimer

This application provides administrative guidance only. It does not provide legal, financial, or medical advice. Users should consult appropriate professionals for legal, financial, or medical matters.

