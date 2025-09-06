/// <reference types="vite/client" />

interface GitInfo {
  commitHash: string
  shortHash: string
  branch: string
  buildTime: string
}

declare const __GIT_INFO__: GitInfo
