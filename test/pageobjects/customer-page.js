const Page = require("./page");
const database = require('../database/c360');
const Util = require('../util/util');

class CustomerPage extends Page {
    get customer_img() { return $('.//div[@class="customer-img"]') }
    get customer_type() { return $('(//div[@class="customer-data-name"]//ion-label/following-sibling::ion-note)[2]') }
    get searchCustomerById() { return $('input[name="searchbar"]') }
    clickCustomer(id) { return $(`.//div[@class="customer-container"]//div/p/span[contains(., ${id})]`) }
    get customerName() { return $(`.//div[@class = "customer-data-name"]/ion-label`) }
    customer_Id(id) { return $(`.//ion-label[contains(., "Customer ID: ${id}")]`) }
    customerType(name) { return $(`.//ion-label[contains(., "${name}")]/following-sibling::ion-note`) }
    get primary_Phone() { return $(`.//ion-label[@name="customer_phone"]`) }
    get primary_Email() { return $(`.//ion-label[@name="customer_email"]`) }
    get primary_Address() { return $(`ion-label[name="customer_addresses"]`) }
    get click_viewAll_phone() { return $(`.//a[@name ='customer_phone_viewall']`) }
    get click_viewAll_email() { return $(`.//a[@name ='customer_email_viewall']`) }
    get click_viewAll_address() { return $(`.//a[@name ='customer_address_viewall']`) }
    getContactPointViewAll(contactPoint) { return $(`a[name=${contactPoint}]`) }
    getAllContactPointDetails(index) { return $(`.//ion-popover/div[@class = 'ion-delegate-host popover-viewport'][1]/ion-item[${index}]/ion-label`) }

    async validateCustomerDetails(customerId) {
        super.startStep(`Fetching customer details from db for the customerId ${customerId}`);
        const customerDetails = await database.getCustomerDetails(customerId);
        await this.customerName.waitForExist({ timeout: 20000 });
        await expect(this.customer_img).toBeExisting();

        super.startStep(`Confirming that the Customer ID ${customerId} displayed on the screen matches with DB`);
        var customerIdDetails = await this.customer_Id(customerId).getText();
        var customer_id = await customerIdDetails.substring(13).trim();
        await expect(customer_id).toEqual(customerId);

        super.startStep(`Confirming that the Customer name ${customerDetails.name} displayed on the screen matches with DB`);
        const customerName = await this.customerName.getText();
        await expect(customerName).toEqual(customerDetails.name);

        super.startStep(`Confirming that the Customer type ${customerDetails.type.toUpperCase()} displayed on the screen matches with DB`);
        const customerType = await this.customerType(customerDetails.name).getText();
        await expect(customerType.toUpperCase()).toEqual(customerDetails.type.toUpperCase());

        var { primaryEmail, emailList, primaryPhone, phoneList, primaryAddress, addressList } = await database.getContactPoint(customerId);
        if (!primaryEmail && !primaryPhone && !primaryAddress) {
            super.startStep(`Verifying the absence of ContactPoint details associated with the customerId ${customerId}`);
            await super.takeScreenshot();
            if (await this.primary_Phone.isExisting() || await this.primary_Email.isExisting() || await this.primary_Address.isExisting()) {
                throw `Getting contactPoint available details dom to the customerId ${customerId}`;
            }
        } else {
            await super.takeScreenshot();
            if (primaryAddress) {
                super.startStep(`Confirming that the primary Address displayed on the screen matches with DB for the customerId ${customerId}`);
                var primary_address = await this.primary_Address.getText();
                await expect(primary_address).toEqual(primaryAddress || '');
                if (addressList.length == 1) {
                    if (await this.getContactPointViewAll('customer_address_viewall').isExisting()) {
                        throw `Getting viewAll address dom to the customerId ${customerId}`;
                    }
                } else {
                    super.startStep(`clicking on view All button of Address for the customerId  ${customerId}`);
                    await this.click_viewAll_address.click();
                    await browser.pause(500);
                    await this.validateViewAllContactPointDetails(addressList, customerId, 'Address');
                }
            } else {
                super.startStep(`Verifying the absence of address associated with the customerId ${customerId}`);
                if (await this.primary_Address.isExisting()) {
                    throw `Gettiing address dom to the customerId ${customerId}`
                }
            }
            if (primaryPhone) {
                super.startStep(`Confirming that the primary phone displayed on the screen matches with DB for the customerId ${customerId}`);
                var primary_phone = await this.primary_Phone.getText();
                await expect(primary_phone).toEqual(primaryPhone || '');
                if (phoneList.length == 1) {
                    if (await this.getContactPointViewAll('customer_phone_viewall').isExisting()) {
                        throw `Getting viewAll phone dom to the customerId(${customerId})`;
                    }
                } else {
                    super.startStep(`clicking on view All button of Phone for the customerId ${customerId}`);
                    await this.click_viewAll_phone.click();
                    await browser.pause(500);
                    await this.validateViewAllContactPointDetails(phoneList, customerId, 'Phone');
                }
            } else {
                super.startStep(`Verifying the absence of Phone associated with the customerId ${customerId}`);
                if (await this.primary_Phone.isExisting()) {
                    throw `Getting Phone dom to the customerId ${customerId}`
                }
            }
            if (primaryEmail) {
                super.startStep(`Confirming that the primary email displayed on the screen matches with DB for the customerId ${customerId}`);
                var primary_email = await this.primary_Email.getText();
                await expect(primary_email).toEqual(primaryEmail || '');
                if (emailList.length == 1) {
                    if (await this.getContactPointViewAll('customer_email_viewall').isExisting()) {
                        throw `Getting viewAll email dom to the customerId(${customerId})`;
                    }
                } else {
                    super.startStep(`clicking on view All button of email for the customerId ${customerId}`);
                    await this.click_viewAll_email.click();
                    await browser.pause(500);
                    await this.validateViewAllContactPointDetails(emailList, customerId, 'Email');
                }
            } else {
                super.startStep(`Verifying the absence of email associated with the customerId ${customerId}`);
                if (await this.primary_Email.isExisting()) {
                    throw `Gettiing Email dom to the customerId ${customerId}`
                }
            }

        }
        super.endStep();
    }
    async validateViewAllContactPointDetails(contactPointList, customerId, type) {
        super.startStep(`Ensuring that all ${type} displayed on the screen correspond accurately to the database records for the customerId ${customerId}`);
        for (let i = 0; i < contactPointList.length; i++) {
            var contactPointViewAll = await this.getAllContactPointDetails(i + 1).getText();
            await contactPointList.filter(async contactPointDb => await expect(contactPointViewAll).toEqual(contactPointDb));
        }
        await browser.keys(['Escape']);
        await browser.pause(500);
        super.endStep();
    }
}
module.exports = new CustomerPage;