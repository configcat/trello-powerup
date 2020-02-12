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
  return new Promise((resolve, reject) => {
    http.get('https://test-api.configcat.com/' + url, response => {
      response.setEncoding('utf8');
      response.pipe(bl((err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.toString());
      }));
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

          for (index = 0; index < products.length; ++index) {
            var product = products[index];
            addOpt(productSelector, product.productId, product.name)
          }

          if (products.length > 0) {
            productSelector.value = products[0].productId;
          }
        })
    })
    .then(function () {
      t.sizeTo('#content')
        .done();
    })
});

function addOpt(selector, value, text) {
  var opt = document.createElement('option');
  opt.appendChild(document.createTextNode(product.name));
  opt.value = product.productId;
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
    return httpGet("v1/products/" + product + "configs")
      .then(function (configs) {
        for (index = 0; index < configs.length; ++index) {
          var config = configs[index];
          addOpt(configSelector, config.configId, config.name)
        }
        if (configs.length > 0) {
          configSelector.value = configs[0].configId;
        }
      })
      .then(function () {
        return httpGet("v1/products/" + product + "environments")
          .then(function (environments) {
            for (index = 0; index < environments.length; ++index) {
              var environment = environments[index];
              addOpt(environmentSelector, environment.environmentId, environment.name)
            }

            if (environments.length > 0) {
              environmentSelector.value = environments[0].environmentId;
            }
          });
      })
      .done()
  }

  return new Promise().done();
}


function configChanged() {
  config = configSelector.value;
  removeOpts(configSelector);

  if (config) {
    return httpGet("v1/configs/" + config + "settings")
      .then(function (settings) {
        for (index = 0; index < settings.length; ++index) {
          var setting = settings[index];
          addOpt(productSelector, setting.settingIdId, setting.name)
        }

        if (settings.length > 0) {
          settingSelector.value = settings[0].configId;
        }
      })
      .done()
  }

  return new Promise().done();
}

document.getElementById('save').addEventListener('click', function () {
  if (productSelector.value && configSelector.value && environmentSelector.value && settingSelector.value) {

    t.set('card', 'shared', 'settings', {
      environmentId: environmentSelector.value,
      settingId = settingSelector.value,
      settingName = settingSelector.text
    })
      .then(function () {
        t.closePopup();
      })
  }
})
