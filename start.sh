es5file=$(find /usr/share/nginx/html/main-es5*.js)
variables=$(grep -o $es5file -e '\$\{CC_[a-zA-Z_0-9]*\}' -E | tr '\n' ' ')
envsubst "$variables" < "$es5file" > /usr/share/nginx/html/tempes5.js
mv /usr/share/nginx/html/tempes5.js "$es5file"
es2015file=$(find /usr/share/nginx/html/main-es2015*.js)
envsubst "$variables" < "$es2015file" > /usr/share/nginx/html/tempes2015.js
mv /usr/share/nginx/html/tempes2015.js "$es2015file"
nginx -g 'daemon off;'