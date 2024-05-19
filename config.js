import dotenv from "dotenv"
import {v4 as uuidv4} from "uuid"

dotenv.config()

const parseEnvVar = (envVarKey) => {
  if (!process.env[envVarKey] || process.env[envVarKey].length<1)
    throw new Error(`Error parsing required environment variable: ${envVarKey}`)
  return process.env[envVarKey]
}

 const config = {
  jwtPayload: {
    iss: parseEnvVar('CLIENT_ID'),
    sub: parseEnvVar('CLIENT_ID'),
    aud: process.env['TOKEN_ENDPOINT'] || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    jti: uuidv4(),
    exp: null,
    nbf: null,
    iat: null
  },
  fhirEndpoint: process.env['FHIR_ENDPOINT'] || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR',
  fhirVersion: process.env['FHIR_VERSION'] || 'R4',
  bulkGroupId: process.env['BULK_GROUP_ID'] || 'e3iabhmS8rsueyz7vaimuiaSmfGvi.QwjVXJANlPOgR83',
  emailService: {
    displayName: parseEnvVar('EMAIL_SERVICE_DISPLAY_NAME'),
    username: parseEnvVar('EMAIL_SERVICE_USERNAME'),
    password: parseEnvVar('EMAIL_SERVICE_PASSWORD'),
    host: parseEnvVar('EMAIL_SERVICE_HOST'),
    port: parseEnvVar('EMAIL_SERVICE_PORT'),
    recipientEmailAddresses: [
      parseEnvVar('PRIMARY_EMAIL')
    ]
  }
}

export default config
