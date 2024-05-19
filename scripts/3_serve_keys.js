import express from 'express'
import fs from 'fs'
import jose from 'node-jose'

const app = express()

app.get('/jwks', async (req, res) => {
  const ks = fs.readFileSync('keys.json')
  const keyStore = await jose.JWK.asKeyStore(ks.toString())
  res.json(keyStore.toJSON())
})

app.get('/', async (req, res) => {
  res.send('Hello World!')
})

app.listen(3000,()=>{
  console.log("Listening on port 3000. Please point the JWKS URI to http://localhost:3000/jwks")
})