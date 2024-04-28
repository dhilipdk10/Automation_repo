const Page = require("./page");
const database = require('../database/c360');

class Opportunities extends Page {
    get recommentation() { return $(`.//li[contains(., ' Recommendation ')]`) }
    opportunitiesName(index) { return $(`.//ion-label[contains(., 'Opportunities')]/../../following-sibling::div/ion-row[${index}]/ion-col[1]/ion-label`) }
    opportunitiesStage(index) { return $(`.//ion-label[contains(., 'Opportunities')]/../../following-sibling::div/ion-row[${index}]/ion-col[2]//ion-label`) }
    opportunitiesTotalAmount(index) { return $(`.//ion-label[contains(., 'Opportunities')]/../../following-sibling::div/ion-row[${index}]/ion-col[3]//ion-label`) }
    opportunitiesOwner(index) { return $(`.//ion-label[contains(., 'Opportunities')]/../../following-sibling::div/ion-row[${index}]/ion-col[4]//ion-label`) }
    opportunitiesClosedDate(index) { return $(`.//ion-label[contains(., 'Opportunities')]/../../following-sibling::div/ion-row[${index}]/ion-col[5]//ion-label`) }

    async validateOpportunities(customerId) {
        super.startStep(`Fetching opportunity details of the customer id ${customerId} from the database `);
        var opportunities = await database.getOpportunities(customerId);
        await this.recommentation.click();
        await browser.pause(500);
        if (opportunities.length == 0) {
            super.startStep(`Opportunities details are not available for the customerId ${customerId}`);
            await super.takeScreenshot();
        } else {
            await super.takeScreenshot();
            for (let i = 0; i < opportunities.length; i++) {
                await super.scrollIntoView(await this.opportunitiesName(i + 1));
                await browser.pause(500);
                if (opportunities[i].name) {
                    var name = await this.opportunitiesName(i + 1).getText();
                    super.startStep(`As expected opportunity name '${name}' matches with db`);
                    await expect(name).toEqual(opportunities[i].name);
                }
                if (opportunities[i].stage) {
                    var stage = await this.opportunitiesStage(i + 1).getText();
                    super.startStep(`As expected stage '${stage}' matches with db`);
                    await expect(stage).toEqual(opportunities[i].stage);
                }
                if (opportunities[i].totalAmount) {
                    var totalAmount = await this.opportunitiesTotalAmount(i + 1).getText();
                    super.startStep(`As expected total amount '${totalAmount}' matches with db`);
                    await expect(totalAmount).toEqual(opportunities[i].totalAmount.toString());
                }
                if (opportunities[i].ownerName) {
                    var ownerName = await this.opportunitiesOwner(i + 1).getText();
                    super.startStep(`As expected owner name '${ownerName}' matches with db`);
                    await expect(ownerName).toEqual(opportunities[i].ownerName);
                }
                if (opportunities[i].closedDate) {
                    var closedDate = await this.opportunitiesClosedDate(i + 1).getText();
                    const expectedDate = new Date(opportunities[i].closedDate);
                    const recivedDate = new Date(closedDate);
                    const formattedExpectedDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                    const formattedClosedDate = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                    super.startStep(`As expected closed date '${formattedClosedDate}' matches with db`);
                    await expect(formattedClosedDate).toEqual(formattedExpectedDate);
                }
            }
        }
        super.endStep();
    }
}
module.exports = new Opportunities;