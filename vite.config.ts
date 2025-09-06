import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get git commit info at build time
const getGitInfo = () => {
  try {
    // Use dynamic import to avoid TypeScript issues
    const { execSync } = require('child_process')
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    const buildTime = new Date().toISOString()
    
    return {
      commitHash,
      shortHash,
      branch,
      buildTime
    }
  } catch (error) {
    // Could not get git info - fallback to unknown values
    return {
      commitHash: 'unknown',
      shortHash: 'unknown',
      branch: 'unknown',
      buildTime: new Date().toISOString()
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __GIT_INFO__: JSON.stringify(getGitInfo()),
  },
})
