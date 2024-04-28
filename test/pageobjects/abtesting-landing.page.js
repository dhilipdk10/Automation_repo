const Page = require('./page');
class ABTestingLandingPage extends Page {

    get abtesting() { return $('.//ion-item[contains(., "A/B testing")]') }

    get btnCreateABtesting() { return $('.//ion-button[contains(., "Create A/B testing")]') }

    abTestId(abTest_id) { return $('//table/tbody/tr/td[1]/a[text()="' + abTest_id + '"]'); }
    category(abTest_id) { return $('//table/tbody/tr/td[1]/a[text()="' + abTest_id + '"]/../../td[2]'); }
    audience(abTest_id) { return $('//table/tbody/tr/td[1]/a[text()="' + abTest_id + '"]/../../td[4]'); }
    status(abTest_id) { return $('//table/tbody/tr/td[1]/a[text()="' + abTest_id + '"]/../../td[6]'); }
    moreVert(abTest_id) { return $('//table/tbody/tr/td[1]/a[text()="' + abTest_id + '"]/../../td/mat-icon') }
    moreOptn(opts) { return $('.//ion-list/ion-item[' + opts + ']') }
    get clone() { return $('//ion-item[text()="Clone "]') }
    get edit() { return $('//ion-item[text()="Edit "]') }
    get retryOpt() { return $('.//ion-item[text() ="Retry "]') }
    get retry() { return $('.//ion-button/ion-label[text() ="Retry"]') }
    get confirmingRetrybtn() { return $('.//button/span[text() ="Yes"]') }

    async clickCreateABtestingButton() {
        super.startStep('Clicking on "Create A/B tseting" Button');
        await this.abtesting.click();
        await browser.pause(500);
        await super.clickButton('Create A/B testing');
        super.endStep();
    }
    async validateCreatedABtest(details) {
        super.startStep(`The A/B testing Landing Page contains information for A/B test ID "${details.abTest_id}", including the following details:`);
        await expect(this.abTestId(details.abTest_id)).toBeExisting();
        if (details.category) {
            super.startStep(`The category named "${details.category}" corresponds to the category that was defined during the creation phase.`);
            await expect(this.category(details.abTest_id).toHaveText(details.category));
        }

        super.startStep(`"${details.percentage}" corresponds to the audience % that was defined during the creation phase.`);
        await expect(this.audience(details.abTest_id).toHaveText(details.percentage));

        if (details.schedule_type == 'Send Now') {
            super.startStep(`As expected, the status of the A/B test notification is "TRIGGERED".`);
            await expect(this.status(details.abTest_id).toHaveText('TRIGGERED'));
        } else if (details.schedule_type == 'Schedule') {
            super.startStep(`As expected, the status of the A/B test notification is "SCHEDULED". `);
            await expect(this.status(details.abTest_id).toHaveText('SCHEDULED'));
        }
        if (details.errorCode) {
            super.startStep(`As expected, the status of the notification is "FAILED". `);
            await expect(this.status(details.abTest_id).toHaveText('FAILED'));
        }
        await super.takeScreenshot();
        super.endStep();
    }
    async viewAbTestResult(details) {
        super.startStep(`The outcome view for A/B test ID "${details.abTest_id}" `);
        await this.abTestId(details.abTest_id).click();
        await browser.pause(2000);
        await super.takeScreenshot();
        super.endStep();
    }
    async clickCloneABTesting(details) {
        super.startStep(`Cloning the existing  A/B test notification "${details.abTest_id}"`);
        await this.moreVert(details.abTest_id).click();
        await this.clone.click();
    }

    async editABTesting(details) {
        super.startStep(`Editing the A/B testing notification "${details.abTest_id}" details`);
        await this.moreVert(details.abTest_id).click();
        await this.edit.click();
    }
    async retryFailedNotification(details) {
        super.startStep(`Retrying Failed notification id ${details.abTest_id}`);
        super.startStep(`Clicking retry btn`);
        await this.retry.click();
        await this.confirmingRetrybtn.click();
        super.startStep(`Validating toaster message`);
        await super.validateToasterMessage('Retry initiated successfully');
        await super.takeScreenshot();

    }
    async verifyRetryOption(details) {
        super.startStep(`verifying Retry option to the notification id : ${details.abTest_id} in landing page`);
        await this.moreVert(details.abTest_id).click();
        super.startStep(`Validating retry button`);
        await expect(this.retryOpt.toHaveText("Retry"));
        super.startStep(`clicking retry button`);
        await this.retryOpt.click();
        super.startStep('confirming retry');
        await this.confirmingRetrybtn.click();
        super.startStep(`Validating toaster message`);
        await super.validateToasterMessage('Retry initiated successfully');
        await super.takeScreenshot();
        await browser.refresh();
        super.endStep();
    }
}
module.exports = new ABTestingLandingPage();