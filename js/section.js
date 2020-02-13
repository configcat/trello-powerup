/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
var Promise = TrelloPowerUp.Promise;

var settingValuesDiv = document.getElementById('settingValues');

function httpGet(url, settingIndex, settingName) {
  return Promise.all([
    t.get('organization', 'shared', 'basicAuthUserName'),
    t.get('organization', 'shared', 'basicAuthPassword')
  ])
    .spread(function (basicAuthUserName, basicAuthPassword) {
      return new Promise((resolve, reject) => {
        fetch('https://test-api.configcat.com/' + url,
          { headers: { "Authorization": "Basic " + btoa(basicAuthUserName + ':' + basicAuthPassword) } }
        )
          .then(data => { return data.json(); })
          .then(function (data) {
            resolve({settingValue: data, settingIndex: settingIndex, settingName: settingName});
          })
          .catch(error => {
            reject(error);
          });
      });
    });
}

t.render(function () {
  return t.get('card', 'shared', 'settings')
    .then(function (settings) {
      settings = settings || [];
      var settingValuesText = '';
      for (settingIndex = 0; settingIndex < settings.length; ++settingIndex) {
        var setting = settings[settingIndex];
        httpGet('v1/environments/' + setting.environmentId + '/settings/' + setting.settingId + '/value', settingIndex, setting.settingName)
          .then(function (settingValue, currentSettingIndex, settingName) {
            var settingValueText = settingName || '';

            if ((!settingValue.rolloutRules || settingValue.rolloutRules.length === 0)
              && (!settingValue.percentageRules || settingValue.percentageRules.length === 0)) {
              settingValueText = settingValueText + ' ➔ &lt;' + settingValue.value + '&gt;';
            }
            else {
              if (settingValue.rolloutRules || settingValue.rolloutRules.length > 0) {
                for (rolloutRuleIndex = 0; rolloutRuleIndex < settingValue.rolloutRules.length; ++rolloutRuleIndex) {
                  var rolloutRule = settingValue.rolloutRules[rolloutRuleIndex];
                  var rolloutRuleText = '<br/>&nbsp;&nbsp;IF &lt;' + rolloutRule.comparisonAttribute + '&gt; ' + rolloutRule.comparator
                    + ' &lt;' + rolloutRule.comparisonValue + '&gt; THEN &lt;' + rolloutRule.value + '&gt;';
                  settingValueText = settingValueText + rolloutRuleText;
                }
              }

              if (settingValue.percentageRules || settingValue.percentageRules.length > 0) {
                for (percentageRuleIndex = 0; percentageRuleIndex < settingValue.percentageRules.length; ++percentageRuleIndex) {
                  var percentageRule = settingValue.percentageRules[percentageRuleIndex];
                  var percentageRuleText = '<br/>&nbsp;&nbsp;' + percentageRule.percentage + '% &lt;' + percentageRule.value + '&gt;';
                  settingValueText = settingValueText + percentageRuleText;
                }
              }

              settingValueText = settingValueText + '<br/>&nbsp;&nbspDefault value ➔ &lt;' + settingValue.value + '&gt;';
            }
            settingValueText = settingValueText + '<br/>' + '<button onclick="removeSetting(' + currentSettingIndex + ')">Remove</button>'

            settingValuesText = settingValuesText + settingValueText + '<hr/>';
            settingValuesDiv.innerHTML = settingValuesText;
          })
          .then(function () {
            return t.sizeTo('#content');
          })
          .done();
      }
    })
    .then(function () {
      return t.sizeTo('#content');
    });
});

function removeSetting(index) {
  return t.get('card', 'shared', 'settings')
    .then(function (settings) {
      settings = settings || [];
      settings.splice(index, 1);

      return t.set('card', 'shared', 'settings', settings);
    });
}