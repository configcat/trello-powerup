jsfile=$(find /usr/share/nginx/html/main*.js)
variables=$(grep -o $jsfile -e '\$\{CC_[a-zA-Z_0-9]*\}' -E | tr '\n' ' ')
envsubst "$variables" < "$jsfile" > /usr/share/nginx/html/tempjsfile.js
mv /usr/share/nginx/html/tempjsfile.js "$jsfile"
nginx -g 'daemon off;'