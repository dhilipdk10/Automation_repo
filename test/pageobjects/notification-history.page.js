var assert = require('assert');
const Page = require('./page');
const NotificationFlowDB = require('../database/notification-flow-db');

class NotificationHistoryPage extends Page {

    get userStatisticsTitle() { return $('//h1[text()="User Statistics"]') }

    get userStatisticsDeliveredCount() { return $('ion-label[id="card-count-left"]') }
    get userStatisticsSubmittedCount() { return $('ion-label[id="card-count-right"]') }

    get deliveredDisplayCount() { return $('(.//div[@aria-live="polite"])[1]') }
    get queuedDeferredDisplayCount() { return $('(.//div[@aria-live="polite"])[2]') }

    get queuedDeferredTab() { return $('(//ion-segment-button)[1]') }
    get errorFailedTab() { return $('(//ion-segment-button)[3]') }

    get queuedCount() { return $('(//ion-segment-button)[1]//span') }
    get deferredCount() { return $('(//ion-segment-button)[2]//span') }
    get errorFailedCount() { return $('(//ion-segment-button)[3]//span') }
    get deliveredCount() { return $('(.//div[@aria-live="polite"])[1]') }

    get errorCode() { return $('(.//ion-row[@id="submittedErrorView"]//tbody//td[8])[1]') }
    get viewMoreIcon() { return $('(.//ion-row[@id="submittedErrorView"]//tbody//td/mat-icon)[1]') }
    get retryNotification() { return $('//ion-item[text()="Retry "]') }
    get clickRetry() { return $('//span[text()="Yes"]') }
    get retryNotificationCount() { return $('(.//ion-row[@id="submittedErrorView"]//tbody//td[9])[1]') }
    get clickViewReason() { return $('.//ion-item[text()="View Reason "]') }
    get errorCodeNotification() { return $('(//div[@class="err-content"]//div//div[3])[1]') }
    get close() { return $('//ion-label[text()="Close"]') }

    get getErrorMessage() { return $('(//div[@class="err-content"]//div//div[3])[2]') }
    get closeReason() { return $('.//ion-icon[@name="close-outline"]') }

    async validateHistory(details) {
        super.startStep(`Viewing History for the Notification Id "${details.notification_id}" in Summary Page`);
        var totalCount = 0;

        var queuedCount = 0;
        var deferredCount = 0;
        var errorFailedCount = 0;
        var deliveredCount = 0;

        let currentLoopCount = 0;
        let maxLoopCount = 3;
        let isMessageInTransit = false;
        while (details.notificationCount != totalCount) {
            if (maxLoopCount == currentLoopCount) {
                isMessageInTransit = true;
                super.startStep(`${details.notificationCount - totalCount} notification are in transit`);
                break;
            }

            if (currentLoopCount != 0) {
                await browser.pause(3000);
                await browser.refresh();
                await super.scrollIntoView(this.queuedDeferredTab);
            }
            await browser.pause(1000);
            queuedCount = Number((await this.queuedCount.getText() || '').replace(/\D/g, '')) || 0;
            deferredCount = Number((await this.deferredCount.getText() || '').replace(/\D/g, '')) || 0;
            errorFailedCount = Number((await this.errorFailedCount.getText() || '').replace(/\D/g, '')) || 0;
            deliveredCount = Number((await this.deliveredCount.getText() || '').split(' of ')[1]) || 0;
            totalCount = queuedCount + deferredCount + errorFailedCount + deliveredCount;
            currentLoopCount++;
        }

        await super.scrollIntoView(this.userStatisticsTitle);
        await browser.pause(500);
        var userStatisticsDeliveredCount = Number((await this.userStatisticsDeliveredCount.getText() || '').replace(/\D/g, '')) || 0;
        super.startStep(`Overall count of delivered notifications for user: "${userStatisticsDeliveredCount}"`, true);

        var userStatisticsSubmittedCount = Number((await this.userStatisticsSubmittedCount.getText() || '').replace(/\D/g, '')) || 0;
        super.startStep(`Overall count of submited notifications for user: "${userStatisticsSubmittedCount}"`, true);

        await super.takeScreenshot("Cumulative notification status for the user");

        super.startStep(`Viewing "Delivered" section`, true);
        await super.scrollIntoView(this.deliveredDisplayCount);
        await super.takeScreenshot(`Delivered Notificaiton Count : "${deliveredCount}"`);

        super.startStep(`Viewing "Deferred" section`, true);
        await browser.pause(1000);
        await super.scrollIntoView(this.queuedDeferredDisplayCount);
        await browser.pause(1000);
        await super.takeScreenshot(`Queued/Deferred Notificaiton Count : "${queuedCount}"`);

        super.startStep(`Viewing "Error/Failed" section`, true);
        await expect(this.errorFailedTab).toBeExisting();
        await this.errorFailedTab.click();
        await browser.pause(1000);

        await super.takeScreenshot(`Error/Failed Notificaiton Count : "${errorFailedCount}"`);

        if (errorFailedCount > 0) {
            if (details.errorCode) {
                super.startStep('Validating Error code', true);
                var errorCode = Number((await this.errorCode.getText() || '').replace(/\D/g, '')) || 0;
                super.startStep(`Received Error code is ${errorCode}`);
                assert.equal(details.errorCode, errorCode);
            }
            await browser.pause(1000);
            super.startStep(`Clicking on "view Reason"`, true);
            await this.viewMoreIcon.click();
            await this.clickViewReason.click();

            await browser.pause(1000);
            var errorMessage = await this.getErrorMessage.getText();
            super.startStep(`Error Message received as "${errorMessage}"`, true);

            var errorcodeNotification = await this.errorCodeNotification.getText();
            super.startStep(`Closing error reason window`, true);

            await super.takeScreenshot();
            await this.closeReason.click();

            if (errorcodeNotification != "ERR - 4001") {
                await browser.pause(1000);
                var retryCount = await this.retryNotificationCount.getText();
                super.startStep(` Retry notification count:"${retryCount}"`);
                await this.viewMoreIcon.click();
                super.startStep(`Clicking on "Retry notification"`, true);
                await this.retryNotification.click();
                await this.clickRetry.click();
                super.startStep('Confirming the successful creation of a notification by the toaster with a message that reads "Retry Initated Successfully"', true);
                await this.close.click();
                await browser.pause(1000);
                var retryCount = await this.retryNotificationCount.getText();
                super.startStep(`Retry notification count  "${retryCount}"`);
                super.startStep(`Closing retry notification window"`, true);
            }

            super.startStep('Retrieving the count of error notifications from the database');
            var errorCount = await NotificationFlowDB.get_errorNotificationCount(details.notification_id);
            // if (errorCount > 0) {
            //     throw { message: errorCount + " notifications is in error status in database" }
            // }
        }
        if (!isMessageInTransit) {
            super.startStep('Validating Delivered Notification count in database', true);
            assert.equal(deliveredCount, await NotificationFlowDB.get_deliveredNotificationCount(details.notification_id));

            super.startStep('Validating userStatisticsDeliveredCount Notification count in database', true);
            assert.equal(userStatisticsDeliveredCount, await NotificationFlowDB.get_statisticsDeliveredCount(details.notification_id));

            super.startStep('Validating userStatisticsSubmittedCount Notification count in database', true);
            assert.equal(userStatisticsSubmittedCount, await NotificationFlowDB.get_statisticsSubmittedCount(details.notification_id));

            super.startStep('Validating Queued Notification count in database', true);
            assert.equal(queuedCount, await NotificationFlowDB.get_queuedNotificationCount(details.notification_id));

            super.startStep('Validating Deffered Notification count in database', true);
            assert.equal(deferredCount, await NotificationFlowDB.get_deferredNotificationCount(details.notification_id));

            super.startStep('Validating Error Notification count in database', true);
            assert.equal(errorFailedCount, await NotificationFlowDB.get_errorNotificationCount(details.notification_id));
        }
        super.endStep();
    }
}

module.exports = new NotificationHistoryPage();