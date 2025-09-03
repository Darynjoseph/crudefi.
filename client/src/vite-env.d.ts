/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add more keys if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
