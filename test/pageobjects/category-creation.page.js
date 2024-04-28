const Page = require('./page');
const AdminConfigDB = require('../database/admin-config-db');

class CategoryCreationPage extends Page {

    /* Element Selector Details */
    get categoryDetailsLbl() { return $('.//h1[text()="Category Details"]'); }

    get name() { return $('input[name="name"]'); }
    get priority() { return $('ion-select[formcontrolname="priority"]'); }
    get description() { return $('textarea'); }
    get ratelimit() { return $('.//div[contains(., "Rate Limit")]/following-sibling::ion-row//ion-select'); }
    get ratelimitValue() { return $('.//div[contains(., "Rate Limit")]/following-sibling::ion-row//ion-input/input'); }
    get timetolive() { return $('ion-input[formcontrolname="timetoliveLimit"] input'); }

    /* Function to perform Automation */
    async fillCategoryDetails(details) {

        super.startStep("Loading category creation page");
        await expect(this.categoryDetailsLbl).toBeExisting();
        await browser.pause(1000);

        super.startStep(`Entering name as "${details.name}"`);
        await expect(this.name).toBeExisting();
        await this.name.setValue(details.name);

        super.startStep(`Selecting priority as "${details.priority}"`);
        await super.selectDropdownValue(this.priority, details.priority);
        if (details.description) {
            super.startStep(`Entering description as "${details.description}"`);
            await this.description.setValue(details.description);
        }
        if (details.priority == "Medium" || details.priority == "Low") {
            if (details.rateLimit) {
                super.startStep(`Selecting RateLimit as "${details.rateLimit}" and value is "${details.rateLimitValue}"`);
                await super.selectDropdownValue(this.ratelimit, details.rateLimit);
                await this.ratelimitValue.setValue(details.rateLimitValue);
            }
        }
        if (details.ttl) {
            super.startStep(`Entering TimeToLive as "${details.ttl}"`);
            await this.timetolive.setValue(details.ttl);
        }
        await super.takeScreenshot();
        super.startStep('Clicking on "save" button to save category')
        await super.clickButton('Save');
        super.startStep('Confirming that Category has been created successfully by checking toaster message that reads "Category Created Successfully"')
        await super.validateToasterMessage('Category Created Successfully!');
        await super.takeScreenshot();

        super.startStep(`Validating whether Category is created in the database with name ${details.name}`)
        await expect(await AdminConfigDB.validate.isCategoryExists(details.name)).toEqual(true);

        super.endStep();
    }

    async updateCategoryDetails(details) {
        super.startStep("Loading category Update page");
        await expect(this.categoryDetailsLbl).toBeExisting();
        super.startStep(`Priority has been updated to "${details.priority}"`);
        await super.selectDropdownValue(this.priority, details.priority);
        if (details.description) {
            super.startStep(`Description has been updated to "${details.description}"`);
            await this.description.setValue(details.description);
        }
        if (details.priority == "Medium" || details.priority == "Low") {
            if (details.rateLimit) {
                super.startStep(`Ratelimit has been updated to "${details.rateLimitValue}" "${details.rateLimit}". `);
                await super.selectDropdownValue(this.ratelimit, details.rateLimit);
                await this.ratelimitValue.setValue(details.rateLimitValue);
            }
        }
        if (details.ttl) {
            super.startStep(`TimeToLive has been updated to "${details.ttl}"`);
            await this.timetolive.setValue(details.ttl);
        }
        await super.takeScreenshot(`Updated category details`);

        super.startStep('Clicking on "save" button to update category');
        await super.clickButton('Save');

        super.startStep('Conforming that category details have been successfully updated by checking the toaster message that reads "Category Updated Successfully!"');
        await super.validateToasterMessage("Category Updated Successfully!");
        await super.takeScreenshot();
        super.endStep();
    }

}
module.exports = new CategoryCreationPage();