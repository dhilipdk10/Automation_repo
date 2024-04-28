const Page = require("./page");
const database = require('../database/c360');

class Notification extends Page {
    get loader() { return $(`.//app-notifications//ion-spinner`) }
    get notificationExists() { return $(`.//ion-label[text()="Notification"]`) }
    get validateNotificatoinHistory() { return $(`.//app-notifications//div/div[contains(., ' No Notifications Available')]`) }
    get togglebtn() { return $(`.//div[@class="toggle-button"]/ion-toggle`) }
    channelName(outerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//div/ion-icon`) }
    compiledSubject(outerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-col[1]`) }
    compiledConversation(outerIndex, innerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-col[${innerIndex}]//ion-note[1]`) }
    viewMoreCompiledConversation(outerIndex, innerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-col[${innerIndex}]//ion-note[1]/div/ion-label`) }
    compiledStatus(outerIndex, innerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-col[${innerIndex}]//ion-note[2]/span[1]`) }
    outBoundCompilesentTime(outerIndex, innerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-col[${innerIndex}]//ion-note[2]/span[2]`) }
    inBoundCompilesentTime(outerIndex, innerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-col[${innerIndex}]//ion-note[2]/span`) }
    compiledDirection(outerIndex, innerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-col[${innerIndex}]//ion-img`) }

    direction(outerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-img`) }
    subject(outerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-col[1]`) }
    conversation(outerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-note[1]`) }
    viewMoreConversation(outerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-note[1]/div/ion-label`) }
    status(outerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-note[2]/span[1]`) }
    outBoundSentTime(outerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-note[2]/span[2]`) }
    inBoundSentTime(outerIndex) { return $(`.//app-notifications//ion-col[contains(@class, 'notification-history')]/div[${outerIndex}]//ion-note[2]/span`) }
    get seeMoreNotifications() { return $(`.//ion-label[contains(., 'See More')]`) }

    get scrollCustomerTag() { return $(`.//ion-label[contains(., 'Custom Tags')]`) }
    get validateCustomerTag() { return $(`.//app-notifications//div/div[contains(., ' No Tags')]`) }
    customerTags(index) { return $(`.//ion-col[contains(@class,"left-side-notification")]/ion-row[2]/ion-col[${index}]//ion-col[1]/ion-label`) }
    customerTagsvalue(index) { return $(`.//ion-col[contains(@class,"left-side-notification")]/ion-row[2]/ion-col[${index}]//ion-col[2]/ion-label`) }

    get scrollSegments() { return $(`.//ion-label[contains(., 'Segments')]`) }
    segments(index) { return $(`.//ion-col[contains(@class,"left-side-notification")]/ion-row[contains(@class,"segements")]/ion-col[${index}]/ion-label`) }

    async validateNotification(customerId) {
        super.startStep(`Validating Notifications for the customerId: ${customerId}`);
        await super.clickTab('Notifications');
        var { compiledConversation, nonCompiledConversationList } = await database.getNotification(customerId);
        if (nonCompiledConversationList.length == 0) {
            await this.validateNotificatoinHistory.waitForExist({ timeout: 10000 });
            if (await this.validateNotificatoinHistory.isExisting()) {
                super.startStep(`No notifications found for the customerId: ${customerId}`)
            } else { throw `Notification not found dom is presented to the customerId: ${customerId}` }
            await super.takeScreenshot();
        } else {
            await this.notificationExists.waitForExist({ timeout: 10000 });
            await super.takeScreenshot();

            var isCompileConversation = await ((await this.togglebtn).shadow$('input[type="checkbox"]')).isSelected();

            if (!isCompileConversation) {
                await super.scrollIntoView(await this.togglebtn);
                await ((await this.togglebtn).shadow$('input[type="checkbox"]')).click({ button: 0, force: true });
            }

            await this.validateCompileConversation(customerId, compiledConversation);
            await super.scrollIntoView(await this.togglebtn);
            await ((await this.togglebtn).shadow$('input[type="checkbox"]')).click({ button: 0, force: true });
            await this.validateNonCompileConversation(customerId, nonCompiledConversationList);
        }
        super.endStep();
    }

    async validateCompileConversation(customerId, compiledConversationList) {
        super.startStep(`validating compiled notification conversation to the customerId: ${customerId}`);
        for (let i = 0; i < compiledConversationList.length; i++) {
            const outerIndex = i + 1;
            const compiledConversation = compiledConversationList[i];
            for (let j = 0; j < compiledConversation.length; j++) {
                var innerIndex = j + 1;
                const notification = compiledConversation[j];
                var channel = notification.channel;
                if (j == 0) {
                    super.startStep(`Validating "${notification.channel}" channel for the customerId: ${customerId}`);
                    await this.channelName(outerIndex).waitForExist({ timeout: 10000 });
                    await super.scrollIntoView(this.channelName(outerIndex)); ``
                    var uiChannel = await this.channelName(outerIndex).getAttribute('title');
                    if (uiChannel == 'WEB PUSH') {
                        uiChannel = 'WEB_PUSH';
                        var contentTitle = notification.content.title;
                    }
                    if (uiChannel == 'EMAIL') var contentTitle = notification.content.subject;
                    if (uiChannel == 'MOBILE PUSH') uiChannel = 'MOBILE_PUSH';
                    await expect(uiChannel).toEqual(channel);
                }
                if ((contentTitle) && (channel == 'EMAIL' || channel == 'WEB_PUSH')) {
                    if (j == 0) {
                        super.startStep(`Verifying the subject "${contentTitle}" for the "${channel}" channel for customerId ${customerId}`);
                        var subject = await this.compiledSubject(outerIndex).getText();
                        await expect(subject).toEqual(contentTitle);
                    }
                    innerIndex += 1;
                }
                if (!(await this.compiledConversation(outerIndex, innerIndex).isExisting())) {
                    await super.scrollIntoView(await this.compiledConversation(outerIndex, innerIndex));
                }
                if (notification.content.message) {
                    super.startStep(`Verifying the mesaage "${notification.content.message}" for the "${channel}" channel for customerId ${customerId}`);
                    if (await (await this.viewMoreCompiledConversation(outerIndex, innerIndex)).isExisting()) {
                        var content = (await this.compiledConversation(outerIndex, innerIndex).getText()).split('View more')[0];
                    } else {
                        var content = await (await this.compiledConversation(outerIndex, innerIndex).getText());
                    }
                    await expect(content.trim()).toEqual(notification.content.message.trim());
                }
                if (notification.direction) {
                    var getDirection = await this.compiledDirection(outerIndex, innerIndex).getAttribute('src');
                    var direction = getDirection.toLowerCase().includes("incomming") ? "INBOUND" : "OUTBOUND";
                    if (direction == "INBOUND") {
                        super.startStep(`Confirming the direction "${direction}" for the "${channel}" channel for customerId ${customerId}`);
                        await expect(direction).toEqual(notification.direction);
                    } else {
                        super.startStep(`Confirming the direction "${direction}" for the "${channel}" channel for customerId ${customerId}`);
                        await expect(direction).toEqual(notification.direction);
                        if (notification.status) {
                            super.startStep(`Verifying that the status "${notification.status}" is assigned to the to the "${channel}" channel for the customerId ${customerId}`);
                            var status = await this.compiledStatus(outerIndex, innerIndex).getText();
                            await expect(status).toEqual(notification.status);
                        }
                    }
                }
                if (notification.sentTime) {
                    super.startStep(`Confirming that the conversation sent Time "${notification.sentTime}" is associated with the "${channel}" channel for customerId ${customerId}`);
                    if (notification.direction == "OUTBOUND") {
                        var sentTime = await this.outBoundCompilesentTime(outerIndex, innerIndex).getText();
                    } else {
                        sentTime = await this.inBoundCompilesentTime(outerIndex, innerIndex).getText();
                    }
                    const expectedDate = new Date(notification.sentTime);
                    const recivedDate = new Date(sentTime);
                    const formattedExpectedDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                    const formatted_sentTime = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                    await expect(formatted_sentTime).toEqual(formattedExpectedDate);
                }
            }
        }
        super.endStep();
    }

    async validateNonCompileConversation(customerId, nonCompiledConversationList) {
        super.startStep(`validating non-compiled notification to the customerId: ${customerId}`);
        for (let i = 0; i < nonCompiledConversationList.length; i++) {
            var outerIndex = i + 1;
            const nonCompiledConversation = nonCompiledConversationList[i];
            if (nonCompiledConversation.channel) {
                super.startStep(`Validating channel "${nonCompiledConversation.channel}" to customerId: ${customerId}`);
                if (await this.seeMoreNotifications.isExisting()) {
                    await this.seeMoreNotifications.click();
                    await browser.pause(1000);
                }
                await this.channelName(outerIndex).waitForExist({ timeout: 10000 });
                await super.scrollIntoView(this.channelName(outerIndex));
                var channel = await this.channelName(outerIndex).getAttribute('title');
                if (channel == 'WEB PUSH') {
                    channel = 'WEB_PUSH';
                    var contentTitle = nonCompiledConversation.content.title;
                }
                if (channel == 'EMAIL') var contentTitle = nonCompiledConversation.content.subject;
                if (channel == 'MOBILE PUSH') channel = 'MOBILE_PUSH';

                await expect(channel).toEqual(nonCompiledConversation.channel);
            }
            if ((contentTitle) && (channel == 'EMAIL' || channel == 'WEB_PUSH')) {
                super.startStep(`Validating subject "${contentTitle}" to the channel "${channel}" to customerId: ${customerId}`);
                if (i == 0) {
                    var subject = await this.subject(outerIndex).getText();
                    await expect(subject).toEqual(contentTitle || '');
                }
            }
            if (!(await this.conversation(outerIndex).isExisting())) {
                await super.scrollIntoView(await this.conversation(outerIndex));
            }
            if (nonCompiledConversation.content.message) {
                super.startStep(`Validating content message "${nonCompiledConversation.content.message}" to the channel "${channel}" to customerId: ${customerId}`);
                if (await (await this.viewMoreConversation(outerIndex)).isExisting()) {
                    var content = (await this.conversation(outerIndex).getText()).split('View more')[0];
                } else {
                    var content = await (await this.conversation(outerIndex).getText());
                }
                await expect(content.trim()).toEqual(nonCompiledConversation.content.message.trim());
            }
            if (nonCompiledConversation.direction) {
                var getDirection = await this.direction(outerIndex).getAttribute('src');
                var direction = getDirection.toLowerCase().includes("incomming") ? "INBOUND" : "OUTBOUND";
                if (direction == "INBOUND") {
                    super.startStep(`Validating direction "${nonCompiledConversation.direction}" to the channel "${channel}" to customerId: ${customerId}`);
                    await expect(direction).toEqual(nonCompiledConversation.direction);
                } else {
                    super.startStep(`Validating direction "${nonCompiledConversation.direction}" to the channel "${channel}" to customerId: ${customerId}`);
                    await expect(direction).toEqual(nonCompiledConversation.direction);
                    if (nonCompiledConversation.status) {
                        super.startStep(`Validating status "${nonCompiledConversation.status}" to the channel "${channel}" to customerId: ${customerId}`);
                        var status = await this.status(outerIndex).getText();
                        await expect(status).toEqual(nonCompiledConversation.status);
                    }
                }
            }
            if (nonCompiledConversation.sentTime) {
                super.startStep(`Validating conversation sentTime "${nonCompiledConversation.sentTime}" to the channel "${channel}" to customerId: ${customerId}`);
                if (nonCompiledConversation.direction == "OUTBOUND") {
                    var sentTime = await this.outBoundSentTime(outerIndex).getText();
                } else {
                    sentTime = await this.inBoundSentTime(outerIndex).getText();
                }
                const expectedDate = new Date(nonCompiledConversation.sentTime);
                const recivedDate = new Date(sentTime);
                const formattedExpectedDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                const formatted_sentTime = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                await expect(formatted_sentTime).toEqual(formattedExpectedDate);
            }
        }
        super.endStep();
    }

    async validatingCustomerTags(customerId) {
        super.startStep(`validating customer tags to the customerId: ${customerId}`);
        var customerTags = await database.getCustomerTags(customerId);
        if (!await this.scrollCustomerTag.isExisting()) {
            await super.scrollIntoView(await this.scrollCustomerTag);
        }
        if (customerTags.length == 0) {
            if (await this.validateCustomerTag.isExisting()) {
                super.startStep(`Customer tags not found to the customerId: ${customerId}`);
                await super.takeScreenshot();
            } else {
                throw `customer tag not found dom not present to the customerId: ${customerId}`;
            }
        } else {
            await super.takeScreenshot();
            for (let k = 0; k < customerTags.length; k++) {
                var value = customerTags[k].value ? customerTags[k].value : "null"
                super.startStep(`Validating customer tag "${customerTags[k].tag} and it's value "${value}`);
                var index = k + 1;
                if (customerTags[k].tag) {
                    var customertag = await this.customerTags(index).getText();
                    await expect(customertag).toEqual(customerTags[k].tag);
                } if (customerTags[k].value) {
                    var customertagValue = await this.customerTagsvalue(index).getText();
                    await expect(customertagValue).toEqual((customerTags[k].value).toString() || '');
                } else { super.startStep(`Value not available to the customerTag: ${customerTags[k].tag}`) }
            }
        }
        super.endStep();
    }

    async validatingSegments(customerId, segments) {
        super.startStep(`Validating segment details to the customerId: ${customerId}`);
        if (!await this.scrollSegments.isExisting()) {
            await super.scrollIntoView(await this.scrollSegments);
        }
        if (segments) {
            await super.takeScreenshot();
            for (let l = 0; l < segments.length; l++) {
                super.startStep(`Validating segment "${segments[l].segmentName}"`);
                var index = l + 1;
                var segment = await this.segments(index).getText();
                await expect(segment).toEqual(segments[l].segmentName);
            }
        }
        super.endStep();
    }
}
module.exports = new Notification;