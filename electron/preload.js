/**
 * Electron Preload Script
 * Local Aftercare Vault
 * 
 * Exposes safe APIs to the renderer process.
 */

const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getDeviceId: () => ipcRenderer.invoke('get-device-id'),
  
  // Platform info
  platform: process.platform,
  
  // External links - safely expose shell.openExternal
  // Only allows user-initiated external links (no automatic network calls)
  openExternal: (url) => {
    // Strict validation: only allow https/http URLs, no data: or javascript: schemes
    if (typeof url === 'string' && 
        (url.startsWith('https://') || url.startsWith('http://')) &&
        !url.includes('javascript:') &&
        !url.includes('data:') &&
        url.length < 2048) { // Prevent extremely long URLs
      shell.openExternal(url);
    } else {
      console.warn('Blocked invalid external URL:', url);
    }
  },
});



