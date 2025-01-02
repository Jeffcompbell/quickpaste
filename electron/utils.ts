import { readFileSync } from 'fs'
import { join } from 'path'

interface PackageJson {
  name: string
  version: string
  dependencies: Record<string, string>
}

export function loadPackageJson(): PackageJson {
  try {
    const pkgPath = join(__dirname, '../package.json')
    const fileContent = readFileSync(pkgPath, 'utf-8')
    const pkg = JSON.parse(fileContent)
    return {
      name: pkg.name || 'quickpaste',
      version: pkg.version || '0.0.0',
      dependencies: pkg.dependencies || {},
    }
  } catch (error) {
    console.error('Failed to load package.json:', error)
    return {
      name: 'quickpaste',
      version: '0.0.0',
      dependencies: {},
    }
  }
}
