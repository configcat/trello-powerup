var CONFIGCAT_ICON = './images/logo.png';

var cardButtonCallback = function (t) {
  return t.popup({
    title: 'Select Feature Flag or Setting',
    url: './settings.html',
    height: 184 // we can always resize later, but if we know the size in advance, its good to tell Trello
  });
};

// We need to call initialize to get all of our capability handles set up and registered with Trello
TrelloPowerUp.initialize({
  // NOTE about asynchronous responses
  // If you need to make an asynchronous request or action before you can reply to Trello
  // you can return a Promise (bluebird promises are included at TrelloPowerUp.Promise)
  // The Promise should resolve to the object type that is expected to be returned
  'card-back-section': function (t, options) {
    return t.get('card', 'shared', 'settings')
      .then(function (settings) {
        if (settings && settings.length > 0) {
          return {
            title: 'ConfigCat Feature flags or Settings',
            icon: CONFIGCAT_ICON, // Must be a gray icon, colored icons not allowed.
            content: {
              type: 'iframe',
              url: t.signUrl('./section.html'),
              height: 230 // Max height is 500
            }
          };
        }
        else {
          return [];
        }
      })
  },
  'card-buttons': function (t, options) {
    return [{
      // usually you will provide a callback function to be run on button click
      // we recommend that you use a popup on click generally
      icon: CONFIGCAT_ICON, // don't use a colored icon here
      text: 'Feature flag or Setting',
      callback: cardButtonCallback
    }];
  },
  'format-url': function (t, options) {
    return {
      icon: CONFIGCAT_ICON, // don't use a colored icon here
      text: '👉 ' + options.url + ' 👈'
    };
  },

  'authorization-status': function (t, options) {
    return t.get('organization', 'shared', 'basicAuthUserName')
      .then(function (basicAuthUserName) {
        if (basicAuthUserName) {
          return t.get('organization', 'shared', 'basicAuthPassword')
            .then(function (basicAuthPassword) {
              if (basicAuthPassword) {
                // TODO get all products with the basic auth information and return authorized: true only if that call was successful
                return { authorized: true };
              }
              return { authorized: false };
            });
        }
        return { authorized: false };
      });
  },
  'show-authorization': function (t, options) {
    return t.popup({
      title: 'My Auth Popup',
      url: './authorize.html',
      height: 240,
    });
  },
  'on-disable': function (t, options) {
    return t.remove('organization', 'shared', 'basicAuthUserName').then(function () {
      return t.remove('organization', 'shared', 'basicAuthPassword');
    });
  }
});

console.log('Loaded by: ' + document.referrer);