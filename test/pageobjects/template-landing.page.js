const Page = require('./page');

class TemplateLandingPage extends Page {

    /* Function to perform Automation */

    get search() { return $('.//input[@placeholder="Search"]'); }

    get tableDetails() { return $$('//tbody//tr'); }
    templateName(name) { return $('//tbody//tr/td[2][normalize-space()="' + name + '"]'); }
    templateId(name) { return $('//tbody//tr/td[2][normalize-space()="' + name + '"]/../td[1]/a'); }
    categoryName(templateName) { return $('//tbody//tr/td[2][normalize-space()="' + templateName + '"]/../td[3]'); }
    clickMore(name) { return $('//tbody//tr/td[2][normalize-space()="' + name + '"]/../td[6]/mat-icon'); }
    get disable() { return $('.//ion-item[contains(.,  "Disable")]'); }
    get clickDisablebtn() { return $('.//span[contains(.,  "Disable")]'); }

    async clickCreateTemplateButton() {
        super.clickButton('Create Template');
    }

    async editTemplate(details) {
        super.startStep('Updating template');
        super.startStep(`Searching ${details.name} template's related ${details.categoryName} category`);
        await this.search.setValue(details.categoryName);
        await browser.pause(500);
        await this.templateId(details.name).click();
    }

    async validateTemplate(details) {
        super.startStep(`As expected the Template Landing Page contains information for the  "${details.categoryName}" category having "${details.name} Template" `);
        await this.search.setValue(details.name);
        await expect(this.templateName(details.name)).toHaveText(details.name, { ignoreCase: true });
        await expect(this.categoryName(details.name)).toHaveText(details.categoryName, { ignoreCase: true });
        await super.takeScreenshot();
        super.endStep();
    }

    async deleteTemplate(details) {
        super.startStep(`Deleting "${details.name}" template`);
        await this.search.setValue(details.categoryName);
        await browser.pause(500);
        let templateName = await super.getTextFromElement(this.templateName(details.name));
        if (details.name == templateName) {
            super.startStep(`The template "${details.name}" is being searched for deletion`);
            await this.clickMore(details.name).click();
            await expect(this.disable).toBeExisting();
            await this.disable.click();
            super.startStep(`Clicking on disable button to delete "${details.name}" template`);
            await browser.pause(500);
            await super.takeScreenshot();
            await this.clickDisablebtn.click();
            super.startStep('Confirming that the template have been deleted successfully by checking for a toaster message that reads "Template Disabled successfully!"');
            await super.validateToasterMessage('Template Disabled successfully!');
            await super.takeScreenshot(`Confirmation after deleting "${details.name}" template by toaster message`);
        }
        await this.search.clearValue();
        super.endStep()
    }
}

module.exports = new TemplateLandingPage();