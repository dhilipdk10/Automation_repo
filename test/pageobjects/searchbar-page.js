const Page = require("./page");
const database = require("../database/c360");

class Searchbar extends Page {
  get searchInput() {
    return $(`.//input[@name='searchbar']`);
  }
  get searchResult() {
    return $(`.//div/p[text()='Search Result']`);
  }
  get closeSearch() {
    return $(`.//div/ion-icon[@name="close-outline"]`);
  }
  get closeSearchType() {
    return $(`.//div[contains(@class,"custom-chip")]/P//span/ion-icon`);
  }
  type(searchType) {
    return $(`.//div//p[contains(., '${searchType}')]`);
  }
  clickSourceSystem(sourceSystem) {
    return $(`.//p[text()= '${sourceSystem}']`);
  }
  get clickSearch() {
    return $(`.//ion-button/ion-label`);
  }

  clickCustomerId(index) {
    return $(
      `.//div[@name="customer_result_sugestion"]/p/span[contains(., '${index}')]/..`
    );
  }
  get getCustomerId() {
    return $(`.//ion-label[@name="customer_id"]`);
  }
  get getCustomerName() {
    return $(`.//ion-label[@name="customer_name"]`);
  }

  get customerNotFound() {
    return $(`.//p[contains(., "No Customer data found")]`);
  }
  customerId(index) {
    return $(`.//div[@name="customer_result_sugestion"][${index}]/p/span`);
  }
  customerName(index) {
    return $(`.//div[@name="customer_result_sugestion"][${index}]/p`);
  }
  customerType(index) {
    return $(`.//div[@name="customer_result_sugestion"][${index}]/p/ion-chip`);
  }

  get accountNotFound() {
    return $(`.//p[contains(., "No Account data found")]`);
  }
  get accountExpandAll() {
    return $(`.//ion-note[text()='Expand all']`);
  }
  accountId(index) {
    return $(`.//div[@name="account_result_suggestion"][${index}]/p/span`);
  }
  accountNickName(index) {
    return $(`.//div[@name="account_result_suggestion"][${index}]/p[1]`);
  }
  accountNumber(index) {
    return $(`.//div[@name="account_result_suggestion"][${index}]/p[1]`);
  }
  accountType(index) {
    return $(`.//div[@name="account_result_suggestion"][${index}]/p/ion-chip`);
  }

  async searchCustomer(search) {
    super.startStep(`Searching customer through search bar`);
    const { searchType, searchText, sourceSystemId, overView } = search;
    if (
      (await this.closeSearch.isExisting()) &&
      (await this.closeSearch.shadow$("div").isExisting())
    ) {
      await this.closeSearch.shadow$("div").click();
    }

    if (
      (await this.closeSearchType.isExisting()) &&
      (await this.closeSearchType.shadow$("div").isExisting())
    ) {
      await this.closeSearchType.shadow$("div").click();
    }

    await this.searchInput.waitForExist({ timeout: 10000 });
    await this.searchInput.click();
    await browser.pause(500);
    if (searchType) {
      super.startStep(`Searching customer details by ${searchType}`);
      await this.type(searchType).click();
      await browser.pause(500);
      if (sourceSystemId) {
        var sourceSystem = await database.getSourceSystemIdBySourceSystem(
          sourceSystemId
        );
        super.startStep(
          `Clicking on "${sourceSystem}" source system to the searchType  "${searchType}"`
        );
        await this.clickSourceSystem(sourceSystem).click();
        await browser.pause(500);
      }
      super.startStep(`Entering search value as: ${searchText}`);
      await this.searchInput.setValue(searchText);
      await browser.pause(500);

      super.startStep(`Clicking on search button`);
      await this.clickSearch.click();
      await browser.pause(1000);
    } else {
      super.startStep(`Entering search value as: ${searchText}`);
      await this.searchInput.setValue(searchText);
      await browser.pause(1000);
    }
    await this.searchResult.waitForExist({ timeout: 10000 });

    if (overView) {
      await this.validateAndClickCustomer(search);
    }
    super.endStep();
  }

  async validateSearchCustomer(search) {
    const { searchType, searchText, sourceSystemId } = search;
    super.startStep(`Getting customer data from DB`);
    var { customers, accounts } = await database.searchCustomers(
      searchType,
      searchText,
      sourceSystemId
    );
    if (customers.length == 0) {
      if (await this.customerNotFound.isExisting()) {
        super.startStep(`Customer details not found`);
        await super.takeScreenshot();
      } else throw "Showing some customer details dom";
    } else {
      await super.takeScreenshot();
      for (let i = 0; i < customers.length; i++) {
        var index = i + 1;
        super.startStep(`As expected customer Id is ${customers[i].id}`);
        var customerId = await this.customerId(index).getText();
        await expect(customerId).toEqual(customers[i].id.toString() || "");

        super.startStep(`As expected customer Name is ${customers[i].name}`);
        var customerName = await this.customerName(index).getText();
        var extracted_cus_name = await customerName.match(
          /\d\s(.+?)(?:\sprospect|\scustomer)/
        );
        var cus_name = extracted_cus_name ? extracted_cus_name[1] : null;
        await expect(cus_name.trim()).toEqual(customers[i].name || "");

        super.startStep(`As expected customer type is ${customers[i].type}`);
        var customerType = await this.customerType(index).getText();
        await expect(customerType.toUpperCase()).toEqual(
          customers[i].type.toUpperCase() || ""
        );
      }

      if (accounts.length == 0) {
        if (await this.accountNotFound.isExisting()) {
          super.startStep(`No accountd for this customer`);
          await super.takeScreenshot();
        } else {
          throw `Getting some account details dom`;
        }
      } else {
        super.startStep(`Validating accounts list of the customer`);
        await super.takeScreenshot();
        if (accounts.length > 5) {
          if (!(await this.accountExpandAll.isExisting())) {
            throw `Account "expand all" dom is not present for more than 5 account`;
          }
        } else {
          if (await this.accountExpandAll.isExisting()) {
            throw `Account "expand all" dom is present for less than 5 account`;
          }
        }
        for (let j = 0; j < accounts.length && j < 5; j++) {
          var index = j + 1;
          super.startStep(`As expected account id is ${accounts[j].id}`);
          var accountId = await this.accountId(index).getText();
          await expect(accountId).toEqual(accounts[j].id.toString());

          super.startStep(
            `As expected account nick name is ${accounts[j].nickName}`
          );
          var nickName = await this.accountNickName(index).getText();
          var nick_Name = nickName.split(",")[0].split(" ").slice(1).join(" ");
          await expect(nick_Name).toEqual(accounts[j].nickName || "");

          super.startStep(
            `As expected account number is ${accounts[j].accountNumber}`
          );
          var accountNumber = await this.accountNumber(index).getText();
          var accNumber = accountNumber.split(",")[1].trim().split(" ")[0];
          await expect(accNumber).toEqual(accounts[j].accountNumber || "");

          super.startStep(
            `Validating whether customerId ${accounts[j].customerId} has accountId "${accounts[j].id}"`
          );
          var cus_id = await this.accountType(index).getText();
          var customer_Id = cus_id.split(" ")[1];
          await expect(customer_Id).toEqual(
            accounts[j].customerId.toString() || ""
          );
        }
      }
    }
    super.endStep();
    return { customers, accounts };
  }

  async validateAndClickCustomer(search) {
    super.startStep(
      `Validating customers details after clicking on cutomer Id`
    );
    var { customers } = await this.validateSearchCustomer(search);
    var { searchText, overView } = search;

    if (overView) {
      if (customers.length > 0) {
        super.startStep(
          `clicking on cutomer Id based on the searched text ${searchText}`
        );
        await this.clickCustomerId(searchText).click({ skipRelease: true });
        await this.getCustomerName.waitForExist({ timeout: 10000 });
        await browser.refresh();
        await this.getCustomerName.waitForExist({ timeout: 10000 });
      } else {
        super.startStep(
          `Customer not found to click and view details for the data ${searchText}`
        );
      }
    } else {
      if (customers.length > 0) {
        super.startStep(
          `Clicking on customer to view details for the data ${searchText}`
        );
        await this.clickCustomerId(customers[0].id).click();
        await this.getCustomerName.waitForDisplayed({ timeout: 10000 });
        await browser.refresh();
        super.startStep(`As expected customer name is ${customers[0].name}`);
        await this.getCustomerName.waitForDisplayed({ timeout: 10000 });
        await super.takeScreenshot();
        var customerName = await this.getCustomerName.getText();
        await expect(customerName).toEqual(customers[0].name);

        super.startStep(`As expected customer id is ${customers[0].id}`);
        await this.getCustomerId.waitForDisplayed({ timeout: 10000 });
        var cus_id = await this.getCustomerId.getText();
        var customerId = await cus_id.split(": ")[1];
        await expect(customerId).toEqual(customers[0].id.toString());
      } else {
        super.startStep(
          `Customer not found for the searched data is ${searchText}`
        );
      }
    }

    super.endStep();
  }
}

module.exports = new Searchbar();
