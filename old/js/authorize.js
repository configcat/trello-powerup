var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var basicAuthUserNameInput = document.getElementById('basicAuthUserName');
var basicAuthPasswordInput = document.getElementById('basicAuthPassword');

t.render(function(){
  return Promise.all([
    t.get('organization', 'shared', 'basicAuthUserName'),
    t.get('organization', 'shared', 'basicAuthPassword')
  ])
  .spread(function(savedBasicAuthUserName, savedBasicAuthPassword){
    if(savedBasicAuthUserName){
        basicAuthUserNameInput.value = savedBasicAuthUserName;
    }
    if(savedBasicAuthPassword){
        basicAuthPasswordInput.value = savedBasicAuthPassword;
    }
  })
  .then(function(){
    t.sizeTo('#content').done();
  })
});

document.getElementById('save').addEventListener('click', function(){
  return t.set('organization', 'shared', 'basicAuthUserName', basicAuthUserNameInput.value)
  .then(function(){
    return t.set('organization', 'shared', 'basicAuthPassword', basicAuthPasswordInput.value);
  })
  .then(function(){
    t.closePopup();
  })
})
