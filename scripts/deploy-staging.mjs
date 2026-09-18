import { spawnSync } from 'node:child_process'

const staging = 'tesseral-website-staging.vercel.app'
const scope = 'paul-assistant-5795s-projects'
const run = (args, capture = false) => {
  const result = spawnSync('npx', ['--yes', 'vercel', ...args], {
    stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit', encoding: 'utf8',
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
  return result.stdout ?? ''
}

// Update the shared alias only after Vercel has successfully built the preview.
const output = run(['deploy', '--yes', '--scope', scope], true)
process.stdout.write(output)
const deployment = output.match(/"url"\s*:\s*"(https:\/\/[^"\s]+\.vercel\.app)"/)?.[1]
  ?? output.match(/^https:\/\/[^\s]+\.vercel\.app$/m)?.[0]
if (!deployment) throw new Error('Deployment URL was not returned; staging alias was left unchanged.')
run(['alias', 'set', deployment, staging, '--scope', scope])
console.log(`Staging: https://${staging}`)
