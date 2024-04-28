const assert = require('assert');

const Page = require('./page');
class ErrorBaseLine extends Page {
    opts(notification_id) { return $('//table/tbody/tr/td[4]/a[text()="' + notification_id + '"]/../../td[13]/mat-icon') }
    moreOptn(opts) { return $('.//ion-list/ion-item[' + opts + ']') }
    get moreOptns() { return $$('.//ion-list/ion-item') }

    get error() { return $('//ion-label[text()=" Error "]/..') }
    get notificationId() { return $('//input[@placeholder="Notification ID"]'); }
    get searchNotification() { return $('//ion-label[text()="Search"]') }
    get viewMoreIcon() { return $('(.//tbody//td/mat-icon)[1]') }
    get retryNotification() { return $('//ion-item[text()="Retry "]') }
    get clickRetry() { return $('//span[text()="Yes"]') }
    get retryNotificationCount() { return $('(.//tbody//td[9])[1]') }
    get clickViewReason() { return $('.//ion-item[text()="View Error Message "]') }
    get errorCodeNotification() { return $('(//div[@class="err-content"]//div//div[3])[1]') }
    get close() { return $('//ion-label[text()="Close"]') }
    get getErrorMessage() { return $('(//div[@class="err-content"]//div//div[3])[2]') }
    get closeReason() { return $('.//ion-modal//ion-icon[@name="close-outline"]') }

    async errorBaseLine(details) {
        await browser.pause(1000);
        await this.error.click();
        super.startStep(`Viewing Error baseLine for the Notification Id "${details.notification_id}" in Error Page`);
        await browser.pause(1000);
        await expect(this.notificationId).toBeExisting();
        if (details.notification_id) {
            super.startStep(`Entering the Notification Id : "${details.notification_id}" to search it`);
            await this.notificationId.setValue(details.notification_id);
        } else {
            super.startStep(`Entering the A/B test Id : "${details.abTest_id}" to search it`);
            await this.notificationId.setValue(details.abTest_id);
        }
        await browser.pause(2000);
        await this.searchNotification.click();
        await browser.pause(2000);
        await expect(this.viewMoreIcon).toBeExisting();
        super.startStep(`Clicking on view more option on the searched notification id`);
        await this.viewMoreIcon.click();
        super.startStep(`Clicking on view reason option on the searched notification id`);
        await this.clickViewReason.click();
        await browser.pause(1000);
        var errorMessage = await this.getErrorMessage.getText();
        super.startStep(`Error Message received as "${errorMessage}"`, true);

        var errorcodeNotification = await this.errorCodeNotification.getText();
        await super.takeScreenshot();

        super.startStep(`Closing error reason window`, true);
        await this.closeReason.click();

        if (errorcodeNotification == "ERR-4001" || errorcodeNotification == "ERR-3002" || errorcodeNotification == "ERR-3001") {
            super.startStep(`Verifying whether "Retry" option is not available to the notification id : ${details.notification_id} in error page`);
            await this.opts(details.notification_id).click();
            super.startStep(`As expected "Retry button" is not available for the notification id`);
            var moreOptn = await this.moreOptns;
            for (let i = 0; i <= moreOptn.length - 1; i++) {
                let moreOptions = await this.moreOptn(i + 1).getText();
                assert.notStrictEqual(moreOptions, "Retry");
            }
            await super.takeScreenshot();
            await browser.refresh();
            super.endStep();
        }
        else {
            await browser.pause(2000);
            var retryCount = await this.retryNotificationCount.getText();
            super.startStep(`Retry notification count is "${retryCount}" before retrying it`);
            super.startStep(`Clicking on view more option on the searched notification id`);
            await this.viewMoreIcon.click();
            super.startStep(`Clicking on "Retry notification" option`, true);
            await this.retryNotification.click();
            await this.clickRetry.click();
            super.startStep('Confirming the successful retry of a notification by the toaster with a message that reads "Retry Initated Successfully"', true);
            await this.close.click();
            await browser.pause(1000);
            var retryCount = await this.retryNotificationCount.getText();
            super.startStep(`Retry notification count is "${retryCount}" after retrying it`);
            super.startStep(`Closing retry notification window"`, true);
            super.endStep();
        }
    }
}
module.exports = new ErrorBaseLine();