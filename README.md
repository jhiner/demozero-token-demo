# demozero-token-demo

## Setup

- Copy .env.example to .env and set the appropriate values.
- Add myapp.com to your /etc/hosts (to avoid localhost forcing consent)
- Add https://myapp.com:PORT/callback to your callback urls in the client configuration
- Add https://myapp.com:PORT/logout to your allowed logout urls in the client configuration
- Create self-signed cert as described here https://bit.ly/3oj6t9u. Save as server.key and server.certin the root directory of the application.

## Running the example

Use `npm start` to run the project.
