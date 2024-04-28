const Page = require("./page");
const database = require("../database/c360");
const Util = require("../util/util");
const { dataUnitConveter } = require("../util/dataUnitConveter");

class UsageAndBalancePage extends Page {
    get subscriptionNumber() {
        return $$(
            `//app-usage-and-balance//ion-label[contains(text(), 'Subscription Number:')]`
        );
    }
    subNumber(optns) {
        return $(
            `(//app-usage-and-balance//ion-label[contains(text(), 'Subscription Number:')])[${optns}]`
        );
    }
    phoneNumber(optns) {
        return $(
            `(//app-usage-and-balance//ion-note[text()='Phone Number: ']/following-sibling::ion-text)[${optns}]`
        );
    }
    usageStatus(optns) {
        return $(
            `(//app-usage-and-balance//ion-note[text()='Phone Number: ']/following-sibling::ion-text/following-sibling::ion-chip//ion-icon/following-sibling::ion-label)[${optns}]`
        );
    }
    planName(optns) {
        return $(
            `(//app-usage-and-balance//ion-note[text()='Plan: ']/following-sibling::ion-text)[${optns}]`
        );
    }
    monthlyTariff(optns) {
        return $(
            `(//app-usage-and-balance//ion-note[text()='Monthly Tariff: ']/following-sibling::ion-text)[${optns}]`
        );
    }
    usageTotalQuota(optns) {
        return $(
            `(//app-usage-and-balance//ion-note[text()='Total Quota: ']/following-sibling::ion-text)[${optns}] `
        );
    }
    dataUsed(optns) {
        return $(
            `(//app-usage-and-balance//ion-note[text()='Data Used']/following-sibling::ion-text)[${optns}]`
        );
    }
    dataLeft(optns) {
        return $(
            `(//app-usage-and-balance//ion-note[text()='Data Left']/following-sibling::ion-text)[${optns}]`
        );
    }
    dataSpeed(optns) {
        return $(
            `(//app-usage-and-balance//ion-note[text()='Data Speed']/following-sibling::ion-text)[${optns}]`
        );
    }
    daysLeft(optns) {
        return $(
            `(//app-usage-and-balance//ion-note[text()='Days Left']/following-sibling::ion-text)[${optns}]`
        );
    }

    async validateUsageAndBalance(customerId, account_id) {
        super.startStep(
            `Fetching customer usage and balance details of subscription from database`
        );
        const usageAndBalance = await database.subscriptionDetails(
            customerId,
            account_id
        );
        await super.clickTab(" Usage and balance");
        super.startStep(`Validating usage and balance details in data base`);
        for (let i = 0; i < usageAndBalance.length; i++) {
            await browser.pause(1000);
            super.startStep(
                `Iterating through each plan's usage details in the database.`
            );
            const {
                status,
                subscriptionNumber,
                currentPeriodEnd,
                plan,
                price,
                usageRecord,
                phone_number,
            } = usageAndBalance[i];
            const formattedNumber = `+${phone_number.slice(0, 3)} (${phone_number.slice(3, 6)}) ${phone_number.slice(6, 9)}-${phone_number.slice(9)}000`;
            const subscription_number = await this.subscriptionNumber;
            var index = null;
            for (let j = 0; j < subscription_number.length; j++) {
                await expect(this.subNumber(j + 1)).toBeExisting();
                await super.scrollIntoView(await this.subNumber(j + 1));
                const uiSubscriptionDom = await this.subNumber(j + 1).getText();
                const subscriptionDom = uiSubscriptionDom.substring(21);
                if (subscriptionNumber == subscriptionDom) {
                    index = j + 1;
                    break;
                }
            }
            if (!index) {
                super.startStep(`Customer ${customerId} has no usage data`);
            } else {
                await super.scrollIntoView(await this.phoneNumber(index));

                super.startStep(
                    `As expected customer have phone number is ${formattedNumber}`
                );
                const usagePhoneNumber = await this.phoneNumber(index).getText();
                await expect(usagePhoneNumber).toEqual(formattedNumber);

                super.startStep(`As expected usage status is ${status}`);
                const usage_Status = await this.usageStatus(index).getText();
                await expect(usage_Status.toUpperCase()).toEqual(status);

                const {
                    planName,
                    data_allowance,
                    data_allowance_unit,
                    data_bandwidth_per_sec,
                    data_bandwidth_per_sec_unit,
                } = plan;

                super.startStep(`As expected plan name is ${planName}`);
                const usagePlanName = await this.planName(index).getText();
                await expect(usagePlanName).toEqual(planName);

                const { currencyCode, amount } = price;
                const symbol = await super.currencyUnit(currencyCode);
                const usage_monthlyTariff = await this.monthlyTariff(index).getText();
                super.startStep(
                    `As expected monthly tariff of plan is ${symbol} ${amount}`
                );
                const formattedAmount = parseFloat(amount).toFixed(2);
                await expect(usage_monthlyTariff).toEqual(`${symbol} ${formattedAmount}`);

                const totalQouta = dataUnitConveter.convertToIncreaseDataUnits(
                    data_allowance,
                    data_allowance_unit
                );
                super.startStep(`As expected plan's total qouta is ${totalQouta}`);
                const usage_total_qouta = await this.usageTotalQuota(index).getText();
                await expect(usage_total_qouta).toEqual(totalQouta);
                await super.takeScreenshot();
                if (status == "ACTIVE") {
                    var dataUsed = 0;
                    usageRecord.forEach((data) => {
                        dataUsed += parseFloat(
                            dataUnitConveter.convertToDecreaseDataUnits(
                                data.totalDataUsed,
                                data.usageUnit
                            )
                        );
                    });
                    if (dataUsed != null && dataUsed != 0) {
                        const data_used = await this.dataUsed(index).getText();
                        var dataIncreaseUsed = dataUnitConveter.convertToIncreaseDataUnits(
                            dataUsed,
                            "BYTE"
                        );
                        await expect(data_used).toEqual(dataIncreaseUsed);
                    }
                    const decressDataUsed = dataUnitConveter.convertToDecreaseDataUnits(
                        data_allowance,
                        data_allowance_unit
                    );

                    const dataLeft = dataUnitConveter.convertToIncreaseDataUnits(
                        decressDataUsed - dataUsed,
                        "BYTE"
                    );
                    super.startStep(`As expected data left for usage is ${dataLeft}`);
                    const data_left = await this.dataLeft(index).getText();
                    await expect(data_left).toEqual(dataLeft);

                    const dataSpeed =
                        dataUnitConveter.convertToIncreaseDataUnits(
                            data_bandwidth_per_sec,
                            data_bandwidth_per_sec_unit
                        ) + "ps";
                    super.startStep(`As expected data speed is ${dataSpeed}`);
                    const data_speed = await this.dataSpeed(index).getText();
                    await expect(data_speed).toEqual(dataSpeed);

                    var daysLeft = Math.ceil(
                        (new Date(currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    super.startStep(`As expected ${daysLeft} days left`);
                    const days_left = await this.daysLeft(index).getText();
                    await expect(days_left).toEqual(daysLeft + " " + "Days");
                    await super.takeScreenshot();
                } else {
                    await super.takeScreenshot();
                    super.startStep(
                        `No usage data found for the account id ${account_id} `
                    );
                }
            }
        }
    }
}

module.exports = new UsageAndBalancePage();
