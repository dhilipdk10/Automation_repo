const Page = require('./page');

class CategoryLandingPage extends Page {

    get categoryPriority() { return $('//section/table/tbody/tr[1]/td[3]'); }

    get search() { return $('.//input[@placeholder="Search"]') }
    categoryId(categoryName) { return $('//table/tbody/tr/td[2][normalize-space()="' + categoryName + '"]/../td[1]/a'); }
    categoryName(categoryName) { return $('//table/tbody/tr/td[2][normalize-space()="' + categoryName + '"]'); }
    clickMore(categoryName) { return $('//table/tbody/tr/td[2][normalize-space()="' + categoryName + '"]/../td[7]/mat-icon'); }
    get disable() { return $('.//ion-item[contains(.,  "Disable")]'); }
    get clickDisablebtn() { return $('.//span[contains(.,  "Disable")]'); }

    async clickCreateCategoryButton() {
        super.startStep('Clicking on "Create Category" Button');
        super.clickButton('Create Category');
        super.endStep();
    }

    async validateCreatedCategory(details) {
        super.startStep(`As expected the Category Landing Page contains information for the  "${details.name}" category having "${details.priority} priority" `);
        await this.search.setValue(details.name);
        await expect(this.categoryName(details.name)).toHaveText(details.name);
        await expect(this.categoryPriority).toHaveText(details.priority, { ignoreCase: true });
        await super.takeScreenshot();
        super.endStep();
    }

    async updateCategory(details) {
        super.startStep(`Updating "${details.name}" Category with following details:`);
        await this.search.setValue(details.name);
        await browser.pause(500);
        var name = await super.getTextFromElement(this.categoryName(details.name));
        if (details.name == name) {
            await this.categoryId(details.name).click();
        }
    }

    async deleteCategory(details) {
        super.startStep(`The category "${details.name}" is being searched for deletion`);
        await browser.refresh();
        await expect(this.search).toBeExisting();
        await this.search.setValue(details.name);
        await browser.pause(500);
        await super.takeScreenshot();

        super.startStep(`Clicking disable option`);
        await expect(this.clickMore(details.name)).toBeExisting();
        await this.clickMore(details.name).click();
        await expect(this.disable).toBeExisting();
        await this.disable.click();
        await browser.pause(500);

        super.startStep(`Clicking on disable button to delete "${details.name}" category`);
        await this.clickDisablebtn.click();
        await super.takeScreenshot();

        super.startStep('Confirming that the category have been deleted successfully by checking for a toaster message that reads "Category Disabled successfully!"');
        await super.validateToasterMessage("Category Disabled successfully!");
        await super.takeScreenshot();

        await this.search.clearValue();
        await browser.pause(500);
        super.endStep();
    }
}

module.exports = new CategoryLandingPage();