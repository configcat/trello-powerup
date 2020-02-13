/* global TrelloPowerUp */

// we can access Bluebird Promises as follows
var Promise = TrelloPowerUp.Promise;

/*

Trello Data Access

The following methods show all allowed fields, you only need to include those you want.
They all return promises that resolve to an object with the requested fields.

Get information about the current board
t.board('id', 'name', 'url', 'shortLink', 'members')

Get information about the current list (only available when a specific list is in context)
So for example available inside 'attachment-sections' or 'card-badges' but not 'show-settings' or 'board-buttons'
t.list('id', 'name', 'cards')

Get information about all open lists on the current board
t.lists('id', 'name', 'cards')

Get information about the current card (only available when a specific card is in context)
So for example available inside 'attachment-sections' or 'card-badges' but not 'show-settings' or 'board-buttons'
t.card('id', 'name', 'desc', 'due', 'closed', 'cover', 'attachments', 'members', 'labels', 'url', 'shortLink', 'idList')

Get information about all open cards on the current board
t.cards('id', 'name', 'desc', 'due', 'closed', 'cover', 'attachments', 'members', 'labels', 'url', 'shortLink', 'idList')

Get information about the current active Trello member
t.member('id', 'fullName', 'username')

For access to the rest of Trello's data, you'll need to use the RESTful API. This will require you to ask the
user to authorize your Power-Up to access Trello on their behalf. We've included an example of how to
do this in the `🔑 Authorization Capabilities 🗝` section at the bottom.

*/

/*

Storing/Retrieving Your Own Data

Your Power-Up is afforded 4096 chars of space per scope/visibility
The following methods return Promises.

Storing data follows the format: t.set('scope', 'visibility', 'key', 'value')
With the scopes, you can only store data at the 'card' scope when a card is in scope
So for example in the context of 'card-badges' or 'attachment-sections', but not 'board-badges' or 'show-settings'
Also keep in mind storing at the 'organization' scope will only work if the active user is a member of the team

Information that is private to the current user, such as tokens should be stored using 'private' at the 'member' scope

t.set('organization', 'private', 'key', 'value');
t.set('board', 'private', 'key', 'value');
t.set('card', 'private', 'key', 'value');
t.set('member', 'private', 'key', 'value');

Information that should be available to all users of the Power-Up should be stored as 'shared'

t.set('organization', 'shared', 'key', 'value');
t.set('board', 'shared', 'key', 'value');
t.set('card', 'shared', 'key', 'value');
t.set('member', 'shared', 'key', 'value');

If you want to set multiple keys at once you can do that like so

t.set('board', 'shared', { key: value, extra: extraValue });

Reading back your data is as simple as

t.get('organization', 'shared', 'key');

Or want all in scope data at once?

t.getAll();

*/

var CONFIGCAT_ICON = './images/logo.png';

var cardButtonCallback = function (t) {
  return t.popup({
    title: 'Select Feature Flags or Settings',
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
            title: 'ConfigCat feature flags or settings',
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
      text: 'Feature flag or setting',
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