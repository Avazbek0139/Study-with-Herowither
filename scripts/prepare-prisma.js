const fs = require('fs')
const path = require('path')

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')

if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8')
  const dbUrl = (process.env.DATABASE_URL || '').trim()

  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    console.log('[Prisma Auto-Config] PostgreSQL database detected. Using postgresql provider.')
    schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "postgresql"')
  } else {
    console.log('[Prisma Auto-Config] SQLite database detected. Using sqlite provider.')
    schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "sqlite"')
  }

  fs.writeFileSync(schemaPath, schema, 'utf8')
}
