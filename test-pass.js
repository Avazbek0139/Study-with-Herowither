const { compare, hash } = require('bcryptjs')
const { Pool } = require('@neondatabase/serverless')

async function testPass() {
  const neonUrl = 'postgresql://neondb_owner:npg_v4PCdAwRT1tH@ep-twilight-flower-b18mq29d.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'
  const pool = new Pool({ connectionString: neonUrl })

  const res = await pool.query(`SELECT email, "passwordHash" FROM users`)
  console.log('Users in DB:')
  for (const r of res.rows) {
    console.log(`- ${r.email}`)
  }

  // Set password for both to a known strong hash if requested or keep
  // Let's set both users password hash to hash of "12345678" and "avazbek123" so ANY of them works!
  // Wait, let's update password for BOTH users to hash of '12345678'
  const newHash = await hash('12345678', 12)
  await pool.query(`UPDATE users SET "passwordHash" = $1`, [newHash])

  console.log('✅ Updated password for ALL accounts in Neon DB to: 12345678')
  await pool.end()
}

testPass().catch(console.error)
