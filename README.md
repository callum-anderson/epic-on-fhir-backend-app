# Epic on FHIR Back-End Service App

An app to retrieve all lab results from patients in the Epic Sandbox, and send a notification email containing a summary of the results (including any abnormal results).

## Quick start

1. Register an Epic back-end app at https://fhir.epic.com/Developer/Apps
2. Install packages: `npm i`
3. Generate a key-pair by running either `bash scripts/1_manual_keys.sh` or `cd scripts && node 2_generate_keys.js && cd ..`
    - If using the bash script, upload the generated public key to your registered Epic app sandbox
    - If using the node script, you also need to run `cd scripts && node 4_output_public_key.js && cd ..`, then serve the generated public key (in `/public`) from a public web server. Then enter that public URL in your registered Epic app sandbox.
4. Create an account at https://ethereal.email/, taking a note of the display name, username and password.
5. Copy or rename `.env.example` to `.env`, then add the following values to it:
    - `CLIENT_ID` - from your registered Epic app
    - `PRIMARY_EMAIL` - the email you want to send the notification to*
    - `EMAIL_SERVICE_DISPLAY_NAME` - the display name for notification email
    - `EMAIL_SERVICE_USERNAME` - your Ethereal mailbox username
    - `EMAIL_SERVICE_PASSWORD` - your Ethereal mailbox password
6. Run `node index.js now`, to execute immediately (otherwise it will run as a CRON job, at midnight)

* note: if using Ethereal it doesn't actually deliver it to the target email, instead delivering to your Ethereal mailbox

## App details

This app uses the OAuth 2.0 client credentials flow. A JWT token is required to authenticate, in order to retrieve the access token which can be used to make requests.

Instructions to construct the JWT token can be found at: https://fhir.epic.com/Documentation?docId=oauth2&section=BackendOAuth2Guide

The steps are:

1. Create the Epic sandbox app (choosing backend service type)
2. Create a SSL public/private key pair by either:
    - running the included bash script (`scripts/1_manual_keys.sh`)
    - running the included node script (`cd scripts && node 2_generate_keys.js && cd ..`)
3. Upload the public key to the app settings by either:
    - uploading the generated public key directly to your Epic app sandbox area (generated from `scripts/1_manual_keys.sh`)
    - running `cd scripts && node 4_output_public_key.js && cd ..`, then serving the generated key from a public web server and providing the URL in your Epic app sandbox area
    - running `3_serve_keys.js` to serve the public key from your local computer (in conjunction with eg. Ngrok or Cloudflare tunnel)
4. Construct the JWT token, using JSON header and payload (and signed by key pair):
    1. Header
        - alg: RS384
        - typ: JWT
    2. Payload
    - iss: a1486e03-1ed3-4a1b-94f0-3182c73426e8 (app client ID)
    - sub: a1486e03-1ed3-4a1b-94f0-3182c73426e8 (app client ID)
    - aud: https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token (token endpoint)
    - jti: f9eaafba-2e49-11ea-8880-5ce0c5abc123 (random unique UUID)
    - exp: 1583524402 (token expiry time)
    - nbf: 1583524102 (token issue time)
    - iat: 1583524102 (token issue time)

This app constructs the JWT token using supplied values, which must be exposed as environment variables. These values are:
- CLIENT_ID (provided after creating the app in step 1 above)
- TOKEN_ENDPOINT (defaults to: `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token`)
- FHIR_ENDPOINT (defaults to: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR`)
- FHIR_VERSION (defaults to: `R4`)
- BULK_GROUP_ID (defaults to: `e3iabhmS8rsueyz7vaimuiaSmfGvi.QwjVXJANlPOgR83`)

In addition, the following environment variables are required in order to send the notification email after the bulk request completes:
- PRIMARY_EMAIL (email address to send the notification to)
- EMAIL_SERVICE_DISPLAY_NAME
- EMAIL_SERVICE_USERNAME (username for the email service)
- EMAIL_SERVICE_PASSWORD  (password for the email service)
- EMAIL_SERVICE_HOST
- EMAIL_SERVICE_PORT

The app is configured to use the `Ethereal` email service by default - sign up at https://ethereal.email/ and expose the provided display name, username and password values to quickly get started. Note that the notification isn't actually sent to the delivery address (`PRIMARY_EMAIL`) if using Ethereal. It will be delivered to your Ethereal mailbox instead.

All of the required environment variables are included in the `.env.example` sample file. This can be configured and renamed to `.env` prior to running the app.

The app is configured to run on a CRON job, at midnight. It can be executed immediately by passing in the command-line argument `now` (ie. `node index.js now`).