    var webAuth = new auth0.WebAuth({
      domain:       '#{env.AUTH0_DOMAIN}',
      clientID:     '#{env.AUTH0_CLIENT_ID}',
      callbackURL:  '#{env.AUTH0_CALLBACK_URL}'
    });

    function checkSSO() {
      webAuth.renewAuth({
        responseType: 'id_token',
        redirectUri: '#{env.AUTH0_SILENT_CALLBACK_URL}',
        usePostMessage: true
      }, function (err, authResult) {
        if (authResult) {
          if (authResult.error === 'login_required') {
            console.log('Your session has expired. Please login.');
            document.getElementById('msg').innerHTML = 'Your session has expired. Please login.';
          } else {
            sso();
          }
        }
      });
    }

    function sso() {
       webAuth.authorize({
        redirectUri: '#{env.AUTH0_CALLBACK_URL}',
        responseType: 'code',
        audience: 'http://todoapi2.api',
        scope: 'openid profile read:todo offline_access',
        state: 'foobar',
        prompt: 'none'
      });
    }

    function signIn() {
      webAuth.authorize({
        redirectUri: '#{env.AUTH0_CALLBACK_URL}',
        responseType: 'code',
        audience: 'http://todoapi2.api',
        scope: 'openid profile read:todo offline_access',
        state: 'foobar'
      });
    }

    function refreshToken(refresh_token) {
      auth0.refreshToken(refresh_token, function (err, result) {
        console.log('----- ' + result.id_token);
        console.log('----- ' + result.access_token);
      });
    }