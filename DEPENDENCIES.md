# How to update dependencies (security)

1. Update the `ng-configcat-publicapi` and `ng-configcat-publicapi-ui` packages if necessary
1. `npm audit fix`
1. If there were fixes, create a pull request with the changes
1. Test the power-up on test
1. Ask the release team to deploy it to live.