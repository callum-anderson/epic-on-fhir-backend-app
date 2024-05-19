# Helper scripts to help with Building a Backend Application for Epic

## Generating Private and Public Keys for Epic using openSSL:

Generate the Private Key:

```
openssl genrsa -out ./privatekey.pem 2048
```

Generate the Public Key from the Private Key:

```
openssl req -new -x509 -key ./privatekey.pem -out ./publickey509.pem -subj '/CN=myapp'
```

You can also Reference `1_manual_keys.sh`. Upload the `publickey509.pem` to Epic while creating an app.

### Generating Private and Public Keys using NodeJS

```
npm install
```

```
node 2_generate_keys.js
```

This will generate a `keys.json` file. Keep it safe and secure. This will be needed for the next step.

### Serving Public Key using a local Server

```
node 3_serve_keys.js
```

Expose to the public using Ngrok or Cloudflare tunnels

```
ngrok tunnel --label edge=<your_edge_label> http://localhost:3000
```

### Serving Public Key from a public web server

```
node 4_output_public_key.js
```

### Run a Development SMTP Server

```
docker run -p 1080:1080 -p 1025:1025 maildev/maildev
```

Browse the Web UI on 1080.


### Send a test email

Use the SMTP server on localhost:1025

```
node 5_send_test_email.js
```

Check the email on http://localhost:1080


