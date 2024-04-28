const Page = require("./page");
const database = require('../database/c360');

class Tickets extends Page {
    get ticketsStatisticsNotFound() { return $(`.//app-tickets//div/div[text()=' No Tickets Found']`) }
    get ticketsHistoryNotFound() { return $(`.//app-table//div/div[text()=' No tickets found ']`) }
    get waitToLoad() { return $(`.//div[text()='Affected By Tickets']`) }
    get scroll() { return $(`.//p[contains(.,'Ticket History')]`) }

    get problem_tickets_count() { return $(`.//ion-label[contains(., 'Problem Ticket')]`) }
    get service_request_count() { return $(`.//ion-label[contains(., 'ServiceRequest')]`) }
    get incident_count() { return $(`.//ion-label[contains(., 'Incident')]`) }
    get email_count() { return $(`.//span[contains(., 'Email')]`) }
    get phone_count() { return $(`.//span[contains(., 'Call')]`) }
    get sms_count() { return $(`.//span[contains(., 'Sms')]`) }
    get web_count() { return $(`.//span[contains(., 'Web')]`) }

    get ticketLoader() { return $(`//ion-loading`) }
    get total_ticket_history_count() { return $(`.//app-tickets//div[@class="mat-mdc-paginator-range-label"]`) }
    ticketNumber_ticket(index) { return $(`.//app-tickets//tbody/tr[${index}]/td[1]/a`) }
    type_ticket(index) { return $(`.//app-tickets//tbody/tr[${index}]/td[2]//ion-label`) }
    category_ticket(index) { return $(`.//app-tickets//tbody/tr[${index}]/td[3]`) }
    assignee_ticket(index) { return $(`.//app-tickets//tbody/tr[${index}]/td[4]`) }
    status_ticket(index) { return $(`.//app-tickets//tbody/tr[${index}]/td[5]//ion-label`) }
    createdDate_ticket(index) { return $(`.//app-tickets//tbody/tr[${index}]/td[6]`) }
    updatedDate_ticket(index) { return $(`.//app-tickets//tbody/tr[${index}]/td[7]`) }
    get clickTicketNumber_TickectHistory() { return $(`.//app-tickets//tbody/tr[1]/td[1]/a`) }
    get clickBackBtn() { return $(`.//app-tickets//div//ion-img`) }

    get validateTicketNumber() { return $(`.//ion-label[contains(@class,"common-sub-header C-P")]`) }
    get subject_ticket() { return $(`.//app-tickets//ion-card-title[@class[contains(., 'common-header')]]`) }
    get description_ticket() { return $(`.//app-tickets//ion-card-content[contains(., 'Description :')]/ion-note`) }
    get status_ticket_click() { return $(`.//app-tickets//ion-label[contains(., 'Status : ')]/span`) }
    get priority_ticket_click() { return $(`.//app-tickets//ion-label[contains(., 'Priority : ')]/span`) }
    get severity_ticket_click() { return $(`.//app-tickets//ion-label[contains(., 'Severity : ')]/span`) }
    get impactDuration_ticket() { return $(`.//app-tickets//ion-label[contains(., 'Impact duration: ')]/span`) }
    relatedTasks_ticket(index) { return $(`//app-tickets//ion-col[contains(., 'tasks')]/following-sibling::ion-col[1]/div[${index}]/ion-note[1]`) }
    relatedDescription_ticket(index) { return $(`//app-tickets//ion-col[contains(., 'tasks')]/following-sibling::ion-col[1]/div[${index}]/ion-note[2]`) }
    get realtedIncident_ticket() { return $(`//app-tickets//ion-col[contains(., 'Incident ticket')]/following-sibling::ion-col[1]/div[1]/ion-note`) }
    get activityLog_dateTime_ticket() { return $(`//app-tickets//ion-col[contains(., 'Activity Log')]/following-sibling::ion-col[1]//ion-label`) }
    get activityLog_description_ticket() { return $(`//app-tickets//ion-col[contains(., 'Activity Log')]/following-sibling::ion-col[1]//ion-note`) }

    async validateTickets(customerId, accountId) {
        super.startStep(`Fetching ticket deatils of the accountId ${accountId} for the customerId ${customerId}`);
        await super.clickTab('Tickets ');
        var { totalChannels, problem, service_request, incident, email, phone, sms, web, ticketHistory, relatedTask, activityLogs, totalTypes, ticketHistoryCount } = await database.getTicketStatistics(customerId, accountId);

        if (totalTypes == 0) {
            await this.ticketsStatisticsNotFound.waitForExist({ timeout: 10000 });
            if (await this.ticketsStatisticsNotFound.isExisting()) {
                super.startStep(`No tickets found for the accountId ${accountId}`);
            } else throw `Not received ticket statistics not found dom`;
            await super.takeScreenshot();
        } else {
            super.startStep(`Validating tickets statistics for the accountId: ${accountId}`);
            await this.waitToLoad.waitForExist({ timeout: 10000 });
            await super.takeScreenshot();
            super.startStep(`No. of problem tickets: ${problem}`);
            var problem_ticketsCount = ((await this.problem_tickets_count.getText()).match(/\d+/g))[0];
            await expect(problem_ticketsCount).toEqual(problem.toString());

            super.startStep(`No. of service Request: ${service_request}`);
            var serviceRequestCount = ((await this.service_request_count.getText()).match(/\d+/g))[0];
            await expect(serviceRequestCount).toEqual(service_request.toString());

            super.startStep(`No. of incident: ${incident}`);
            var incidentCount = ((await this.incident_count.getText()).match(/\d+/g))[0];
            await expect(incidentCount).toEqual(incident.toString());

            var sumOfStatisticsCount = parseInt(problem_ticketsCount) + parseInt(serviceRequestCount) + parseInt(incidentCount);
            if (sumOfStatisticsCount == totalTypes) {
                super.startStep(`As expected,Problem Tickets Count ${problem_ticketsCount} + Service Request Count ${serviceRequestCount} + Incident Count ${incidentCount} = Total ticket count ${totalTypes}`);
            } else throw `Sum of problem ticketsCount: "${problem_ticketsCount}", serviceRequestCount: "${serviceRequestCount}" and incidentCount: "${incidentCount}" is not equal to the total count: "${totalTypes}"`

            super.startStep(`Validating tickets raised by each channel`);
            var phoneCount = ((await this.phone_count.getHTML(false)).match(/\d+/g))[0];
            super.startStep(`Phone channel count: ${phone}`);
            await expect(phoneCount.trim()).toEqual(phone.toString());

            super.startStep(`Email channel count: ${email}`);
            var emailCount = ((await this.email_count.getHTML(false)).match(/\d+/g))[0];
            await expect(emailCount.trim()).toEqual(email.toString());

            super.startStep(`SMS channel count: ${sms}`);
            var smsCount = ((await this.sms_count.getHTML(false)).match(/\d+/g))[0];
            await expect(smsCount).toEqual(sms.toString());

            super.startStep(`Web channel count: ${web}`);
            var webCount = ((await this.web_count.getHTML(false)).match(/\d+/g))[0];
            await expect(webCount).toEqual(web.toString());

            super.startStep(`Checking if sum of Phone, Email, SMS and Web channels count is equal to the totalChannels count`);
            var sumOfChannelCount = parseInt(phoneCount) + parseInt(emailCount) + parseInt(smsCount) + parseInt(webCount);
            if (sumOfChannelCount == totalChannels) {
                super.startStep(`As expected,Phone channel count ${phoneCount} + Email channel count ${emailCount} + SMS channel count ${smsCount} + Web channel count ${webCount} = TotalChannels count ${totalChannels}`);
            } else throw `Sum of Phone: "${phoneCount}", Email: "${emailCount}", SMS: "${smsCount}" and Web: "${webCount}" channels count is not equal to the totalChannels count: "${totalChannels}"`

            super.startStep(`Validating Ticket history table for the accountId: ${accountId}`)
            await super.scrollIntoView(await this.scroll);
            await super.takeScreenshot();
        }
        if (ticketHistoryCount == 0) {
            await this.ticketsHistoryNotFound.waitForExist({ timeout: 10000 });
            if (await this.ticketsHistoryNotFound.isExisting()) {
                super.startStep(`No ticket History found for the accountId ${accountId}`);
            } else throw `Not received ticket not found dom`
            await super.scrollIntoView(await this.ticketsHistoryNotFound);
            await super.takeScreenshot();
        } else {
            await this.clickTicketNumber_TickectHistory.waitForExist({ timeout: 10000 });
            await super.scrollIntoView(await this.clickTicketNumber_TickectHistory);
            await super.takeScreenshot();

            for (let j = 0; j < ticketHistoryCount; j++) {
                var index = j + 1;

                super.startStep(`As expected, ticket number in ticket history is ${ticketHistory[j].ticketNumber}`);
                await super.scrollIntoView(await this.ticketNumber_ticket(index));
                await super.takeScreenshot();
                var ticket_Number = await this.ticketNumber_ticket(index).getText();
                await expect(ticket_Number).toEqual(ticketHistory[j].ticketNumber);

                super.startStep(`As expected, ticket type in ticket history is ${ticketHistory[j].type}`);
                var ticket_Type = await this.type_ticket(index).getText();
                await expect(ticket_Type.toUpperCase()).toEqual(ticketHistory[j].type);

                super.startStep(`As expected, ticket category in ticket history is ${ticketHistory[j].category}`);
                var ticket_Category = await this.category_ticket(index).getText();
                await expect(ticket_Category).toEqual(ticketHistory[j].category);

                super.startStep(`As expected, ticket assignee in ticket history is ${ticketHistory[j].assignee}`);
                var assignee = await this.assignee_ticket(index).getText();
                await expect(assignee).toEqual(ticketHistory[j].assignee);

                super.startStep(`As expected, ticket Number in ticket history status is ${ticketHistory[j].status}`);
                var status = await this.status_ticket(index).getText();
                await expect(status.toUpperCase()).toEqual(ticketHistory[j].status);

                super.startStep(`As expected, created date in ticket history is ${ticketHistory[j].createdDate}`);
                var createdDate = await this.createdDate_ticket(index).getText();
                const expectedDate = new Date(ticketHistory[j].createdDate);
                const recivedDate = new Date(createdDate);
                const formattedExpectedDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                const formattedcreatedDate = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                await expect(formattedcreatedDate).toEqual(formattedExpectedDate);

                super.startStep(`As expected, updated date in ticket history is ${ticketHistory[j].updatedDate}`);
                await super.scrollIntoView(await this.updatedDate_ticket(index));
                var updatedDate = await this.updatedDate_ticket(index).getText();
                const expectedupdatedDate = new Date(ticketHistory[j].updatedDate);
                const recivedupdatedDate = new Date(updatedDate);
                const formattedExpectedupdatedDate = expectedupdatedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                const formattedUpdatedDate = recivedupdatedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                await expect(formattedUpdatedDate).toEqual(formattedExpectedupdatedDate);

                if (index == 1) {
                    super.startStep(`Clicking  on ticket number  ${ticketHistory[j].ticketNumber} to verify its details`);
                    await super.scrollIntoView(await this.ticketNumber_ticket(index));
                    await super.takeScreenshot();
                    await this.ticketNumber_ticket(index).click();
                    await this.clickBackBtn.waitForExist({ timeout: 10000 });

                    const loader = await this.ticketLoader;
                    await loader.waitForDisplayed({ reverse: true, timeout: 10000, timeoutMsg: "Ticket loader is not visible on the screen" });

                    super.startStep(`As expected, ticket Number is ${ticketHistory[j].ticketNumber}`);
                    await this.validateTicketNumber.waitForExist({ timeout: 10000 });
                    var ticketNumber = await this.validateTicketNumber.getText();
                    await expect(ticketNumber).toEqual(ticketHistory[j].ticketNumber);

                    super.startStep(`As expected, ticket category is ${ticketHistory[j].category}`);
                    var category = await this.subject_ticket.getText();
                    await expect(category).toEqual(ticketHistory[j].category);

                    super.startStep(`As expected, ticket subject is ${ticketHistory[j].description}`);
                    var description = await this.description_ticket.getText();
                    await expect(description).toEqual(ticketHistory[j].description);

                    super.startStep(`As expected, ticket Status is ${ticketHistory[j].status} `);
                    var status = await this.status_ticket_click.getText();
                    await expect(status).toEqual(ticketHistory[j].status);

                    super.startStep(`As expected, ticket Priority is ${ticketHistory[j].priority} `);
                    var priority = await this.priority_ticket_click.getText();
                    await expect(priority).toEqual(ticketHistory[j].priority);

                    super.startStep(`As expected, ticket Severity is ${ticketHistory[j].severity} `);
                    var severity = await this.severity_ticket_click.getText();
                    await expect(severity).toEqual(ticketHistory[j].severity);

                    super.startStep(`validating Related task for the accountId: ${accountId}`);
                    if (relatedTask) {
                        for (let i = 0; i < relatedTask.length; i++) {
                            super.startStep(`Related task description "${relatedTask[i].description}" for the task number ${relatedTask[i].taskNumber}`);
                            await super.takeScreenshot();
                            var taskNumber = await this.relatedTasks_ticket(i + 1).getText();
                            await expect(taskNumber).toEqual(relatedTask[i].taskNumber);

                            var description = await this.relatedDescription_ticket(i + 1).getText();
                            await expect(description).toEqual(relatedTask[i].description);

                        }
                    }
                    if (activityLogs) {
                        super.startStep(`Validating activity logs for the accountId: ${accountId}`);
                        await super.scrollIntoView(await this.activityLog_description_ticket);
                        await super.takeScreenshot();
                        super.startStep(`Activity logs body: ${activityLogs.description}`);
                        var description = await this.activityLog_description_ticket.getText();
                        await expect(description).toEqual(activityLogs.description);

                        super.startStep(`Activity logs created time: ${activityLogs.createdDate}`);
                        var createdDate = await this.activityLog_dateTime_ticket.getText();
                        const expectedDate = new Date(activityLogs.createdDate);
                        const recivedDate = new Date(createdDate);
                        const formattedRecivedDate = expectedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                        const formattedActivityLogDate = recivedDate.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
                        await expect(formattedRecivedDate).toEqual(formattedActivityLogDate);
                    }
                    await super.scrollIntoView(await this.clickBackBtn);
                    await (this.clickBackBtn).shadow$('img[part="image"]').click({ button: 0, force: true });
                }
                if (index == 5) {
                    super.startStep(`As expected  totalRecords count for the ticket history table is "${ticketHistoryCount}"`);
                    await super.scrollIntoView(await this.total_ticket_history_count);
                    var totalCount = ((await this.total_ticket_history_count.getText()).split("of "))[1];
                    await expect(totalCount).toEqual(ticketHistoryCount.toString());
                    break;
                }
            }
        }
        super.endStep();
    }
}
module.exports = new Tickets;