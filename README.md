# Note to self
## Submodule
### Cloning
```
git clone...
cd yemit-break-common
git submodule update --init
```
### Updating
```
git fetch
git checkout -q commitId
```
## Certificate
Get your certificate and put next to app.js
Btw, to dev on windows, open gitbash and use
```
winpty openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```
## Env vars
Set the following env vars:
- YBBE_MONGO_UN
- YBBE_MONGO_PW
- YBBE_CERT_KEY
- YBBE_JWT_SECRET