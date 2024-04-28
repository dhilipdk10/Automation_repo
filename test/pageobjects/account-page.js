const Page = require("./page");
const database = require("../database/c360");

class AccountPage extends Page {
  get account_validation() {
    return $(
      `.//div[@class="main-none-container"][contains(.,' No accounts available')]`
    );
  }
  get account_contactpoint_details_validation() {
    return $(
      "//section[@class = 'customer-account-data-section']//ion-row/ion-col[1]/div[1]/div[1]"
    );
  }
  get accDetails() {
    return $$('.//div[@class = "each-line-wrapper"]');
  }
  get accounts() {
    return $$(`.//div[@class = 'card-data-container']//ion-card`);
  }
  accountNickname(optns) {
    return $(
      `.//div[@class = 'card-data-container']//ion-card[${optns}]//ion-label`
    );
  }
  accountNumber(optns) {
    return $(
      `.//div[@class = 'card-data-container']//ion-card[${optns}]//ion-label/following-sibling::ion-note`
    );
  }
  accDetailsText(optns) {
    return $(`.//div[@class = "each-line-wrapper"][${optns}]//ion-label`);
  }
  get primary_Phone() {
    return $(`.//ion-label[@name="account_phone"]`);
  }
  get primary_Email() {
    return $(`.//ion-label[@name="account_email"]`);
  }
  get primary_Address() {
    return $(`ion-label[name="account_address"]`);
  }
  get click_viewAll_phone() {
    return $(`.//span[@name ='account_phone_viewall']`);
  }
  get click_viewAll_email() {
    return $(`.//span[@name ='account_email_viewall']`);
  }
  get click_viewAll_address() {
    return $(`.//span[@name ='account_address_viewall']`);
  }
  get outstanding() {
    return $(`.//div[@class="account-data-right"]/div[1]//ion-note/span`);
  }
  getContactPointViewAll(contactPoint) {
    return $(`a[name=${contactPoint}]`);
  }

  get getContactPointlength() {
    return $$(
      `.//ion-popover/div[@class = 'ion-delegate-host popover-viewport'][1]/ion-item`
    );
  }
  getAllContactPointDetails(opts) {
    return $(
      `.//ion-popover/div[@class = 'ion-delegate-host popover-viewport'][1]/ion-item[${opts}]/ion-label`
    );
  }
  get account_count() {
    return $$(`.//div[@class = 'card-data-container']//ion-card`);
  }
  select_account(acc_num) {
    return $(
      `.//div[@class = 'card-data-container']//ion-card/ion-note[contains(., '${acc_num}')]`
    );
  }
  get account_forwardbtn() {
    return $(`.//ion-icon[@name= 'chevron-forward-outline']`);
  }

  async getAccountListByCustomerId(customerId) {
    return await database.getAllAccountsByCustomer(customerId);
  }

  async noAccountFoundValitiion(customerId) {
    super.startStep(`Customer do not have accounts`);
    if (!(await this.account_validation.isExisting())) {
      throw `Getting accounts available dom to the customerId: ${customerId}`;
    }
    await super.takeScreenshot();

    super.endStep();
  }

  async validateAccountByCustomerId(customerId, accountList) {
    super.startStep(`Validating account for customerId: ${customerId}`);
    await super.takeScreenshot();
    for (let i = 0; i < accountList.length; i++) {
      const { nickName, accountNumber } = accountList[i];
      super.startStep(
        `Validating account Id: "${accountList[i].id}" and account nickName: "${nickName}"`
      );
      const name = await this.accountNickname(i + 1).getHTML(false);
      await expect(name).toEqual(nickName || "");

      super.startStep(`validating account Number: ${accountNumber}`);
      const number = await this.accountNumber(i + 1).getHTML(false);
      await expect(number).toEqual(accountNumber || "");
    }
    super.endStep();
  }

  async selectAccountById(acc_num) {
    super.startStep(`Selecting account ${acc_num}`);
    await super.takeScreenshot();
    while (
      !(await this.select_account(acc_num).isClickable()) &&
      (await this.account_forwardbtn).shadow$("div.icon-inner").isExisting()
    ) {
      await (await this.account_forwardbtn)
        .shadow$("div.icon-inner")
        .click({ button: 0, force: true });
      await browser.pause(500);
    }

    if (await this.select_account(acc_num).isExisting()) {
      await this.select_account(acc_num).click();
      await browser.pause(1000);
    } else {
      throw `Account not found for the account number ${acc_num}`;
    }
    super.endStep();
  }

  async validateAccountContactPoint(customerId, accountId, accountNumber) {
    super.startStep(
      `Validating contact point details of the account id ${accountNumber} for the customerId: ${customerId}`
    );
    await super.takeScreenshot();
    var {
      primaryEmail,
      primaryPhone,
      primaryAddress,
      emailList,
      phoneList,
      addressList,
    } = await database.getContactPoint(customerId, accountId);

    if (!primaryEmail && !primaryPhone && !primaryAddress) {
      super.startStep(
        `Verifying the absence of ContactPoint details associated with the accountId ${accountId}`
      );
      if (
        (await this.primary_Phone.isExisting()) ||
        (await this.primary_Email.isExisting()) ||
        (await this.primary_Address.isExisting())
      ) {
        throw `Getting contactPoint dom to the accountId(${accountId})`;
      }
    } else {
      if (primaryAddress) {
        super.startStep(
          `Confirming that the primary Address displayed on the screen matches with DB for the account: ${accountNumber}`
        );
        var primary_address = (await this.primary_Address.getText())
          .split(" View All")
          .filter(Boolean)[0];
        await expect(primary_address).toEqual(primaryAddress || "");
        if (addressList.length == 1) {
          if (
            await this.getContactPointViewAll(
              "account_address_viewall"
            ).isExisting()
          ) {
            throw `Getting viewAll address dom to the accountId: ${accountId}`;
          }
        } else {
          super.startStep(
            `clicking on view All button of address for the account id ${accountId}`
          );
          await this.click_viewAll_address.click();
          await browser.pause(500);
          await this.validateViewAllContactPointDetails(
            addressList,
            accountId,
            "Address",
            customerId
          );
        }
      } else {
        if (!(await this.primary_Address.isExisting())) {
          super.startStep(
            `Verifying the absence of address associated with the accountId ${accountId}`
          );
        }
      }
      if (primaryPhone) {
        super.startStep(
          `Confirming that the primary phone displayed on the screen matches with DB for the account: ${accountNumber}`
        );
        var primary_phone = (await this.primary_Phone.getText())
          .split(" View All")
          .filter(Boolean)[0];
        await expect(primary_phone).toEqual(primaryPhone || "");
        if (phoneList.length == 1) {
          if (
            await this.getContactPointViewAll(
              "account_phone_viewall"
            ).isExisting()
          ) {
            throw `Getting viewAll phone dom to the accountId: ${accountId}`;
          }
        } else {
          super.startStep(
            `clicking on view All button of phone for the account id ${accountId}`
          );
          await this.click_viewAll_phone.click();
          await browser.pause(500);
          await this.validateViewAllContactPointDetails(
            phoneList,
            accountId,
            "Phone",
            customerId
          );
        }
      } else {
        if (!(await this.primary_Phone.isExisting())) {
          super.startStep(
            `Verifying the absence of address associated with the accountId ${accountId}`
          );
        }
      }
      if (primaryEmail) {
        super.startStep(
          `Confirming that the primary email displayed on the screen matches with DB for the account: ${accountNumber}`
        );
        var primary_email = (await this.primary_Email.getText())
          .split(" View All")
          .filter(Boolean)[0];
        await expect(primary_email).toEqual(primaryEmail || "");
        if (emailList.length == 1) {
          if (
            await this.getContactPointViewAll(
              "account_email_viewall"
            ).isExisting()
          ) {
            throw `Getting viewAll email dom to the accountId: ${accountId}`;
          }
        } else {
          super.startStep(
            `clicking on view All button of email for the account id ${accountId}`
          );
          await this.click_viewAll_email.click();
          await browser.pause(500);
          await this.validateViewAllContactPointDetails(
            emailList,
            accountId,
            "Email",
            customerId
          );
        }
      } else {
        if (!(await this.primary_Email.isExisting())) {
          super.startStep(
            `Verifying the absence of address associated with the accountId ${accountId}`
          );
        }
      }
    }
    super.startStep(
      `validating OutStanding amount details to the account number: ${accountNumber}`
    );
    var { currencyIsoCode, outStanding } = await database.getOutstanding(
      customerId,
      accountId
    );
    var currencyUnitDb = await super.currencyUnit(currencyIsoCode);
    let outStanding_details = await this.outstanding.getText();
    if (!outStanding) {
      var outStanding_detail =
        outStanding_details == "--" ? null : outStanding_details;
      await expect(outStanding_detail).toEqual(outStanding);
    } else {
      const formattedOutStandingAmount = parseFloat(outStanding).toFixed(2);
      await expect(outStanding_details).toEqual(`${currencyUnitDb} ${formattedOutStandingAmount}`);
    }
    super.endStep();
  }

  async validateViewAllContactPointDetails(
    contactPointList,
    accountId,
    type,
    customerId
  ) {
    super.startStep(
      `Ensuring that all ${type} displayed on the screen correspond accurately to the database records for the customerId: ${customerId}`
    );
    for (let i = 0; i < contactPointList.length; i++) {
      await browser.pause(500);
      var contactPointViewAll = await this.getAllContactPointDetails(
        i + 1
      ).getText();
      var extracted_contact_details = contactPointViewAll
        .split(" View All")
        .filter(Boolean)[0];
      await contactPointList.filter(
        async (contactPointDb) =>
          await expect(extracted_contact_details).toEqual(contactPointDb)
      );
    }
    await browser.keys(["Escape"]);
    await browser.pause(500);
    super.endStep();
  }
}

module.exports = new AccountPage();
