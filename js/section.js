/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
var Promise = TrelloPowerUp.Promise;

var settingValuesDiv = document.getElementById('settingValues');

function httpGet(url) {
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
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
    });
}

t.render(function () {
  debugger;
  return t.get('card', 'shared', 'settings')
    .then(function (settings) {
      var settingValuesText = '';
      for (settingIndex = 0; settingIndex < settings.length; ++settingIndex) {
        var setting = settings[settingIndex];
        httpGet('api/v1/' + setting.environmentId + '/settings/' + setting.settingId + '/value')
          .then(function (settingValue) {
            var settingValueText = setting.name;

            if ((!settingValue.rolloutRules || settingValue.rolloutRules.length === 0)
              && (!settingValue.percentageRules || settingValue.percentageRules.length === 0)) {
              settingValueText = settingValueText + ' ➔ ' + settingValue.value;
            }
            else {
              if (settingValue.rolloutRules || settingValue.rolloutRules.length > 0) {
                for (rolloutRuleIndex = 0; rolloutRuleIndex < settingValue.rolloutRules.length; ++rolloutRuleIndex) {
                  var rolloutRule = settingValue.rolloutRules[rolloutRuleIndex];
                  var rolloutRuleText = '<br/>&nbsp;&nbsp;IF <' + rolloutRule.comparisonAttribute + '> ' + rolloutRule.comparator.toUpper()
                    + ' <' + rolloutRule.comparisonValue + '> THEN <' + rolloutRule.value + '>';
                  settingValueText = settingValueText + rolloutRuleText;
                }
              }

              if (settingValue.percentageRules || settingValue.percentageRules.length > 0) {
                for (percentageRuleIndex = 0; percentageRuleIndex < settingValue.percentageRules.length; ++percentageRuleIndex) {
                  var percentageRule = settingValue.percentageRules[percentageRuleIndex];
                  var percentageRuleText = '<br/>&nbsp;&nbsp;' + percentageRule.percentage + '% <' + percentageRule.value;
                  settingValueText = settingValueText + percentageRuleText;
                }
              }
            }

            settingValuesText = settingValuesText + '<br/><br/>' + settingValueText;
          });
      }

      settingValuesDiv.innerHtml = settingValuesText;
    })
    .then(function () {
      return t.sizeTo('#content');
    });
});
