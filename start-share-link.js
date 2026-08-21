const { startTunnel } = require('untun')

async function main() {
  console.log('Starting Cloudflare Public Tunnel for Study with HERO...')
  try {
    const tunnel = await startTunnel({ port: 3000 })
    const url = await tunnel.getURL()
    console.log('\n======================================================')
    console.log('✅ JONLI HAVOLA (DIRECT PUBLIC LINK):')
    console.log(url)
    console.log('======================================================\n')
  } catch (err) {
    console.error('Tunnel error:', err)
  }
}

main()
