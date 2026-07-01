import { spawn } from 'node:child_process'

const npmCommand = 'npm'
const services = [
  ['frontend', ['--prefix', 'frontend', 'run', 'dev']],
  ['backend', ['--prefix', 'backend', 'run', 'dev']],
]

const children = services.map(([name, args]) => {
  const child = spawn(npmCommand, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    windowsHide: true,
  })

  child.on('error', (error) => {
    console.error(`Could not start ${name}: ${error.message}`)
  })

  return child
})

let stopping = false

function stop(exitCode = 0) {
  if (stopping) return
  stopping = true

  for (const child of children) {
    if (!child.killed) child.kill()
  }

  process.exitCode = exitCode
}

for (const child of children) {
  child.on('exit', (code, signal) => {
    if (!stopping && code !== 0) {
      console.error(`A development service stopped (${signal ?? `exit code ${code}`}).`)
      stop(code ?? 1)
    }
  })
}

process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
