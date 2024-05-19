import jose from 'node-jose'
import fs from 'fs'

const keyStore = jose.JWK.createKeyStore()
// Passing 'true' to .toJSON requests all keys (both public and private)
// This is omitted when serving the key, to serve only the public key
keyStore.generate('RSA', 2048, {alg: 'RS256', use: 'sig' })
.then(result => {
  fs.writeFileSync(
    '../keys.json', 
    JSON.stringify(keyStore.toJSON(true), null, '')
  )
})

