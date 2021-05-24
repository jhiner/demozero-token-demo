# demozero-token-demo

## Setup

- Copy .env.example to .env and set the appropriate values.
- The Management API client (M2M app) that you use must have at minimum read:client_grants and update:client_grants scopes assigned via a client grant for the API2 resource server in your tenant. This is the minimum setup that is required. The app will automatically bootstrap the rest.
- Add myapp.com to your /etc/hosts, mapped to 127.0.0.1.
- Create self-signed cert as described here https://bit.ly/3oj6t9u. Save as server.key and server.cert in the root directory of the application.
- Now you can navigate to the app at https://myapp.com:4000/
## Running the example

Use `npm start` to run the project.

## Reset Tenant

You can reset the tenant used with this app, which will delete the client, resource server, etc. that are created during the bootstrap process. To do this, run `npm run reset-tenant`.
