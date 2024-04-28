const assert = require('assert');
const Path = require('path');
const fs = require('fs');

const Page = require("./page");

class EmailValidation extends Page {
    get outLookEmail() { return $("//input[@type='email']") }
    get outLookPassword() { return $("//input[@type='password']") }
    get nextBtn() { return $("//input[@type='submit'][@value='Next']") }
    get signInBtn() { return $("//input[@type='submit'][@value='Sign in']") }
    get yesBtn() { return $("//input[@type='submit'][@value='Yes']") }

    get readMessage() { return $('//span[text()="Read / Unread"]') }
    emailTittle(from, subject, message) { return $(`//div[@data-app-section="MessageList"]//span[text()="${from}"]/../../following-sibling::div[@class="zht_v Q19mi"]/div/span[@title][text()="${subject}"]/../../following-sibling::div[@class="tAtdo XG5Jd"]/div/div/span[contains(.,"${message}")]`) }
    get fromAddressInViewMessage() { return $('//div[@data-app-section="ConversationContainer"]//div[@aria-label="Email message"]//div[@class="AvaBt"]//span') }
    get messageBody() { return $('//div[@data-app-section="ConversationContainer"]//div[@aria-label="Message body"]') }

    existingUrl = null;
    async loginOutlook(loginDetails, isNewTab = false) {
        if (isNewTab) {
            super.startStep(`Opening outlook office web:`);
            await browser.newWindow("https://outlook.office.com/mail");
            await browser.pause(2000);
        } else {
            this.existingUrl = await browser.getUrl();
            super.startStep(`Opening outlook office web:`);
            await browser.url("https://outlook.office.com/mail");
            await browser.pause(2000);
        }
        super.startStep(`Entering outlook credentials`);
        var url = await browser.getUrl();
        if (url.startsWith("https://login.microsoftonline.com/common/oauth2/authorize")) {
            super.startStep(`Entering email as ${loginDetails.email}`);
            await expect(this.outLookEmail).toBeExisting();
            await browser.pause(1000);
            await this.outLookEmail.setValue(loginDetails.email);
            await this.nextBtn.click();
            await super.takeScreenshot();

            super.startStep(`Entering password as *******`);
            await browser.pause(1000);
            await expect(this.outLookPassword).toBeExisting();
            await this.outLookPassword.setValue(loginDetails.password);
            await this.signInBtn.click();
            await super.takeScreenshot();

            super.startStep(`Clicking on login submit`);
            await browser.pause(1000);
            await expect(this.yesBtn).toBeExisting();
            await this.yesBtn.click();
        } else {
            super.startStep(`Outlook is already signedIn`);
        }
        await browser.pause(2000);
        super.endStep();
    }

    async openMessage(details) {
        super.startStep(`Clicking on email to view message`);
        await browser.pause(2000);
        await expect(this.emailTittle(details.from, details.subject, details.message)).toBeExisting();
        await this.emailTittle(details.from, details.subject, details.message).click();
        await expect(await this.fromAddressInViewMessage).toBeExisting();
        super.endStep();
    }

    async recivedEmailValidation(details) {
        await this.openMessage(details);
        await super.takeScreenshot();
        super.startStep(`Email content matches with actual input data`);
        await browser.pause(1000);
        await expect(this.messageBody).toBeExisting();
        assert.equal(details.body, await this.messageBody.getText());
        await super.takeScreenshot();
        super.endStep();
    }

    async compareImage(details) {
        await this.openMessage(details);

        await expect(this.messageBody).toBeExisting();
        super.startStep(`Compare email message as image Comparison`);
        var errorPercent = await browser.checkElement(await this.messageBody, 'Email_Message', {});
        super.addAttachment('Expected Email Body Image', fs.readFileSync(Path.join(process.cwd(), './baselineImages/desktop_chrome/Email_Message.png')), 'image/png');
        super.addAttachment('Actual Email Body Image', fs.readFileSync(Path.join(process.cwd(), './actualImages/actual/desktop_chrome/Email_Message.png')), 'image/png');

        if (errorPercent > 0) {
            var errorMsg = `Visual inconsistency detected; ${100 - errorPercent}% Matched and ${errorPercent}% not Matched`;
            super.addAttachment(errorMsg, fs.readFileSync(Path.join(process.cwd(), './actualImages/diff/desktop_chrome/Email_Message.png')), 'image/png');
            super.endStep("failed");
            throw errorMsg;
        }
        super.endStep();
    }

    async closeAndSwitchTab(isNewTab = false) {
        if (isNewTab) {
            var windowHandles = await browser.getWindowHandles();
            if (windowHandles.length > 1) {
                await super.takeScreenshot();
                super.startStep(`Closing outlook tab`);
                await browser.closeWindow();

                super.startStep(`Switching back to application tab`);
                var windowHandles = await browser.getWindowHandles();
                await browser.switchToWindow(windowHandles[0]);
                super.endStep();
            }
        } else {
            await browser.url(this.existingUrl);
        }


    }

    async getConfirmationCode(fromAddress) {
        await this.openMessage({ from: fromAddress, subject: "Your verification code", message: "Your confirmation code" });

        super.startStep(`Inspecting the code within the email message`, true);
        var text = await this.messageBody.getText();
        await browser.pause(2000);
        var confrimationCode = await text.substring(26, 32);
        await browser.pause(2000);
        await this.readMessage.click();
        super.endStep();
        return confrimationCode;
    }

    async getVerificationCode(fromAddress) {
        await this.openMessage({ from: fromAddress, subject: "Your verification code", message: "Your password reset code" });
        super.startStep(`Inspecting the code within the email message`, true);
        var text = await this.messageBody.getText();
        var verificationCode = await text.substring(28, 34);
        await this.readMessage.click();
        await browser.pause(2000);
        super.endStep();
        return verificationCode;
    }
}

module.exports = new EmailValidation();