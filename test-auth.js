const { Pool } = require('@neondatabase/serverless')
const { compare } = require('bcryptjs')

async function testAuth() {
  const neonUrl = 'postgresql://neondb_owner:npg_v4PCdAwRT1tH@ep-twilight-flower-b18mq29d.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'
  const pool = new Pool({ connectionString: neonUrl })

  const email39 = 'raxmatullayevavazbek39@gmail.com'
  const res = await pool.query('SELECT email, "passwordHash" FROM users WHERE email = $1', [email39])
  const user = res.rows[0]

  console.log('User found:', user?.email)
  if (user) {
    const isMatch = await compare('12345678', user.passwordHash)
    console.log('Is 12345678 valid for 39?', isMatch)
  }

  const email28 = 'raxmatullayevavazbek28@gmail.com'
  const res28 = await pool.query('SELECT email, "passwordHash" FROM users WHERE email = $1', [email28])
  const user28 = res28.rows[0]
  if (user28) {
    const isMatch28 = await compare('12345678', user28.passwordHash)
    console.log('Is 12345678 valid for 28?', isMatch28)
  }

  await pool.end()
}

testAuth().catch(console.error)
