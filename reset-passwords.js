const { Pool } = require('@neondatabase/serverless')
const { hash } = require('bcryptjs')

async function fixPasswords() {
  const neonUrl = 'postgresql://neondb_owner:npg_v4PCdAwRT1tH@ep-twilight-flower-b18mq29d.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'
  const pool = new Pool({ connectionString: neonUrl })

  // Get hash from raxmatullayevavazbek28@gmail.com
  const res28 = await pool.query(`SELECT "passwordHash" FROM users WHERE email = 'raxmatullayevavazbek28@gmail.com'`)
  const hash28 = res28.rows[0]?.passwordHash

  console.log('Hash for raxmatullayevavazbek28@gmail.com:', hash28)

  if (hash28) {
    // Copy the hash to raxmatullayevavazbek39@gmail.com so both emails use the exact same password!
    await pool.query(
      `UPDATE users SET "passwordHash" = $1 WHERE email = 'raxmatullayevavazbek39@gmail.com'`,
      [hash28]
    )
    console.log('✅ Updated raxmatullayevavazbek39@gmail.com password hash to match 28!')
  }

  // Also create a backup password "12345678" hash if needed
  const defaultHash = await hash('12345678', 12)
  console.log('Sample hash for 12345678:', defaultHash)

  const allUsers = await pool.query(`SELECT id, name, email FROM users`)
  console.log('Current active users in Neon:', allUsers.rows)

  await pool.end()
}

fixPasswords().catch(console.error)
