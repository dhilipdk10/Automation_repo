const Page = require("./page");
const database = require("../database/c360");
const Util = require("../util/util");

class Billing extends Page {
  get paymentPendingLoader() {
    return $(
      `//app-billing//div[//ion-label[text()='Pending Payment']]/following-sibling::div//div//ion-spinner`
    );
  }
  get paymentPendingNotfound() {
    return $(`//app-billing//div[text()=' No pending payment']`);
  }
  get invoiceNumber() {
    return $(
      `(//app-billing//ion-note[text()='Invoice Number']/following-sibling::ion-text)`
    );
  }
  get invoiceDate() {
    return $(
      `(//app-billing//ion-note[text()='Invoice Date']/following-sibling::ion-text)`
    );
  }
  get dueDate() {
    return $(
      `(//app-billing//ion-note[text()='Due Date ']/following-sibling::ion-text)`
    );
  }
  get dueAmount() {
    return $(
      `(//app-billing//ion-note[text()='Due Amount']/following-sibling::ion-text)`
    );
  }

  get nextPage() {
    return $(
      `//app-billing//swiper-container//button[@aria-label="Next page"]`
    );
  }
  get historyNotFound() {
    return $(`//app-billing//div[text()=' No Payment found ']`);
  }
  historyInvoiceNumber(index) {
    return $(
      `//app-billing//thead[//tr//th//span[text()='Invoice Number']]/following-sibling::tbody//tr[${index}]//td[contains(@class,'invoiceNumber')]`
    );
  }
  historyInvoiceDate(index) {
    return $(
      `//app-billing//thead[//tr//th//span[text()='Invoice Date']]/following-sibling::tbody//tr[${index}]//td[contains(@class,'invoiceDate')]`
    );
  }
  historyAmount(index) {
    return $(
      `//app-billing//thead[//tr//th//span[text()='Amount']]/following-sibling::tbody//tr[${index}]//td[contains(@class,'grandTotalAmount')]`
    );
  }
  historyStatus(index) {
    return $(
      `//app-billing//thead[//tr//th//span[text()='Status']]/following-sibling::tbody//tr[${index}]//td[contains(@class,'status')]`
    );
  }
  historyDueDate(index) {
    return $(
      `//app-billing//thead[//tr//th//span[text()='Due date']]/following-sibling::tbody//tr[${index}]//td[contains(@class,'dueDate')]`
    );
  }
  historyPaidDate(index) {
    return $(
      `//app-billing//thead[//tr//th//span[text()='Due date']]/following-sibling::tbody//tr[${index}]//td[contains(@class,'fullSettlementDate')]`
    );
  }

  async validateBillingPending(customerId, account_id) {
    super.startStep(
      `Fetching pending billing details of the customer from the database`
    );
    const billingPending = await database.getBillingPending(
      customerId,
      account_id
    );
    await super.clickTab("Billing ");
    super.startStep(`Validating customer billing details`);

    const loadder = await this.paymentPendingLoader;
    await loadder.waitForDisplayed({
      reverse: true,
      timeout: 2000,
      timeoutMsg: " Subscription loader is not found",
    });
    if (billingPending.length == 0) {
      const billingNotFound = await this.paymentPendingNotfound.getText();
      super.startStep(`Customer has "${billingNotFound}"`);
      await super.takeScreenshot();
    } else {
      for (let i = 0; i < billingPending.length; i++) {
        super.startStep(
          `Fetching billing details of the customer from the database`
        );
        const {
          invoiceNumber,
          currencyCode,
          totalAmount,
          due_date,
          billingInvoiceDate,
        } = billingPending[i];

        await super.scrollIntoView(await this.invoiceNumber);
        const invoice_number = await this.invoiceNumber.getText();
        super.startStep(`As expected invoice number is "${invoice_number}"`);
        await expect(invoice_number).toEqual(invoiceNumber);

        const invoice_Date = await this.invoiceDate.getText();
        super.startStep(`As expected invoice date is "${invoice_number}"`);
        await expect(invoice_Date).toEqual(billingInvoiceDate);

        const invoice_due_date = await this.dueDate.getText();
        super.startStep(`As expected invoice due date is"${invoice_due_date}"`);
        await expect(invoice_due_date).toEqual(due_date);

        const symbol = await super.currencyUnit(currencyCode);
        const invoice_dueAmount = await this.dueAmount.getText();
        const formattedAmount = parseFloat(totalAmount).toFixed(2);
        super.startStep(`As expected invoice number is "${invoice_dueAmount}"`);
        await expect(invoice_dueAmount).toEqual(`${symbol} ${formattedAmount}`);

        await super.takeScreenshot();
      }
    }
    super.endStep();
  }

  async validateBillingHistory(customerId, account_id) {
    super.startStep(
      `Fetching billing history of the customer from the database`
    );
    const billingHistoryCount = await database.getBillingHistoryCount(
      customerId,
      account_id
    );
    await super.clickTab("Billing ");
    if (billingHistoryCount == 0) {
      super.startStep(`Validating customer billing history`);
      await super.scrollIntoView(await this.historyNotFound);
      const noHistory = await this.historyNotFound.getText();
      super.startStep(`Customer id "${customerId}" has "${noHistory}"`);
    } else {
      if (billingHistoryCount > 5) {
        super.startStep(
          `As expected,  the customer ID: ${customerId} has more orders to view in next page`
        );
        const orderNextPageExist = await this.nextPage;
        await orderNextPageExist.isExisting();
      } else {
        super.startStep(
          `As expected, the customer ID ${customerId} has no more orders to view in next page`
        );
      }
      const billingHistory = await database.getBillingHistory(
        customerId,
        account_id
      );
      if (billingHistory.length > 0) {
        for (let i = 0; i < billingHistory.length; i++) {
          const index = i + 1;
          super.startStep(
            `Iterating through each billing history details in the database`
          );
          const {
            invoiceNumber,
            currencyCode,
            totalAmount,
            due_date,
            status,
            billingInvoiceDate,
          } = billingHistory[i];

          const symbol = await super.currencyUnit(currencyCode);

          await super.scrollIntoView(this.historyInvoiceNumber(index));
          const history_invoice_number = await this.historyInvoiceNumber(
            index
          ).getText();
          super.startStep(
            `As expected billing history invoice number is "${history_invoice_number}"`
          );
          await expect(history_invoice_number.toUpperCase()).toEqual(
            invoiceNumber
          );

          const history_invoice_date = await this.historyInvoiceDate(
            index
          ).getText();
          super.startStep(
            `As expected billing history invoice date is "${history_invoice_date}"`
          );
          const expectedDate = new Date(history_invoice_date);
          const recivedDate = new Date(billingInvoiceDate);
          const formattedExpectedDate = expectedDate.toLocaleDateString(
            "en-GB",
            { month: "short", day: "2-digit", year: "numeric" }
          );
          const formattedIonvoiceDate = recivedDate.toLocaleDateString(
            "en-GB",
            { month: "short", day: "2-digit", year: "numeric" }
          );
          await expect(formattedIonvoiceDate).toEqual(formattedExpectedDate);

          const history_amount = await this.historyAmount(index).getText();
          super.startStep(`AS expected billing history amount is "${history_amount}"`);
          const formattedAmount = parseFloat(totalAmount).toFixed(2);
          await expect(history_amount).toEqual(`${symbol} ${formattedAmount}`);

          const history_status = await this.historyStatus(index).getText();
          super.startStep(`As expected billing history status is "${history_status}"`);
          await expect(history_status.toUpperCase()).toEqual(
            status.toUpperCase()
          );

          const historyDueDate = await this.historyDueDate(index).getText();
          const expecteDueDate = new Date(historyDueDate);
          const recivedDueDate = new Date(due_date);
          const formattedExpectedDueDate = expecteDueDate.toLocaleDateString(
            "en-GB",
            { month: "short", day: "2-digit", year: "numeric" }
          );
          const formattedIonvoiceDueDate = recivedDueDate.toLocaleDateString(
            "en-GB",
            { month: "short", day: "2-digit", year: "numeric" }
          );
          super.startStep(
            `As expected billing history due date is "${formattedIonvoiceDueDate}"`
          );
          await expect(formattedExpectedDueDate).toEqual(
            formattedIonvoiceDueDate
          );
          await super.takeScreenshot();
        }
      } else {
        await super.scrollIntoView(await this.historyNotFound);
        const noHistory = await this.historyNotFound.getText();
        super.startStep(
          `Customer id: "${customerId}" has "${noHistory}" history `
        );
      }
    }
    super.endStep();
  }
}

module.exports = new Billing();
