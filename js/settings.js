/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var productSelector = document.getElementById('product');
productSelector.addEventListener('onchange', productChanged);
var configSelector = document.getElementById('config');
configSelector.addEventListener('onchange', configChanged);
var environmentSelector = document.getElementById('environment');
var settingSelector = document.getElementById('setting');

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
  return Promise.all([
    t.get('organization', 'shared', 'basicAuthUserName'),
    t.get('organization', 'shared', 'basicAuthPassword')
  ])
    .spread(function (basicAuthUserName, basicAuthPassword) {
      return httpGet("v1/products")
        .then(function (products) {
          removeOpts(productSelector);

          for (index = 0; index < products.products.length; ++index) {
            var product = products.products[index];
            addOpt(productSelector, product.productId, product.name)
          }

          if (products.products && products.products.length > 0) {
            productSelector.value = products.products[0].productId;
          }

          return productChanged();
        })
    })
    .then(function () {
      t.sizeTo('#content')
        .done();
    })
});

function addOpt(selector, value, text) {
  var opt = document.createElement('option');
  opt.appendChild(document.createTextNode(text));
  opt.value = value;
  selector.appendChild(opt);
}

function removeOpts(selector) {
  while (selector.firstChild) {
    selector.removeChild(selector.firstChild);
  }
}

function productChanged() {
  product = productSelector.value;
  removeOpts(configSelector);

  if (product) {
    return httpGet("v1/products/" + product + "/configs")
      .then(function (configs) {
        for (index = 0; index < configs.configs.length; ++index) {
          var config = configs.configs[index];
          addOpt(configSelector, config.configId, config.name)
        }
        if (configs.configs && configs.configs.length > 0) {
          configSelector.value = configs.configs[0].configId;
          return configChanged();
        }
      })
      .then(function () {
        return httpGet("v1/products/" + product + "/environments")
          .then(function (environments) {
            for (index = 0; index < environments.environments.length; ++index) {
              var environment = environments.environments[index];
              addOpt(environmentSelector, environment.environmentId, environment.name)
            }

            if (environments.environments && environments.environments.length > 0) {
              environmentSelector.value = environments.environments[0].environmentId;
            }
          });
      })
      .done()
  }

  return new Promise().done();
}


function configChanged() {
  config = configSelector.value;
  removeOpts(settingSelector);

  if (config) {
    return httpGet("v1/configs/" + config + "/settings")
      .then(function (settings) {
        for (index = 0; index < settings.settings.length; ++index) {
          var setting = settings.settings[index];
          addOpt(settingSelector, setting.settingId, setting.name)
        }

        if (settings.settings && settings.settings.length > 0) {
          settingSelector.value = settings.settings[0].settingId;
        }
      })
      .done()
  }

  return new Promise().done();
}

document.getElementById('save').addEventListener('click', function () {
  if (productSelector.value && configSelector.value && environmentSelector.value && settingSelector.value) {

    t.get('card', 'shared', 'settings')
      .then(function (settings) {
        settings = settings || [];
        settings.push({
          environmentId: environmentSelector.value,
          settingId: settingSelector.value,
          settingName: settingSelector.text
        });

        return t.set('card', 'shared', 'settings', settings)
          .then(function () {
            t.closePopup();
          })
      })
      .catch(function () {
        var settings = [{
          environmentId: environmentSelector.value,
          settingId: settingSelector.value,
          settingName: settingSelector.text
        }];

        return t.set('card', 'shared', 'settings', settings)
          .then(function () {
            t.closePopup();
          })
      });
  }
});
