const { search } = require('../../../test-data/regression/searchbar.json');
const { Login } = require('../../../test-data/regression/login.json');

const Searchbar = require("../../pageobjects/searchbar-page");
const LoginPage = require('../../pageobjects/login-page');
const Util = require('../../util/util');

describe('Customer Search page ', () => {

    it('should login with valid credentials', async () => {
        try {
            await browser.maximizeWindow();
            await LoginPage.open();
            await LoginPage.login(Login.Credential);
        } catch (error) {
            Util.reportFailedStatus(error);
        }
    });
    for (let i = 0; i < search.length; i++) {
        const { testCaseName, data } = search[i]
        it(testCaseName, async () => {
            try {
                await Searchbar.searchCustomer(data);
                await Searchbar.validateAndClickCustomer(data);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
    }
});
