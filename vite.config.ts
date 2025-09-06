import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// Build metadata injection that works on Netlify and locally
const getGitInfo = () => {
  try {
    // Prefer Netlify-provided environment variables when present
    const isNetlify = !!process.env.NETLIFY
    if (isNetlify) {
      const commitHash = process.env.COMMIT_REF || 'unknown'
      const shortHash = commitHash !== 'unknown' ? commitHash.slice(0, 7) : 'unknown'
      const branch = process.env.BRANCH || process.env.HEAD || 'unknown'
      const buildTime = new Date().toISOString()

      return {
        commitHash,
        shortHash,
        branch,
        buildTime,
        // extra helpful fields (optional consumers)
        context: process.env.CONTEXT,
        deployId: process.env.DEPLOY_ID,
        siteName: process.env.SITE_NAME,
        url: process.env.URL,
        deployUrl: process.env.DEPLOY_URL,
        deployPrimeUrl: process.env.DEPLOY_PRIME_URL,
        appVersion: process.env.npm_package_version,
      }
    }

    // Local fallback: use git
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    const buildTime = new Date().toISOString()

    return {
      commitHash,
      shortHash,
      branch,
      buildTime,
      appVersion: process.env.npm_package_version,
    }
  } catch {
    // Final fallback
    return {
      commitHash: 'unknown',
      shortHash: 'unknown',
      branch: 'unknown',
      buildTime: new Date().toISOString(),
      appVersion: process.env.npm_package_version,
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['5b11c0a1d81c.ngrok-free.app', 'localhost', '127.0.0.1'],
  },
  define: {
    __GIT_INFO__: JSON.stringify(getGitInfo()),
  },
})
