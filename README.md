# titan

> A bot built with [Probot](https://github.com/probot/probot), which can receive Github webhooks and interacting with GitHub 

## Setup

```sh
# Install dependencies
npm install

# Optimize and typescript to javascript
npm run build

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t titan .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> titan
```

## Deploy

```sh
# 0. Create Heroku App at the first time
heroku create

# 1. Login to Heroku
heroku login

# 2. Configure Heroku App, or you can use .env file directly which may has a security risk
heroku config:set APP_ID=aaa \
    WEBHOOK_SECRET=bbb \
    PRIVATE_KEY="$(cat ~/Downloads/*.private-key.pem)"

# 3. Update code and redeploy
git push heroku master
```

## Permissions

A bot requires some repository and organization permissions, such as webhook、pull request, and contents on your account.
- Read access to metadata
- Read and write access to code, issues, pull requests, and repository hooks

## Contributing

If you have suggestions for how titan could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2021 zhengqi <1028365614@qq.com>
