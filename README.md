# nodejs-express-example

* sudo mkdir /opt/.pm2
* sudo chmod -R 777 /opt/.pm2

* vim .profile
```
export PM2_HOME=/opt/.pm2
```

* npm install -g express-generator
* express --view=ejs nodejs-express-example
* cd nodejs-express-example
* npm install --save

* sudo npm install -g pm2
* pm2 ecosystem
* sudo npm install -g standard
* standard --fix ecosystem.config.js
* vim ecosystem.config.js

```
module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'www',
      script: 'bin/www.js',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

* sudo pm2 start ecosystem.config.js
* sudo pm2 list
* sudo pm2 stop all
* sudo pm2 logs

* sudo pm2 start www

* sudo apt install nginx
* sudo systemctl enable nginx
* sudo vim /etc/nginx/sites-enabled/default

```
server {
        listen 80;

        server_name ec2-54-244-203-211.us-west-2.compute.amazonaws.com;

        location / {
                proxy_pass http://172.31.24.62:81;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```

* sudo /etc/init.d/nginx restart
