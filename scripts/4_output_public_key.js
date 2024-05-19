import fs from 'fs'
import jose from 'node-jose'

const ks = fs.readFileSync('../keys.json')
const keyStore = await jose.JWK.asKeyStore(ks.toString())

fs.writeFileSync(
  '../public/public-key.json', 
  JSON.stringify(keyStore.toJSON(true), null, '')
)