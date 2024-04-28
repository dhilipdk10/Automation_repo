const assert = require('assert');

const Page = require('./page');
const NotificationCreationPage = require('../pageobjects/notification-creation.page');

class NotificationLandingPage extends Page {

    /* Element Selector Details */
    notificationId(notification_id) { return $('//table/tbody/tr/td[1]/a[text()="' + notification_id + '"]'); }
    userType(notification_id) { return $('//table/tbody/tr/td[1]/a[text()="' + notification_id + '"]/../../td[2]/ion-img'); }
    category(notification_id) { return $('//table/tbody/tr/td[1]/a[text()="' + notification_id + '"]/../../td[3]'); }
    status(notification_id) { return $('//table/tbody/tr/td[1]/a[text()="' + notification_id + '"]/../../td[8]'); }

    opts(notification_id) { return $('//table/tbody/tr/td[1]/a[text()="' + notification_id + '"]/../../td[9]/mat-icon') }
    get clone_btn() { return $('.//ion-item[contains(.,  "Clone")]') }
    get retry_btn() { return $('.//ion-item[contains(.,  "Retry")]') }
    get confirm_Retry_Btn() { return $('.//button/span[text()="Yes"]') }
    moreOptn(opts) { return $('.//ion-list/ion-item[' + opts + ']') }
    get moreOptns() { return $$('.//ion-list/ion-item') }
    get closePop() { return $('.//ion-popover/ion-list') }

    /* Function to perform Automation */
    async clickCreateNotificationButton() {
        super.startStep('Clicking on "Create Notification" Button');
        await super.clickButton('Create Notification');
        browser.pause(1000);
        super.endStep();
    }

    async addDetailsToEditAndClone(details) {
        if (details.edit) {
            details.edit.notification_id = details.notification_id;
            details.edit.type = details.type;
            details.edit.category = details.category;
        }
        if (details.clone) {
            details.clone.notification_id = details.notification_id;
            details.clone.type = details.type;
            details.clone.category = details.category;
        }
    }

    async validateCreatedNotification(details) {

        super.startStep(`The Notification Landing Page contains information for Notification ID "${details.notification_id}", including the following details:`);
        await expect(this.notificationId(details.notification_id)).toBeExisting();

        super.startStep(`The user type "${details.type}" corresponds to the one that was defined during the creation process.`);
        await expect(this.userType(details.notification_id).toHaveAttribute("title", details.type));
        if (details.category) {
            super.startStep(`The category named "${details.category}" corresponds to the one that was defined during the creation phase.`);
            await expect(this.category(details.notification_id).toHaveText(details.category));
        }

        if (details.schedule_type == "Save") {
            super.startStep(`As expected, the status of the notification is "CREATED".`);
            await expect(this.status(details.notification_id).toHaveText('CREATED'));
        } else if (details.schedule_type == 'Send Now') {
            super.startStep(`As expected, the status of the notification is "TRIGGERED".`);
            await expect(this.status(details.notification_id).toHaveText('TRIGGERED'));
        } else if (details.schedule_type == 'Send Later') {
            super.startStep(`As expected, the status of the notification is "SCHEDULED". `);
            await expect(this.status(details.notification_id).toHaveText('SCHEDULED'));
        }

        if (details.errorCode) {
            super.startStep(`As expected, the status of the notification is "FAILED". `);
            await expect(this.status(details.notification_id).toHaveText('FAILED'));
        }
        await super.takeScreenshot();
        super.endStep();
    }

    async viewNotificationHistory(details) {
        super.startStep(`Clicking on notification ID "${details.notification_id}" to view history`);
        await this.notificationId(details.notification_id).click();
        await browser.pause(1000);
        await browser.refresh();
        super.endStep();
    }

    async editNotification(details) {
        super.startStep(`Editing notification and ID is "${details.notification_id}" `);
        super.startStep(`Clicking on notification ID "${details.notification_id}" to edit saved notification`);
        await this.notificationId(details.notification_id).click();
        await browser.pause(500);

        super.endStep();
    }

    async cloneNotification(details) {
        super.startStep(`Clicking on notification ID "${details.notification_id}" to clone Notification`);
        await this.opts(details.notification_id).click();
        super.startStep(`Clicking on clone`);
        await this.clone_btn.click();
        await browser.pause(500);
        super.endStep();
    }

    async viewNotificationHistoryResult(details) {
        super.startStep(`The outcome view for Notification ID "${details.notification_id}" `);
        await browser.refresh();
        await this.notificationId(details.notification_id).click();
        await browser.pause(2000);
        await super.takeScreenshot();
        super.endStep();
    }

    async verifyRetryOption(details) {
        super.startStep(`verifying Retry option to the notification id : ${details.notification_id} in landing page`);
        await this.opts(details.notification_id).click();
        super.startStep(`Validating "Retry button" that should not available in moreVert`);
        var moreOptn = await this.moreOptns;
        for (let i = 0; i <= moreOptn.length - 1; i++) {
            let moreOptions = await this.moreOptn(i + 1).getText();
            assert.notStrictEqual(moreOptions, "Retry");
        }
        await super.takeScreenshot();
        await browser.keys(['Escape']);
        super.endStep();
    }
}

module.exports = new NotificationLandingPage();