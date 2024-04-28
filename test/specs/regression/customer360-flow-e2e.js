const Util = require("../../util/util");
const {
  Customer_360,
} = require("../../../test-data/regression/customer360.json");
const { Login } = require("../../../test-data/regression/login.json");

const LoginPage = require("../../pageobjects/login-page");
const Searchbar = require("../../pageobjects/searchbar-page");
const Customer = require("../../pageobjects/customer-page");
const Account = require("../../pageobjects/account-page");
const Overview = require("../../pageobjects/overview-page");
const UsageAndBalance = require("../../pageobjects/usage-balance-page");
const Billing = require("../../pageobjects/billing-page");
const Tickets = require("../../pageobjects/tickets-page");
const Notification = require("../../pageobjects/notification-page");
const Orders = require("../../pageobjects/order-page");
const Opportunities = require("../../pageobjects/opportunities-page");

describe("Login customer 360", async () => {
  it("should login with valid credentials", async () => {
    try {
      await browser.maximizeWindow();
      await LoginPage.open();
      await LoginPage.login(Login.Credential);
    } catch (error) {
      Util.reportFailedStatus(error);
    }
  });

  for (var i = 0; i < Customer_360.length; i++) {
    const {
      testCaseName,
      customerId,
      accountIdList,
      validateViewList,
      segments,
    } = Customer_360[i];
    const accountList = await Account.getAccountListByCustomerId(customerId);
    describe(testCaseName, async () => {
      try {
        it("Search & Validate Customer Details", async () => {
          try {
            await Searchbar.searchCustomer({
              searchType: "Customer ID",
              searchText: customerId,
              overView: true,
            });
            await browser.refresh();
            await browser.pause(1000);
            if (
              !validateViewList ||
              validateViewList.indexOf("CUSTOMER_CONTACT") != -1
            ) {
              await Customer.validateCustomerDetails(customerId);
            }
          } catch (error) {
            Util.reportFailedStatus(error);
          }
        });
        if (
          !validateViewList ||
          validateViewList.indexOf("ACCOUNT_LIST") != -1
        ) {
          it("Accounts list Validation", async () => {
            try {
              if (accountList.length == 0) {
                await Account.noAccountFoundValitiion(customerId);
              } else {
                await Account.validateAccountByCustomerId(
                  customerId,
                  accountList
                );
              }
            } catch (error) {
              Util.reportFailedStatus(error);
            }
          });
        }
        for (j = 0; j < accountList.length; j++) {
          const { id, accountNumber } = accountList[j];
          if (!accountIdList || accountIdList.indexOf(id) != -1) {
            it("Selecting account by accountId - " + id, async () => {
              try {
                await Account.selectAccountById(accountNumber);
              } catch (error) {
                Util.reportFailedStatus(error);
              }
            });
            if (
              !validateViewList ||
              validateViewList.indexOf("ACCOUNT_CONTACT") != -1
            ) {
              it(
                "Account contact details validation for account id - " + id,
                async () => {
                  try {
                    await Account.selectAccountById(accountNumber);
                    await Account.validateAccountContactPoint(
                      customerId,
                      id,
                      accountNumber
                    );
                  } catch (error) {
                    Util.reportFailedStatus(error);
                  }
                }
              );
            }
            if (
              !validateViewList ||
              validateViewList.indexOf("OVERVIEW") != -1
            ) {
              it(
                "Overview page validation for account id - " + id,
                async () => {
                  try {
                    await Overview.validateSubscription(customerId, id);
                    await Overview.validateOrderDetails(customerId, id);
                    await Overview.validateTaskDetails(customerId, id);
                  } catch (error) {
                    Util.reportFailedStatus(error);
                  }
                }
              );
            }
            if (
              !validateViewList ||
              validateViewList.indexOf("USAGE_AND_BALANCE") != -1
            ) {
              it(
                "Usage and balance validation for account id - " + id,
                async () => {
                  try {
                    await UsageAndBalance.validateUsageAndBalance(
                      customerId,
                      id
                    );
                  } catch (error) {
                    Util.reportFailedStatus(error);
                  }
                }
              );
            }
            if (
              !validateViewList ||
              validateViewList.indexOf("BILLING") != -1
            ) {
              it("Billing page validation for account id - " + id, async () => {
                try {
                  await Billing.validateBillingPending(customerId, id);
                  await Billing.validateBillingHistory(customerId, id);
                } catch (error) {
                  Util.reportFailedStatus(error);
                }
              });
            }

            if (
              !validateViewList ||
              validateViewList.indexOf("TICKETS") != -1
            ) {
              it("Tickets page validation for account id - " + id, async () => {
                try {
                  await Tickets.validateTickets(customerId, id);
                } catch (error) {
                  Util.reportFailedStatus(error);
                }
              });
            }
            if (!validateViewList || validateViewList.indexOf("ORDERS") != -1) {
              it("Orders page validation for account id - " + id, async () => {
                try {
                  await Orders.orderPurchase(customerId, id);
                } catch (error) {
                  Util.reportFailedStatus(error);
                }
              });
            }
          }
        }
        if (
          !validateViewList ||
          validateViewList.indexOf("NOTIFICATION") != -1
        ) {
          it("Notification page validation", async () => {
            try {
              await Notification.validateNotification(customerId);
              await Notification.validatingCustomerTags(customerId);
              await Notification.validatingSegments(customerId, segments);
            } catch (error) {
              Util.reportFailedStatus(error);
            }
          });
        }
        if (
          !validateViewList ||
          validateViewList.indexOf("RECOMMENDATION") != -1
        ) {
          it("Opportunity validation", async () => {
            try {
              await Opportunities.validateOpportunities(customerId);
            } catch (error) {
              Util.reportFailedStatus(error);
            }
          });
        }
      } catch (error) {
        Util.reportFailedStatus(error);
      }
    });
  }
});
