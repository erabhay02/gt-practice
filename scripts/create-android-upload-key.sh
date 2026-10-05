#!/bin/bash
# Creates the Google Play upload key for ThinkSprout, outside the repo:
#   ~/.thinksprout/thinksprout-upload.jks      (the key)
#   ~/.thinksprout/upload.properties           (where it is + its password; read by android/app/build.gradle)
# Run it once, in your own terminal: bash scripts/create-android-upload-key.sh
# Back up both files (e.g. in a password manager). If they're lost, Google can reset
# the upload key, but it takes a support request and a few days.
set -euo pipefail

DIR="$HOME/.thinksprout"
KEYSTORE="$DIR/thinksprout-upload.jks"
PROPS="$DIR/upload.properties"
ALIAS="upload"
KEYTOOL="$(ls -d "$HOME"/.jdks/jdk-21*/Contents/Home/bin/keytool 2>/dev/null | head -1)"
KEYTOOL="${KEYTOOL:-keytool}"

if [ -e "$KEYSTORE" ]; then
  echo "An upload key already exists at $KEYSTORE — not overwriting it."
  exit 1
fi

mkdir -p "$DIR"
chmod 700 "$DIR"

while true; do
  read -r -s -p "Choose a password for the upload key (8+ characters): " PW; echo
  read -r -s -p "Type it again: " PW2; echo
  if [ "$PW" != "$PW2" ]; then echo "They don't match, try again."; continue; fi
  if [ ${#PW} -lt 8 ]; then echo "Too short, try again."; continue; fi
  break
done

STOREPASS="$PW" "$KEYTOOL" -genkeypair -v \
  -keystore "$KEYSTORE" -storetype PKCS12 \
  -alias "$ALIAS" -keyalg RSA -keysize 4096 -validity 10000 \
  -dname "CN=ThinkSprout, O=Astrala, C=US" \
  -storepass:env STOREPASS -keypass:env STOREPASS >/dev/null

umask 077
cat > "$PROPS" <<EOF
storeFile=$KEYSTORE
keyAlias=$ALIAS
password=$PW
EOF
chmod 600 "$KEYSTORE" "$PROPS"

echo "Done. Upload key created in $DIR"
echo "Save the password (and ideally a copy of both files) in your password manager."
