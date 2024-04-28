const Page = require("./page");
const database = require('../database/c360');
const Util = require('../util/util');

class OverviewPage extends Page {

    get loadderSubscription() { return $(`//app-overview//ion-row[@name='Subscription']//ion-spinner`) }
    get noSubscriptionDetails() { return $(`//div[text()=' No subscriptions available ']`) };
    get subscriptionDetails() { return $$('//ion-label[text()="Service"]') };
    get subscriptionNumber() { return $$(`//div[text()='Subscription Number : ']//span`) };
    subNumber(index) { return $(`(//app-overview//div[text()='Subscription Number : ']//span)[${index}]`) };
    subscriptionPlan(index) { return $(`(//app-overview//ion-label[text()="Subscription Plan : "]/following-sibling::ion-label)[${index}]`) };
    subscriptionStatus(index) { return $(`(//app-overview//div[@class="active-container"])[${index}]`) };
    subscriptionDate(index) { return $(`(//app-overview//ion-label[text()="Date of Commencement : "]/following-sibling::ion-label)[${index}]`) };

    noBillingDetails(index) { return $(`//app-overview//ion-card-content//ion-label[text()='No Pending Bills'][${index}]`) };
    get invoiceBillingNumber() { return $(`(//app-overview//ion-card-header[ion-label[text()='Billing']])/following-sibling::ion-card-content//div//div//ion-label[text()='For: ']/following-sibling::ion-label`) };
    get billingDueAmount() { return $(`(//app-overview//ion-card-header[ion-label[text()='Billing']])/following-sibling::ion-card-content//div//div//ion-label[text()='Due Amount : ']/following-sibling::ion-label`) };
    get billingDueDate() { return $(`(//app-overview//ion-card-header[ion-label[text()='Billing']])/following-sibling::ion-card-content//div//div//ion-label[text()='Due Date: ']/following-sibling::ion-label`) };

    usageNotfound(index) { return $(`(//app-overview//ion-card-header[ion-label[text()='Usage']])[${index}]/following-sibling::ion-card-content//ion-label[text()='No Usage Details']`) }
    usagePlan(index) { return $(`(//ion-row[contains(@class,"usage-details")]//ion-col//div//div//ion-label[text()='For: ']/following-sibling::ion-label)[${index}]`) };
    usageDaysLeft(index) { return $(`(//app-overview//ion-row[@class="usage-details-border ng-star-inserted md hydrated"]//ion-col//div//div//ion-label[text()='Days Left: ']/following-sibling::ion-label)[${index}]`) };
    usageupdatedDate(index) { return $(`(//app-overview//ion-row[@class="usage-details-border ng-star-inserted md hydrated"]//ion-col//div//div//ion-label[text()='Updated Date: ']/following-sibling::ion-label)[${index}]`) };

    get ordersNotFound() { return $(`//app-overview//div[text()=' No open orders available']`) };
    get orderViewAll() { return $(`//app-overview//div[text()='Open Orders']/following-sibling::div[text()='View all']`) }
    orderTaskId(index) { return $(`(//app-overview//ion-label[text()="Order Number :"]/following-sibling::ion-note)[${index}]`) };
    orderTaskStatus(index) { return $(`(//app-overview//ion-label[text()="Status :"]/following-sibling::ion-note)[${index}]`) };
    orderDescription(index) { return $(`(//app-overview//ion-col[.//ion-note[text()='Task Summary ']]/following-sibling::ion-col//div//ion-label)[${index}]`) };
    orderDate(index) { return $(`(//app-overview//ion-label[text()="Ordered Date :"]/following-sibling::ion-note)[${index}]`) }
    ordertotalAmount(index) { return $(`(//app-overview//ion-label[text()="Amount :"]/following-sibling::ion-note)[${index}]`) }

    get taskNotFoundDom() { return $(`//app-overview//div[text()=' No tasks found ']`) };
    get taskViewAll() { return $(`//app-overview//div[text()='Tasks']/following-sibling::div[text()='View all']`) }
    tasksId(index) { return $(`//tbody//tr[${index}]//td//a`) };
    taskName(index) { return $(`(//tbody//tr[${index}]//td/following-sibling::td)[1]`) };
    taskPriority(index) { return $(`(//tbody//tr[${index}]//td/following-sibling::td)[2]`) };
    taskDueDate(index) { return $(`(//tbody//tr[${index}]//td/following-sibling::td)[3]`) };
    taskStatus(index) { return $(`(//tbody//tr[${index}]//td/following-sibling::td)[4]`) };
    taskAssignee(index) { return $(`(//tbody//tr[${index}]//td/following-sibling::td)[5]`) };

    async validateSubscription(customerId, account_id) {

        super.startStep(`Fetching customer subscription details from the database`);
        const subscriptionDetailsList = await database.subscriptionDetails(customerId, account_id);
        const loadder = await this.loadderSubscription;
        await loadder.waitForDisplayed({ reverse: true, timeout: 3000, timeoutMsg: " As expected subscription loader are not visible on the screen." })
        await super.clickTab(' Overview');
        if (subscriptionDetailsList.length == 0) {
            super.startStep(`Customer has no subscription`);
            const noSubscription = await this.noSubscriptionDetails.getText();
            super.startStep(`Validating customer subscription details for the subscription id  ${noSubscription} `);
        } else {
            for (let i = 0; i < subscriptionDetailsList.length; i++) {
                const { status, dataOfCommencement, subscriptionNumber, currentPeriodEnd, updatedDate, plan, billing } = subscriptionDetailsList[i];
                const { planName, data_allowance } = plan
                var index = null;
                const subscriptionDomList = await this.subscriptionNumber;
                for (let j = 0; j < subscriptionDomList.length; j++) {
                    const uiSubscriptionDom = await this.subNumber(j + 1).getText();
                    if (subscriptionNumber == uiSubscriptionDom) {
                        index = j + 1;
                        break;
                    }
                }
                if (!index) {
                    throw `subscription number:${subscriptionNumber} not showing in the screen`;
                } else {
                    super.startStep(`Subscription plan name: "${planName}"`);
                    await super.scrollIntoView(await this.subscriptionPlan(index));
                    const subscription_plan = await this.subscriptionPlan(index).getText();
                    await expect(subscription_plan).toEqual(planName);

                    super.startStep(`Subscription status: "${status}"`);
                    const subscription_status = await this.subscriptionStatus(index).getText();
                    await expect(subscription_status.toUpperCase()).toEqual(status);

                    super.startStep(`Validating customer subscription date`);
                    const subscription_date = await this.subscriptionDate(index).getText();
                    if (dataOfCommencement == null) {
                        super.startStep(`As expected the subscription Data Of Commencement is "${dataOfCommencement}"`);
                        await expect(subscription_date).toEqual("-");
                    } else {
                        const expectedDate = new Date(dataOfCommencement);
                        const recivedDate = new Date(subscription_date);
                        const formattedExpectedDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                        const formattedSubscriptionDate = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                        super.startStep(`As expected the subscription Data Of Commencement "${formattedSubscriptionDate}"`);
                        await expect(formattedSubscriptionDate).toEqual(formattedExpectedDate);
                    }

                    if (!billing?.invoiceNumber) {
                        const notFoundBilling = await this.noBillingDetails(index).getText();
                        super.startStep(`As expected the customer has "${notFoundBilling}"`);
                    } else {
                        super.startStep(`Validaing billing details of the customer Id: ${customerId}`);
                        const { invoiceNumber, currencyCode, totalAmount, due_date } = billing;

                        super.startStep(`As expected the invoice number is "${invoiceNumber}"`);
                        const invoice_billingNumber = await this.invoiceBillingNumber.getText();
                        await expect(invoice_billingNumber).toEqual(invoiceNumber);

                        const invoice_dueDate = await this.billingDueDate.getText();
                        super.startStep(`Validating billing due date "${due_date}"`);
                        if (!due_date) {
                            super.startStep(`As expected the billing due date is "${due_date}"`);
                            await expect(invoice_dueDate).toEqual("-");
                        } else {
                            const expectedDate = new Date(due_date);
                            const recivedDate = new Date(invoice_dueDate);
                            const formattedExpectedInvoiceDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                            const formattedInvoiceDate = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                            super.startStep(`As expected the billing due date is "${invoice_dueDate}"`);
                            await expect(formattedInvoiceDate).toEqual(formattedExpectedInvoiceDate);
                        }
                        const symbol = await super.currencyUnit(currencyCode);
                        const formattedTotalAmount = parseFloat(totalAmount).toFixed(2);
                        super.startStep(`As expected the billing due_amount is "${symbol + ' ' + formattedTotalAmount}"`);
                        const invoice_dueAmount = await this.billingDueAmount.getText();
                        await expect(invoice_dueAmount).toEqual(symbol + ' ' + formattedTotalAmount);
                    }

                    if (!updatedDate) {
                        const userNotFound = await this.usageNotfound(index).getText();
                        super.startStep(`As expected there is "${userNotFound}"`);
                    } else {
                        super.startStep(`As expected the usage plan name is "${planName}"`);
                        const usage_plan = await this.usagePlan(index).getText();
                        await expect(usage_plan).toEqual(planName);

                        super.startStep(`As expected ${daysLeft} left `);
                        const days_left = await this.usageDaysLeft(index).getText();
                        var daysLeft = Math.ceil((new Date(currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))
                        super.startStep(`As expected ${days_left} left `);
                        await expect(days_left).toEqual(daysLeft + ' ' + 'Days');

                        super.startStep(`Validating usage Date Of Commencement in subscription`);
                        const updated_date = await this.usageupdatedDate(index).getText();
                        if (updatedDate == null) {
                            super.startStep(`As expected the subscription began on "${updated_date}"`);
                            await expect(updated_date).toEqual("-");
                        } else {
                            const expectedDate = new Date(updatedDate);
                            const recivedDate = new Date(updated_date);
                            const formattedExpectedDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                            const formattedDate = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                            super.startStep(`As expected the subscription began on "${formattedDate}"`);
                            await expect(formattedDate).toEqual(formattedExpectedDate);
                        }
                    }
                }

            }
        }
        super.endStep();
    }

    async validateOrderDetails(customerId, account_id) {
        super.startStep(`Fetching customer order count from the database`);
        const orderCount = await database.getOverViewOrderCount(customerId, account_id);
        if (orderCount == 0) {
            const noOrders = await this.ordersNotFound.getText();
            super.startStep(`As expected the customer id  ${customerId} has ${noOrders}`);
        } else {
            if (orderCount > 3) {
                super.startStep(`As expected, the customer ID  ${customerId} has View All option`);
                const orderViewAllExist = await this.orderViewAll;
                await orderViewAllExist.isExisting();
            } else {
                super.startStep(`As expected, the customer ID ${customerId} has no View All option`);
            }
            super.startStep(`Fetching customer Orders list details from the database`);
            const orderList = await database.getAllOrders(customerId, account_id);
            for (var i = 0; i < orderList.length && i < 3; i++) {
                super.startStep(`Iterating through the order's list details in the database.`);
                const { orderStatus, orderNumber, ordered_date, currency_iso_code, totalAmount } = orderList[i];

                await super.scrollIntoView(await this.orderTaskId(i + 1));
                super.startStep(`As expected the orders task id is "${orderNumber}"`);
                const orderTask_id = await this.orderTaskId(i + 1).getText();
                await expect(orderTask_id).toEqual(orderNumber);

                super.startStep(`As expected the order status is "${orderStatus}"`);
                const order_status = await this.orderTaskStatus(i + 1).getText();
                await expect(order_status.toUpperCase()).toEqual(orderStatus);

                const orderDate = await this.orderDate(i + 1).getText();
                const expectedDate = new Date(ordered_date);
                const recivedDate = new Date(orderDate);
                const formattedExpectedDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                const formattedDate = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                super.startStep(`As expected the order updated date is "${formattedDate}"`);
                await expect(formattedDate).toEqual(formattedExpectedDate);

                const order_total_amount = currency_iso_code + ' ' + totalAmount;
                //  super.startStep(`As expected the orders totalAmount "${order_total_amount}"`);
                const ordertTotalAmount = await this.ordertotalAmount(i + 1).getText();
                super.startStep(`As expected the orders totalAmount is "${ordertTotalAmount}"`);
                await expect(ordertTotalAmount).toEqual(order_total_amount);
            }
            super.endStep();
        }
    }

    async validateTaskDetails(customerId, account_id) {
        super.startStep(`Fetching customer task's count from the  database`);
        const taskCount = await database.getTaskCount(customerId, account_id);
        if (taskCount == 0) {
            await super.scrollIntoView(await this.taskNotFoundDom);
            const noTask = await this.taskNotFoundDom.getText();
            super.startStep(`As expected the customer id ${customerId} has ${noTask}`);
        } else {
            if (taskCount > 3) {
                super.startStep(`As expected, the customer ID  ${customerId} has View All option`);
                await super.scrollIntoView(await this.taskViewAll);
                const taskViewAllExist = await this.taskViewAll;
                await taskViewAllExist.isExisting();
            } else {
                super.startStep(`As expected, the customer ID ${customerId} has no View All option`);
            }
            super.startStep(`Fetching customer all task's details from the  database`);
            const taskDetails = await database.getAllTask(customerId, account_id);
            for (let i = 0; taskDetails.length && i < 3; i++) {
                super.startStep(`Iterating through the task's list details in the database.`);
                const { task_number, taskName, priority, dueDate, status, assignee } = taskDetails[i];

                await super.scrollIntoView(await this.tasksId(i + 1));

                const task_id = await this.tasksId(i + 1).getText();
                super.startStep(`As expected the task id is "${task_id}"`);
                await expect(task_id).toEqual(task_number);

                super.startStep(`As expected the task name is "${taskName}"`);
                const task_name = await this.taskName(i + 1).getText();
                await expect(task_name).toEqual(taskName);

                super.startStep(`As expected the task has "${priority}" priority`);
                const task_priority = await this.taskPriority(i + 1).getText();
                await expect(task_priority.toUpperCase()).toEqual(priority);

                const task_dueDate = await this.taskDueDate(i + 1).getText();
                const expectedDate = new Date(dueDate);
                const recivedDate = new Date(task_dueDate);
                const formattedExpectedDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                const formattedDate = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                super.startStep(`As expected the task due Date is "${formattedDate}"`);
                await expect(formattedDate).toEqual(formattedExpectedDate);

                super.startStep(`As expected the task status is  "${status}"`);
                const task_status = await this.taskStatus(i + 1).getText();
                await expect(task_status.toUpperCase()).toEqual(status);

                super.startStep(`As expected the task is assgined for  "${assignee}"`);
                const task_assignee = await this.taskAssignee(i + 1).getText();
                await expect(task_assignee).toEqual(assignee);
            }
        }
        super.endStep();
    }
}
module.exports = new OverviewPage;