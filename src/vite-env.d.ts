/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IKHOKHA_MERCHANT_ID: string
  readonly VITE_IKHOKHA_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}