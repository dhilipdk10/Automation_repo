var assert = require('assert');
const Page = require('./page');
const { title } = require('process');
class NotificationCreationPage extends Page {

    /* Element Selector Details */
    get notificationDetailsTitleLable() { return $('ion-title=Notification Details'); }
    get userId() { return $('ion-input[formcontrolname="Id"] input'); }
    get multipleUser() { return $('.//div/ion-label[contains(.,"Multiple User")]'); }
    get shouldReceive() { return $('(.//mat-select[@placeholder="-Select user segment-"])[1]'); }
    get shouldNotReceive() { return $('(.//mat-select[@placeholder="-Select user segment-"])[2]'); }
    get totalUserCount() { return $('span[name="circular"]'); }
    get category() { return $('mat-select[formcontrolname="category"]'); }
    get template() { return $('mat-select[formcontrolname="template"]'); }
    get channel() { return $('ion-select[formcontrolname="channel"]'); }
    get sendLater() { return $('//ion-label[text()="Send Later"]'); }
    get scheduletime() { return $('input[formcontrolname="scheduledStartDateTime"]'); }
    get schedulebtn() { return $('(.//ion-button[contains(., "Schedule")])[2]'); }

    get customtemplate() { return $('.//div/ion-label[contains(.,"Custom")]'); }
    get custom_title() { return $('ion-input[formcontrolname="title"] input'); }
    get custom_body() { return $('ion-textarea[formcontrolname="body"] textarea'); }

    get clickPreviewbtn() { return $('ion-select[placeholder="-Select Channel-"]') }
    get clickSelectChannelInPreviewbtn() { return $('.//ion-item//ion-label[text()="Email"]/following-sibling::ion-radio') }
    get clickUpload() { return $('.ql-image'); }
    get custom_image() { return $('//ion-input[@name="url"]//input'); }
    get saveCustom_image() { return $('//app-quill-editor-image-select//ion-label[text()="Save"]') }

    get clickActionForWebPush() { return $('.//ion-select[contains(@aria-label, "Web Push")]') }
    get custom_clickaction() { return $('//ion-item//ion-label[contains(., "Click Action")]/../ion-input/input'); }
    get audienceScroll() { return $('.//ion-label[contains(., " 1. Audience ")]') }
    get messageScroll() { return $('.//ion-label[contains(., "2. Message")]') }
    get scheduleScroll() { return $('.//ion-label[contains(., "3. Schedule")]') }
    get imageText() { return $('.//ion-item//ion-label[contains(., "Image")]') }


    /* Function to perform Automation */
    async createNotification(details) {
        await browser.refresh();
        super.startStep('The process for creating a notification will involve the following steps:');
        await expect(this.notificationDetailsTitleLable).toBeExisting();

        if (details.type == 'Single User') {
            if (details.userId) {
                super.startStep(`Entering UserId as"${details.userId}"`, true);
                await this.userId.setValue(details.userId);

            }
        } else {
            super.startStep(`Selecting Audience Details as"${details.type}"`, true);
            if (details.includedSegments || details.excludedSegments) {
                await this.multipleUser.click();
                if (details.includedSegments && details.includedSegments.length > 0) {
                    super.startStep(`Selecting who should receive this notification as "${details.includedSegments}"`, true);
                    await super.searchableMultiSelectDropdownValue(this.shouldReceive, details.includedSegments);

                } else if (details.excludedSegments && details.excludedSegments.length > 0) {
                    super.startStep(`Selecting who should not receive this notification as "${details.excludedSegments}"`, true);
                    await super.searchableMultiSelectDropdownValue(this.shouldNotReceive, details.excludedSegments);
                }

                super.startStep(`Validation on User Count`, true);
                await expect(this.totalUserCount).toBeExisting();
                const userCount = await this.totalUserCount.getText();
                assert.notEqual(userCount, 0, 'No user Matched for this segment');
            }
        }

        await super.takeScreenshot();

        await this.messageScroll.click();
        await browser.pause(500);
        if (details.messageType == 'Template') {
            super.startStep('Selecting template as Message type', true);
            if (details.category) {
                super.startStep(`Selecting Category as "${details.category}"`, true);
                await super.searchableDropdownValue(this.category, details.category);
                await browser.pause(1000);

            }
            if (details.template) {
                super.startStep(`Selecting Template as "${details.template}"`, true);
                await super.searchableDropdownValue(this.template, details.template);

            }
            if (details.channels) {
                super.startStep(`Selecting Channels as "${details.channels}"`, true);
                await super.partialSelectMultiSelectValue(this.channel, details.channels);

            }
            details.notificationCount = await this.getNotificationCount(details);
        } else {
            super.startStep('Selecting custom as message type', true);
            await this.customtemplate.click();

            if (details.category) {
                super.startStep(`Selecting Category as "${details.category}"`, true);
                await super.searchableDropdownValue(this.category, details.category);

            }
            if (details.channels) {
                super.startStep(`Selecting Channels as "${details.channels}"`, true);
                await super.partialSelectMultiSelectValue(this.channel, details.channels);
            }
            details.notificationCount = await this.getNotificationCount(details);


            if (details.channels.includes('Email') || details.channels.includes('Web Push') || details.channels.includes('Mobile Push')) {
                super.startStep('Entering customized title for above selected channels', true);
                await this.custom_title.setValue(details.title);

                super.startStep('Entering customized message body for above selected channels', true);
                await this.custom_body.setValue(details.body);


                if (details.image && details.channels.includes('Email')) {
                    super.startStep('Entering customized image for above selected channels', true);
                    await this.clickPreviewbtn.click();
                    await this.clickSelectChannelInPreviewbtn.click();
                    await browser.pause(1000);
                    await this.clickUpload.click();
                    await this.custom_image.setValue(details.image);

                    await this.saveCustom_image.click();
                }
                await super.takeScreenshot();
            } else if (details.channels.includes('SMS')) {
                super.startStep('Entering customized message body for above selected channels', true);
                await this.custom_body.setValue(details.body);

            }

            if (details.channels.includes('Web Push') || details.channels.includes('Mobile Push')) {
                if (details.click_action) {
                    super.startStep('Entering customized click action item for above selected channels', true);
                    await super.scrollIntoView(this.custom_clickaction);
                    await this.custom_clickaction.setValue(details.click_action);//TODO: Enter click action

                }
            }
        }
        await super.takeScreenshot();

        await this.schedule_Notification(details);

        super.endStep();
    }

    async verifyingDetailsOfCreatedNotification(details) {
        await browser.refresh();
        super.startStep('Verifying the field values of  notification will involve the following steps:');
        await expect(this.notificationDetailsTitleLable).toBeExisting();

        if (details.type == 'Single User') {
            super.startStep(`UserId "${details.userId}" is same as given while creating`, true);
            await expect(this.userId.toHaveText(details.userId));
        } else {
            super.startStep(`Audience Details "${details.type}" is same as given while creating`, true);
            await this.multipleUser.click();
            if (details.includedSegments && details.includedSegments.length > 0) {
                super.startStep(`verifying who should receive this notification as "${details.includedSegments}"`, true);
                await expect(this.shouldReceive.toHaveText(details.includedSegments));

            } else if (details.excludedSegments && details.excludedSegments.length > 0) {
                super.startStep(`Verifying who should not receive this notification as "${details.excludedSegments}"`, true);
                await expect(this.shouldNotReceive.toHaveText(details.excludedSegments));
            }

            super.startStep(`Validation on User Count`, true);
            await expect(this.totalUserCount).toBeExisting();
            const userCount = await this.totalUserCount.getText();
            assert.notEqual(userCount, 0, 'No user Matched for this segment');

        }

        await super.takeScreenshot();

        await this.messageScroll.click();
        await browser.pause(500);
        if (details.messageType == 'Template') {
            super.startStep(`Category "${details.category}" is same as given while creating`, true);
            await expect(this.category.toHaveText(details.category));
            await browser.pause(1000);

            super.startStep(`Template "${details.template}" is same as given while creating`, true);
            await expect(this.template.toHaveText(details.template));

            super.startStep(`Channels "${details.channels}" is same as given while creating`, true);
            await expect(this.channel.toHaveText(details.channels));

            details.notificationCount = await this.getNotificationCount(details);
        } else {
            super.startStep('Selecting custom as message type', true);
            await this.customtemplate.click();

            super.startStep(`Category "${details.category}" is same as given while creating`, true);
            await expect(this.category.toHaveText(details.category));

            super.startStep(`Channels "${details.channels}" is same as given while creating`, true);
            await expect(this.channel.toHaveText(details.channels));

            details.notificationCount = await this.getNotificationCount(details);

            if (details.channels.includes('Email') || details.channels.includes('Web Push') || details.channels.includes('Mobile Push')) {
                super.startStep(`Title "${details.title}" for ${details.channels} is same as given while creating`, true);
                await expect(this.custom_title.toHaveText(details.title));

                super.startStep('Customized message body for above selected channels is same as given while creating', true);
                await expect(this.custom_body.toHaveText(details.body));

                if (details.channels.includes('Web Push') || details.channels.includes('Mobile Push')) {
                    await super.scrollIntoView(this.custom_clickaction);
                    super.startStep(`Customized click_action for ${details.channels} channel is same as given while creating`, true);
                    await expect(this.custom_clickaction.toHaveText(details.click_action));
                    super.startStep(`Customized image url for ${details.channels} channel is same as given while creating`, true);
                    await expect(this.imageText.toHaveText(details.image));
                }
                await super.takeScreenshot();
            } else {
                super.startStep(`Customized message body for "${details.channels}" channel is same as given while creating`, true);
                await expect(this.custom_body.toHaveText(details.body));

            }
        }
        await this.scheduleScroll.click();
        if (details.schedule_type == "Send Later") {
            super.startStep("Notificaiton is in schedule type", true);
            await this.scheduleScroll.click();
            super.startStep(`Scheduled time "${details.scheduleTime}" is same as given while creating`)
        } else {
            super.startStep("Notificaiton is in immediate trigger type", true);
        }
        await super.takeScreenshot();
        await this.audienceScroll.click();
        super.endStep();
    }

    async schedule_Notification(details) {
        super.startStep(`Selecting delivery type as "${details.schedule_type}"`, true);
        await this.scheduleScroll.click();
        await browser.pause(500);

        browser.setupInterceptor();
        if (details.schedule_type == "Save") {
            super.startStep('Clicking on "Save" Button', true);
            await super.clickButton("Save", true);

            super.startStep('Confirming the successful creation of a notification by the toaster with a message that reads "Notification Created Successfully!"', true);
            await super.validateToasterMessage('Notification Created Successfully!');
        } else if (details.schedule_type == 'Send Later') {
            super.startStep(`To be sent on "${details.scheduleTime}"`, true);
            await expect(this.scheduleScroll).toBeExisting();
            await this.sendLater.click();
            await this.scheduletime.setValue(details.scheduleTime);
            await this.scheduleScroll.click();
            await browser.pause(500);

            super.startStep('Clicking on "Schedule Button"', true);
            await this.schedulebtn.click();

            super.startStep('Confirming the successful creation of a notification by the toaster with a message that reads "Notification Scheduled Successfully!"', true);
            await super.validateToasterMessage('Notification Scheduled Successfully!');
        } else {
            super.startStep('Clicking on "Send Now" Button', true);
            await super.clickButton("Send Now", true);

            super.startStep('Confirming the successful creation of a notification by the toaster with a message that reads "Notification Initiated Successfully!"', true);
            await super.validateToasterMessage('Notification Initiated Successfully!');
        }

        var createApi = await browser.getRequest(0);
        assert.equal(createApi.response.statusCode, details.schedule_type == "Send Later" || details.schedule_type == "Save" ? 202 : 201);
        details.notification_id = createApi.response.body.id;

        await browser.disableInterceptor();

        super.endStep();
    }

    async getNotificationCount(details) {
        var notificationCount = 0;
        if (details.type == 'Single User') {
            notificationCount = details.channels.length; //TODO: need to get count from DB
        } else {
            var selectedChannelDetails = await (await this.channel).shadow$('div.select-text').getText();
            selectedChannelDetails.split(")").forEach(data => {
                notificationCount += Number(data.split(" - ")[1]) || 0;
            });
        }
        super.startStep(`Expected notification count across channel is "${notificationCount}"`, true);
        return notificationCount;
    }

}
module.exports = new NotificationCreationPage();