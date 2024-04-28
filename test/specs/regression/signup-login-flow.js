const LoginPage = require('../../pageobjects/login-page');
const { Login } = require('../../../test-data/regression/login.json');
 
describe('My Login application', () => {
 
    it('should login with valid credentials', async () => {
        await LoginPage.open();
        await LoginPage.login(Login.Credential);
        await browser.takeScreenshot();
    });
 
});