const LoginPage = require('../pageobjects/login-page');
// const Database = require('../database/c360')
const database = require('../database/c360')
describe('My Login application', () => {

    it('should login with valid credentials', async () => {
        // await Database.getDB();
        const result = await database.validate.customerDetails("8");
        console.log(result);
        await browser.maximizeWindow();
        await LoginPage.open();

        await LoginPage.login('harithar@web-3.in', 'Hari@web3');
        await browser.takeScreenshot();
        await HomePage.validateLogin('Haritha R');
        await browser.takeScreenshot();
    });

});