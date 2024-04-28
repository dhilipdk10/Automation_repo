const Page = require('./page');
class ABtesting extends Page {
    get dotmobile() { return $('ion-img[class="mainLogo md hydrated"]') }

    get abtesting() { return $('.//ion-item[contains(., "A/B testing")]') }

    get btnCreateABtesting() { return $('.//ion-button[contains(., "Create A/B testing")]') }

    get shouldReceive() { return $('(.//mat-select[@placeholder="-Select user segment-"])[1]'); }
    get shouldNotReceive() { return $('(.//mat-select[@placeholder="-Select user segment-"])[2]'); }

    get category() { return $('mat-select[formcontrolname="category"]'); }

    get template() { return $('mat-select[formcontrolname="template"]'); }

    get channel() { return $('ion-select[formcontrolname="channel"]'); }

    get selectVariant_B() { return $('.//ion-label[contains(., "Variant B")]/..') }

    get scrolltomsg() { return $('.//ion-label[contains(., "2. Message")]') }

    get scrolltoschedule() { return $('.//ion-label[contains(., "4. Schedule")]') }
    get scrolltoabsetting() { return $('.//ion-label[contains(., "3. A/B Test Settings ")]') }
    get abtestingSetting() { return $('input[name="targetedAudience"]') }
    get sendNow() { return $('//ion-button/ion-label[contains(., "Send Now")]'); }

    get sendLater() { return $('//ion-label[text()="Send Later"]'); }

    get scheduletime() { return $('input[formcontrolname="scheduledStartDateTime"]'); }

    get schedulebtn() { return $('(.//ion-button[contains(., "Schedule")])[2]'); }

    get defaultChannel() { return $$('.//ion-select-popover//ion-list//ion-item') }

    selectChannels(channel) { return $('(.//ion-select-popover/ion-list//ion-item/ion-radio)[' + channel + ']'); }

    async createABtesting(details) {
        await this.abtesting.click();
        await this.btnCreateABtesting.click({ skipRelease: true });
        await browser.pause(1000);

        if (details.includedSegments.length > 0) {
            await super.searchableMultiSelectDropdownValue(this.shouldReceive, details.includedSegments);
        } else if (details.excludedSegments.length > 0) {
            await super.searchableMultiSelectDropdownValue(this.shouldNotReceive, details.excludedSegments);
        }

        await this.scrolltomsg.click();
        await browser.pause(1000);
        await super.searchableDropdownValue(this.category, details.category, false);
        await browser.pause(2000);
        if (details.channel && details.channel.length != 0) {
            await super.partialSelectSingleSelectValue(this.channel, details.channel);
        } else {
            await this.channel.click();
            await this.selectChannels(1).click();
            await browser.keys(['Escape']);
            await browser.pause(500);
        }
        await super.searchableDropdownValue(this.template, details.variant_A, false);
        await browser.pause(1000);
        await this.selectVariant_B.click();
        await browser.pause(1000);
        await super.searchableDropdownValue(this.template, details.variant_B, false);
        await browser.pause(1000);

        await this.scrolltoabsetting.click();
        await browser.pause(1000);
        await expect(this.scrolltoabsetting).toBeExisting();
        await browser.pause(2000);
        await this.abtestingSetting.setValue(details.percentage);
        await browser.pause(1000);

        await this.scrolltoschedule.click();
        if (details.schedule == 'Send Later') {
            await this.sendLater.click();
            await browser.pause(2000);
            await this.scheduletime.setValue(details.scheduledStartDateTime);
            await browser.pause(1000);
            await this.scrolltoschedule.click();
            await browser.pause(1000);
            await browser.takeScreenshot();
            await this.schedulebtn.click();
            await browser.takeScreenshot();
            await browser.pause(1000);
        } else {
            await super.button('Send Now').click();
            await browser.pause(1000);
        }
    }
}
module.exports = new ABtesting();