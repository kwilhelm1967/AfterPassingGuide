/**
 * Device Fingerprint Utility for AfterPassing Guide
 * 
 * Generates a stable, hardware-based device identifier for license binding.
 * Matches the exact implementation from Local Password Vault.
 * 
 * Security Requirements:
 * - Must remain stable across app restarts
 * - Must remain stable across minor OS updates
 * - Must be different across physical machines
 * - Must NOT transmit any user data
 * 
 * Components used for fingerprint:
 * - OS platform and version
 * - Hardware concurrency (CPU cores)
 * - Screen resolution and color depth
 * - Timezone
 * - WebGL renderer (GPU info)
 * - System language
 * 
 * The final device_id is a SHA-256 hash of these combined components.
 */

/**
 * Generate a stable device fingerprint using available system characteristics.
 * This creates a unique identifier per physical device without collecting personal data.
 * 
 * @returns Promise<string> - SHA-256 hex hash of device characteristics
 */
export async function getDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // Operating system and platform
  components.push(navigator.platform || 'unknown-platform');
  
  // Hardware concurrency (CPU cores) - stable per machine
  components.push(String(navigator.hardwareConcurrency || 0));
  
  // Screen characteristics - stable per machine
  components.push(`${screen.width}x${screen.height}`);
  components.push(String(screen.colorDepth || 0));
  components.push(String(screen.pixelDepth || 0));
  
  // Timezone - generally stable
  try {
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown-tz');
  } catch {
    components.push('unknown-tz');
  }
  
  // System language
  components.push(navigator.language || 'unknown-lang');
  
  // WebGL renderer info (GPU) - very stable per machine
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown-vendor';
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown-renderer';
        components.push(vendor);
        components.push(renderer);
      }
      components.push(gl.getParameter(gl.VERSION) || 'unknown-gl-version');
      components.push(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || 'unknown-glsl');
    }
  } catch {
    components.push('webgl-unavailable');
  }
  
  // User agent (partial - only OS-related parts for stability)
  const ua = navigator.userAgent;
  // Extract OS info from user agent (more stable than full UA)
  const osMatch = ua.match(/\(([^)]+)\)/);
  if (osMatch) {
    components.push(osMatch[1].split(';')[0].trim());
  }
  
  // Device memory (if available) - stable per machine
  if ('deviceMemory' in navigator) {
    components.push(String((navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0));
  }
  
  // Max touch points - stable per machine
  components.push(String(navigator.maxTouchPoints || 0));

  // Combine all components
  const fingerprint = components.join('|');
  
  // Hash with SHA-256 for privacy and consistency
  const hash = await sha256(fingerprint);
  
  return hash;
}

/**
 * SHA-256 hash using Web Crypto API
 */
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Validate that a device ID looks valid (64 character hex string)
 */
export function isValidDeviceId(deviceId: string): boolean {
  return /^[a-f0-9]{64}$/i.test(deviceId);
}

