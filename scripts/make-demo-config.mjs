// Builds the Wrangler config for a DEMO deployment from the file `npm run build` generates.
//   node scripts/make-demo-config.mjs --name fisiofes-demo --d1 <database-id> [--local-var KEY=VALUE]...
// Writes dist/server/wrangler.demo.json. Secrets must NOT go through --local-var when deploying:
// use `wrangler secret put` instead. --local-var is only for testing the build on your computer.
import { readFileSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const value = (flag) => {
  const index = args.indexOf(flag)
  return index >= 0 ? args[index + 1] : undefined
}
const name = value('--name') ?? 'fisiofes-demo'
const d1 = value('--d1')
if (!d1) throw new Error('Falta --d1 <database-id>')

const config = JSON.parse(readFileSync('dist/server/wrangler.json', 'utf8'))
config.name = name
config.topLevelName = name
config.d1_databases = config.d1_databases.map((db) => ({
  ...db,
  database_name: 'fisiofes-demo',
  database_id: d1,
  migrations_dir: '../../drizzle',
}))
config.vars = { DEMO_MODE: '1', CALENDAR_MOCK: '1' }
args.forEach((arg, index) => {
  if (arg === '--local-var') {
    const [key, ...rest] = args[index + 1].split('=')
    config.vars[key] = rest.join('=')
  }
})
writeFileSync('dist/server/wrangler.demo.json', JSON.stringify(config, null, 2))
console.log(`dist/server/wrangler.demo.json listo (nombre: ${name}, D1: ${d1})`)
