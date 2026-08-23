jsfile=$(find /usr/share/nginx/html/main*.js)
variables=$(grep -o $jsfile -e '\$\{CC_[a-zA-Z_0-9]*\}' -E | tr '\n' ' ')
envsubst "$variables" < "$jsfile" > /usr/share/nginx/html/tempjsfile.js
mv /usr/share/nginx/html/tempjsfile.js "$jsfile"
if [ -n "$CC_PublicApiBaseUrl" ]; then
    CONF=/etc/nginx/security-headers.conf
    sed -i "s|# CONNECTPLACEHOLDER|set \$CONNECT \"\${CONNECT} $CC_ApiBaseUrl\";|" "$CONF"
fi
nginx -g 'daemon off;'