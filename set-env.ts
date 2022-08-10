const { writeFile } = require ('fs');
require('dotenv');
const targetPath = './src/environments/environment.prod.ts';
const envConfigFile = `export const environment = {
    production: true,
    publicApiBaseUrl: '${process.env.CC_PublicApiBaseUrl}',
    dashboardBasePath: '${process.env.CC_DashboardBaseUrl}'
};
`;
writeFile(targetPath, envConfigFile, function (err) {
   if (err) {
       throw console.error(err);
   }
});