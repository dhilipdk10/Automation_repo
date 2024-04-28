const Page = require('./page')
class LoginPage extends Page {
    get emailId() { return $('input[name="EmailAddress"]') }
    get password() { return $('input[name="Password"]') }
    get loginButton() { return $('.//ion-button[contains(., "Login")]') }
    get validateUserName() { return $(`.//div[contains(@class,"user-name")]/ion-label`) }
    get loginLoader() { return $(`//ion-loading`) }

    open() {
        return super.open('/auth/login');
    }
    async login(credentials) {
        super.startStep('Logging in with valid credentials:');
        await browser.pause(1000);

        super.startStep(`Entering username as: "${credentials.userName}"`);
        await this.emailId.click();
        await this.emailId.setValue(credentials.userName);

        await browser.pause(1000);
        super.startStep(`Entering password as: *******`);
        await this.password.setValue(credentials.password);

        super.startStep(`Clicking on "Login" button`);
        await this.loginButton.click();

        const loader = await this.loginLoader;
        await loader.waitForDisplayed({ reverse: true, timeout: 10000, timeoutMsg: " As expected ticket loader is not visible on the screen." });

        super.startStep(`Validating userName as: "${credentials.name}"`);
        var userName = await this.validateUserName.getText();
        await expect(userName).toEqual(credentials.name);
        super.endStep();
    }

}
module.exports = new LoginPage();