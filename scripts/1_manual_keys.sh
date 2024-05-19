#!/bin/bash
openssl genrsa -out ./privatekey.pem 2048
echo "Private keys generated. Keep them safe!"
openssl req -new -x509 -key ./privatekey.pem -out ./publickey509.pem -subj '/CN=myapp'
echo "Public Keys generated"