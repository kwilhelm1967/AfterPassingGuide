/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LICENSE_SERVER_URL?: string;
  readonly DEV?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

