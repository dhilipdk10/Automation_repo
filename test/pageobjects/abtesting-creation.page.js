const Page = require('./page');
var assert = require('assert');
class ABtesting extends Page {
    get dotmobile() { return $('ion-img[class="mainLogo md hydrated"]') }

    get shouldReceive() { return $('(.//mat-select[@placeholder="-Select user segment-"])[1]'); }
    get shouldNotReceive() { return $('(.//mat-select[@placeholder="-Select user segment-"])[2]'); }
    get totalUserCount() { return $('span[name="circular"]'); }

    get category() { return $('mat-select[formcontrolname="category"]'); }
    get categoryText() { return $('(//mat-select[@placeholder="-Select Category-"])[2]') }

    get template() { return $('mat-select[formcontrolname="template"]'); }

    get channel() { return $('ion-select[formcontrolname="channel"]'); }
    get channelType() { return $('(//ion-select[@placeholder=" -Select Channels-"])[2]') }
    get templateText() { return $('(//mat-select[@placeholder="-Select Template-"])[2]') }
    get audienceCout() { return $('(//ion-input[@name="targetedAudience"])[2]') }

    get selectVariant_B() { return $('.//ion-label[contains(., "Variant B")]/..') }

    get scrolltomsg() { return $('.//ion-label[contains(., "2. Message")]') }

    get scrolltoschedule() { return $('.//ion-label[contains(., "4. Schedule")]') }
    get scrolltoabsetting() { return $('.//ion-label[contains(., "3. A/B Test Settings ")]') }
    get abtestingSetting() { return $('input[name="targetedAudience"]') }
    get sendNow() { return $('//ion-button/ion-label[contains(., "Send Now")]'); }

    get sendLater() { return $('//ion-label[text()="Send Later"]'); }

    get scheduletime() { return $('input[formcontrolname="scheduledStartDateTime"]'); }

    get schedulebtn() { return $('(.//ion-button[contains(., "Schedule")])[2]'); }
    get send() { return $('(//ion-button//ion-label[text()="Send Now"])[1]') }
    get save() { return $('(//ion-label[text()="Save"]/..)[1]') }
    get defaultChannel() { return $$('.//ion-select-popover//ion-list//ion-item') }

    selectChannels(channel) { return $('(.//ion-select-popover/ion-list//ion-item/ion-radio)[' + channel + ']'); }

    async createABtesting(details) {

        super.startStep('The process for creating A/B test will involve the following steps:');
        await expect(this.dotmobile).toBeExisting();


        if (details.includedSegments && details.includedSegments.length > 0) {
            super.startStep(`Choosing the audience who should receive based on rule "${details.includedSegments}"`, true);
            await super.searchableMultiSelectDropdownValue(this.shouldReceive, details.includedSegments);

        } else if (details.excludedSegments && details.excludedSegments.length > 0) {
            super.startStep(`Choosing the audience who should not receive based on rule "${details.excludedSegments}"`, true);
            await super.searchableMultiSelectDropdownValue(this.shouldNotReceive, details.excludedSegments);
        }

        super.startStep(`Validation for User Count`, true);
        await expect(this.totalUserCount).toBeExisting();
        const userCount = await this.totalUserCount.getText();
        assert.notEqual(userCount, 0, 'No user Matched for this segment');
        await super.takeScreenshot();

        await this.scrolltomsg.click();
        await browser.pause(1000);
        super.startStep(`Selecting Category as "${details.category}"`, true);
        await super.searchableDropdownValue(this.category, details.category, false);
        super.startStep(`Selecting Channel as "${details.channel}"`, true);
        if (details.channel && details.channel.length != 0) {
            await super.partialSelectSingleSelectValue(this.channel, details.channel);
        } else {
            await this.channel.click();
            await this.selectChannels(1).click();
            await browser.keys(['Escape']);
            await browser.pause(500);
        }
        await super.takeScreenshot();
        super.startStep(`Template for Variant A :"${details.variant_A}"`, true);
        await super.searchableDropdownValue(this.template, details.variant_A, false);
        super.startStep(`Template for Variant B :"${details.variant_B}"`, true);
        await this.selectVariant_B.click();
        await super.searchableDropdownValue(this.template, details.variant_B, false);
        await super.takeScreenshot();

        await this.scrolltoabsetting.click();
        await browser.pause(1000);
        await expect(this.scrolltoabsetting).toBeExisting();
        await browser.pause(1000);
        super.startStep(`The test distribution included ${details.percentage}% of the target audience`, true);
        await this.abtestingSetting.setValue(details.percentage);
        await browser.pause(1000);
        await super.takeScreenshot();

        await this.scrolltoschedule.click();
        super.startStep(`Selecting delivery type as "${details.schedule_type}"`, true);
        await browser.pause(500);
        if (details.schedule_type == 'Send Later') {
            super.startStep(`To be sent on "${details.scheduleTime}"`, true);
            await this.sendLater.click();
            await this.scheduletime.setValue(details.scheduleTime);
            await this.scrolltoschedule.click();
            await browser.pause(500);
        }
        browser.setupInterceptor();
        if (details.schedule_type == 'Send Later') {
            super.startStep('Clicking on "Schedule" Button', true);
            await this.schedulebtn.click();
        } else if (details.schedule_type == 'Save') {
            super.startStep('Clicking on "Save" Button', true);
            await this.save.click();
        } else {
            super.startStep('Clicking on "Send Now" Button', true);
            await super.clickButton("Send Now", true);
        }

        if (details.schedule_type == 'Send Later') {
            super.startStep('Confirming the successful creation of a notification by the toaster with a message that reads "A/B Testing Scheduled Successfully!"', true);
            await super.validateToasterMessage('A/B Testing Scheduled Successfully!');
        } else if (details.schedule_type == 'Save') {
            super.startStep('Confirming the successful creation of a notification by the toaster with a message that reads "A/B Testing Created Successfully!"', true);
            await super.validateToasterMessage('A/B Testing Created Successfully!');
        } else {
            super.startStep('Confirming the successful creation of a notification by the toaster with a message that reads "A/B Testing Initiated Successfully!"', true);
            await super.validateToasterMessage('A/B Testing Initiated Successfully!');
        }
        await super.takeScreenshot();


        var createApi = await browser.getRequest(0);
        if (details.schedule_type == 'Send Later') {
            assert.equal(createApi.response.statusCode, details.schedule_type == 'Send Later' ? 202 : 201);
            details.abTest_id = createApi.response.body.id;
            super.startStep(`A/B test is Successfully Created with ID = "${details.abTest_id}"`, true);

        } else if (details.schedule_type == 'Save') {
            assert.equal(createApi.response.statusCode, details.schedule_type == 'Save' ? 202 : 201);
            details.abTest_id = createApi.response.body.id;
            super.startStep(`A/B test is Successfully Created with ID = "${details.abTest_id}"`, true);
        } else {
            assert.equal(createApi.response.statusCode, details.schedule_type == 'Send Now' ? 201 : 202);
            details.abTest_id = createApi.response.body.id;
            super.startStep(`A/B test is Successfully Created with ID = "${details.abTest_id}"`, true);
        }
        await browser.disableInterceptor();
        await browser.pause(500);
        await super.takeScreenshot();

        super.endStep();
    }
    async verifyDetailsAndClone(details) {
        super.startStep('Validating the deatils of the A/B test');
        if (details.includedSegments) {
            super.startStep(`As expected, includedSegments "${details.includedSegments}" is filled`);
            await expect(this.shouldReceive.toHaveText(details.includedSegments));
        } else {
            super.startStep(`As expected, excludedSegments "${details.excludedSegments}" is filled`);
            await expect(this.shouldNotReceive.toHaveText(details.excludedSegments));
        }
        await this.scrolltomsg.click();
        super.startStep(`As expected, category "${details.category}" is populated`);
        await expect(this.categoryText.toHaveText(details.category));
        super.startStep(`As expected, channel "${details.channel}" is populated`);
        await expect(this.channelType.toHaveText(details.channel));
        await this.scrolltomsg.click();
        super.startStep(`As expected, Variant A has "${details.variant_A}" template filled`);
        await expect(this.templateText.toHaveText(details.variant_A));
        await this.selectVariant_B.click();
        super.startStep(`As expected, Variant B has "${details.variant_B}" template filled`);
        await expect(this.templateText.toHaveText(details.variant_B));
        super.startStep(`As expected, Audience percentage has "${details.percentage}" percentage filled`);
        await expect(this.abtestingSetting.toHaveText(details.percentage));
        await browser.pause(2000);
        await this.scrolltoschedule.click();
        if (this.schedulebtn) {
            await browser.pause(1000);
            super.startStep('Clicking on "Save" Button', true);
            await this.schedulebtn.click();
        } else {
            await browser.pause(1000);
            super.startStep('Clicking on "Send Now" Button', true);
            await this.send.click();
        }
    }

    async editABTestDetails(details) {
        super.startStep('The process for edit A/B test will involve the following steps:');
        await expect(this.dotmobile).toBeExisting();
        if (details.includedSegments || details.excludedSegments) {
            if (details.includedSegments && details.includedSegments.length > 0) {
                super.startStep(`Choosing the audience who should receive based on rule "${details.includedSegments}"`, true);
                await super.searchableMultiSelectDropdownValue(this.shouldReceive, details.includedSegments);

            } else if (details.excludedSegments && details.excludedSegments.length > 0) {
                super.startStep(`Choosing the audience who should not receive based on rule "${details.excludedSegments}"`, true);
                await super.searchableMultiSelectDropdownValue(this.shouldNotReceive, details.excludedSegments);
            }
            super.startStep(`Validation for User Count`, true);
            await expect(this.totalUserCount).toBeExisting();
            const userCount = await this.totalUserCount.getText();
            assert.notEqual(userCount, 0, 'No user Matched for this segment');
            await super.takeScreenshot();
        }

        await this.scrolltomsg.click();
        await browser.pause(1000);
        if (details.category) {
            super.startStep(`Selecting Category as "${details.category}"`, true);
            await browser.pause(1000);
            await super.searchableDropdownValue(this.category, details.category, false);
        }
        if (details.channel) {
            super.startStep(`Selecting Channel as "${details.channel}"`, true);
            if (details.channel && details.channel.length != 0) {
                await super.partialSelectSingleSelectValue(this.channel, details.channel);
            } else {
                await this.channel.click();
                await this.selectChannels(1).click();
                await browser.keys(['Escape']);
                await browser.pause(500);
            }
        }
        await super.takeScreenshot();
        if (details.variant_A && details.variant_B) {
            super.startStep(`Template for Variant A :"${details.variant_A}"`, true);
            await super.searchableDropdownValue(this.template, details.variant_A, false);
            super.startStep(`Template for Variant B :"${details.variant_B}"`, true);
            await this.selectVariant_B.click();
            await super.searchableDropdownValue(this.template, details.variant_B, false);
        }
        await super.takeScreenshot();

        await this.scrolltoabsetting.click();
        await browser.pause(1000);
        await expect(this.scrolltoabsetting).toBeExisting();
        await browser.pause(1000);
        if (details.percentage != null) {
            super.startStep(`The test distribution included ${details.percentage}% of the target audience`, true);
            await this.abtestingSetting.setValue(details.percentage);
        }
        await browser.pause(1000);
        await super.takeScreenshot();

        await this.scrolltoschedule.click();
        super.startStep(`Selecting delivery type as "${details.schedule_type}"`, true);
        await browser.pause(500);
        if (details.schedule_type == 'Send Later') {
            super.startStep(`To be sent on "${details.scheduleTime}"`, true);
            await this.sendLater.click();
            await this.scheduletime.setValue(details.scheduleTime);
            await this.scrolltoschedule.click();
            await browser.pause(500);
        }
        browser.setupInterceptor();
        if (details.schedule_type == 'Send Later') {
            super.startStep('Clicking on "Schedule" Button', true);
            await this.save.click();
        } else {
            super.startStep('Clicking on "Send Now" Button', true);
            await this.save.click();
        }

        if (details.schedule_type == 'Send Later') {
            super.startStep('Confirming the successful creation of a notification by the toaster with a message that reads "Notification Scheduled Successfully!"', true);
            await super.validateToasterMessage('A/B Testing Scheduled Successfully!');
        } else if (details.schedule_type == 'Save') {
            super.startStep('Confirming the successful creation of a notification by the toaster with a message that reads "Notification Created Successfully!"', true);
            await super.validateToasterMessage('A/B Testing Updated Successfully!');
        }
        await super.takeScreenshot();

        var createApi = await browser.getRequest(0);
        if (details.schedule_type == 'Send Later') {
            assert.equal(createApi.response.statusCode, details.schedule_type == 'Send Later' ? 202 : 201);
            details.abTest_id = createApi.response.body.id;
            super.startStep(`A/B test is Successfully Created with ID = "${details.abTest_id}"`, true);

        } else if (details.schedule_type == 'Save') {
            assert.equal(createApi.response.statusCode, details.schedule_type == 'Save' ? 200 : 202);
            details.abTest_id = createApi.response.body.id;
            super.startStep(`A/B test is Successfully Created with ID = "${details.abTest_id}"`, true);
        } else {
            assert.equal(createApi.response.statusCode, details.schedule_type == 'Send Now' ? 201 : 202);
            details.abTest_id = createApi.response.body.id;
            super.startStep(`A/B test is Successfully Created with ID = "${details.abTest_id}"`, true);
        }
        await super.takeScreenshot();
        await browser.disableInterceptor();
        await browser.pause(500);
        await super.takeScreenshot();

        super.endStep();
    }
}

module.exports = new ABtesting();