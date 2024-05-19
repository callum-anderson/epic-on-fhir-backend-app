import jose from 'node-jose'
import fs from 'fs'
import axios from 'axios'
import config from './config.js'

const createJWT = async (payload) => {
    const keys = fs.readFileSync('keys.json')
    const keyStore = await jose.JWK.asKeyStore(keys.toString())
    const key = keyStore.get({use: 'sig'})
  
    return jose.JWS.createSign({compact: true, fields: {typ: 'jwt'}}, key)
    .update(JSON.stringify(payload))
    .final()
  }
  
  export const makeTokenRequest = async () => {
    const jwtPayload = {
      ...config.jwtPayload,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + 5*60*1000) / 1000)
    }
  
    const jwt = await createJWT(jwtPayload)
  
    const formParams = new URLSearchParams([
      ['grant_type', 'client_credentials'],
      ['client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'],
      ['client_assertion', jwt]
    ])
  
    const tokenResponse = await axios.post(config.jwtPayload.aud, formParams, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  
    if (tokenResponse.status === 200) {
      return tokenResponse.data.access_token
    } else {
      throw new Error(`Could not retrieve access token. ${tokenResponse.statusText}`)
    }
  }