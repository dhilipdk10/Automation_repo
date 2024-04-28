const Page = require('./page');
const path = require('path');
const AdminConfigDB = require('../database/admin-config-db');
class TemplateCreationPage extends Page {

    get templateDetailsLbl() { return $('ion-title=Template Details'); }

    get name() { return $('input[name="name"]') }
    get description() { return $('ion-textarea.description-textarea textarea') }
    get category() { return $('mat-select[formcontrolname="category_id"]') }

    channel(channelName) { return $('.//div[contains(@class,"channel-card")]//ion-label[contains(., "' + channelName + '")]') }

    addChannelExisting(channel) { return $('//ion-item//ion-label[text()="' + channel + '"]'); }
    get email_subject() { return $('ion-input[formcontrolname="subject"] input'); }
    get email_body() { return $('ion-textarea[formcontrolname="message"] textarea'); }

    get clickUpload() { return $('.ql-image'); }
    get emailURL() { return $('input[name="url"]'); }
    get clickImg() { return $('ion-radio[value="UPLOAD"]') }
    // get load() { return $('//ion-label[text()="Upload"]/../.') }

    get imageUrl_Email() { return $('input[name="url"]'); }
    get savebtn_Email() { return $('.//ion-col/ion-button/ion-label[text()="Save"]/..') }

    get imageInput() { return $('//ion-label[text()="Image"]/..'); }
    get urlImage() { return $('//ion-label[text()="URL"]'); }
    get upload() { return $('//ion-label[text()="Upload"]'); }
    get addChannelBtn() { return $('.//ion-item/ion-icon[@name="add-outline"]/following-sibling::ion-button[contains(.,"Add Channel")]'); }

    get msg_title() { return $('ion-textarea[formcontrolname="title"] textarea'); }
    get msg_content() { return $('ion-textarea[formcontrolname="msg"] textarea'); }
    get webimg() { return $('ion-label=Upload'); }
    // get webicon() { return $('ion-label=Upload'); }
    get mobilepush_title() { return $('ion-textarea[formcontrolname="mobTitle"] textarea'); }
    get mobilepush_msg() { return $('ion-textarea[formcontrolname="mobMsg"] textarea'); }

    get sms_msg() { return $('ion-textarea[formcontrolname="smsContent"] textarea'); }

    get emailSubjectSystemtag() { return $('ion-img[id=email_subject_dynamic_tag]'); }
    get emailMessageSystemtag() { return $('ion-img[id=email_message_dynamic_tag]'); }

    get webpushTitleSystemtag() { return $('ion-img[id=webpush_title_dynamic_tag]'); }
    get webpushMessageSystemtag() { return $('ion-img[id=webpush_message_dynamic_tag]'); }

    get mobilepushTitlesSystemtag() { return $('ion-img[id=mobilepush_title_dynamic_tag]'); }
    get mobilepushMessageSystemtag() { return $('ion-img[id=mobilepush_message_dynamic_tag]'); }

    get smsContentSystemtag() { return $('ion-img[id=sms_content_dynamic_tag]'); }

    get clickAction() { return $('.//ion-label[text()="Click Action"]/following-sibling::ion-input/input[@placeholder="Enter URL"]'); }
    urlbtn(img) { return $('.//ion-col//h2[text()="' + img + '"]/../../following-sibling::ion-col//ion-segment-button[@value="URL"]'); }
    urlInput(img) { return $('.//ion-col//h2[text()="' + img + '"]/../../../following-sibling::ion-row//input[@placeholder="Enter URL"]'); }

    async createTemplateWithChannelDetails(details) {
        super.startStep("Loading template creation page");
        await expect(this.templateDetailsLbl).toBeExisting();
        super.startStep(`Entering name as ${details.name}`);
        await this.name.setValue(details.name);
        if (details.description) {
            super.startStep(`Entering description ${details.description}`);
            await this.description.setValue(details.description);
        }
        super.startStep(`Selecting category as ${details.categoryName}`);
        await super.searchableDropdownValue(this.category, details.categoryName);
        await super.takeScreenshot("Template details");
        super.startStep(`Clicking on proceed`);
        await super.clickButton('Proceed');
        await super.takeScreenshot();
        await this.fillChannelDetails(details);
        await this.clickSaveButton(details, 'Template Created Successfully!');
        super.endStep();
    }

    async updateTemplateWithChannelDetails(details) {
        await this.updateChannelDetails(details);
        await this.clickSaveButton(details, 'Template Updated Successfully!');
    }

    async fillChannelDetails(details) {
        for (let i = 0; i < details.channels.length; i++) {
            var channel = details.channels[i];
            await this.addChannel(channel);
            if (channel == "Email") {
                await this.fillEmailTemplateDetails(details.email);
            } else if (channel == "Web Push") {
                await this.fillWebpushTemplateDetails(details.webPush);
            } else if (channel == "Mobile Push") {
                await this.fillMobilePushTemplateDetails(details.mobilePush);
            } else if (channel == "SMS") {
                await this.fillSMSTemplateDetails(details.sms);
            }
        }
    }

    async addChannel(channelName) {
        var isAddChannel = await this.addChannelBtn.isExisting();
        if (isAddChannel) {
            super.startStep(`Clicking on add channel`);
            await this.addChannelBtn.click();
        }
        super.startStep(`selecting channel as ${channelName}`);
        const selectedChannel = await this.channel(channelName);
        await expect(selectedChannel).toBeExisting();
        super.executeJsClick(selectedChannel);
        await browser.pause(500);
        await expect(this.addChannelExisting(channelName == "Email" ? "Emailer" : channelName)).toBeExisting();
        super.endStep();
    }

    async fillEmailTemplateDetails(details) {
        super.startStep(`Filling Email channel's details as below:`);
        super.startStep(`Entering subject as ${details.subject}`);
        await this.email_subject.setValue(details.subject);
        // await super.systemtag(this.emailSubjectSystemtag, details.emailSubjectSystemtag);
        super.startStep(`Entering body as ${details.body}`);
        await this.email_body.setValue(details.body);
        await super.takeScreenshot("Email details");
        super.endStep();
    }


    async fillWebpushTemplateDetails(details) {
        super.startStep(`Filling Web push channel's details as below:`);
        super.startStep(`Entering title as ${details.title}`);
        await this.msg_title.setValue(details.title);
        if (details.webpushTitleSystemtag) {
            await super.startStep(`Choosing title's systemTag as ${details.webpushTitleSystemtag}`);
            await super.systemtag(this.webpushTitleSystemtag, details.webpushTitleSystemtag);
        }
        super.startStep(`Entering content as ${details.content}`);
        await this.msg_content.setValue(details.content);
        if (details.webpushMessageSystemtag) {
            super.startStep(`Choosing content's systemTag as ${details.webpushMessageSystemtag}`);
            await super.systemtag(this.webpushMessageSystemtag, details.webpushMessageSystemtag);
        }
        if (details.clickAction) {
            super.startStep(`Entering clickAction as ${details.clickAction}`);
            await this.clickAction.setValue(details.clickAction)
        }
        if (details.image) {
            super.startStep(`Entering imgae url  as ${details.image}`);
            await this.urlbtn('Image').click();
            await expect(this.urlInput('Image')).toBeExisting();
            await this.urlInput('Image').setValue(details.image);
        }
        if (details.icon) {
            await super.startStep(`Entering icon url as ${details.icon}`);
            await this.urlbtn('Icon').click();
            await expect(this.urlInput('Icon')).toBeExisting();
            await this.urlInput('Icon').setValue(details.icon);
        }
        await super.takeScreenshot("WebPush details");
        super.endStep();
    }

    async fillMobilePushTemplateDetails(details) {
        super.startStep(`Filling Mobile Push channel details as below:`);
        super.startStep(`Entering title as ${details.title}`);
        await this.mobilepush_title.setValue(details.title);
        super.startStep(`Entering message as ${details.message}`);
        await this.mobilepush_msg.setValue(details.message);
        if (details.mobilepushMessageSystemtag) {
            super.startStep(`Choosing message system tag as ${details.mobilepushMessageSystemtag}`);
            await super.systemtag(this.mobilepushMessageSystemtag, details.mobilepushMessageSystemtag);
        }
        if (details.image) {
            super.startStep(`Entering image url as ${details.image}`);
            await this.urlbtn('Image').click();
            await expect(this.urlInput('Image')).toBeExisting();
            await this.urlInput('Image').setValue(details.image);
        }
        if (details.clickAction) {
            super.startStep(`Entering clickAction as ${details.clickAction}`)
            await this.clickAction.setValue(details.clickAction);
        }
        await super.takeScreenshot("MobilePush details");
        super.endStep();
    }

    async fillSMSTemplateDetails(details) {
        super.startStep(`Filling SMS channel details as below:`);
        super.startStep(`Entering content as ${details.content}`);
        await this.sms_msg.setValue(details.content);
        super.startStep(`Choosing content's system tag as ${details.smsContentSystemtag}`);
        await super.systemtag(this.smsContentSystemtag, details.smsContentSystemtag);
        await super.takeScreenshot("SMS details");
        super.endStep();
    }

    async updateChannelDetails(details) {
        for (let i = 0; i < details.channels.length; i++) {
            var channel = details.channels[i];
            await this.addChannel(channel);
            if (channel == "Email") {
                await this.updateEmailTemplateDetails(details.email);
            } else if (channel == "Web Push") {
                await this.updateWebpushTemplateDetails(details.webPush);
            } else if (channel == "Mobile Push") {
                await this.updateMobilePushTemplateDetails(details.mobilePush);
            } else if (channel == "SMS") {
                await this.updateSMSTemplateDetails(details.sms);
            }
        }
    }

    async updateEmailTemplateDetails(details) {
        super.startStep("Updating Email channel details as below:");
        super.startStep(`Updating subject as ${details.subject}`);
        await browser.pause(500);
        await this.email_subject.setValue(details.subject);
        // await super.systemtag(this.emailSubjectSystemtag, details.emailSubjectSystemtag);
        super.startStep(`Updating body as ${details.body}`);
        await this.email_body.setValue(details.body);
        await super.takeScreenshot();
        super.endStep();
    }

    async updateWebpushTemplateDetails(details) {
        super.startStep('Updating WebPush channel details as below:');
        super.startStep(`Updating title as ${details.title}`);
        await this.msg_title.setValue(details.title);
        if (details.webpushTitleSystemtag) {
            super.startStep(`Choosing title's systemTag as ${details.webpushTitleSystemtag}`);
            await super.systemtag(this.webpushTitleSystemtag, details.webpushTitleSystemtag);
        }
        super.startStep(`Updating content as ${details.content}`);
        await this.msg_content.setValue(details.content);
        if (details.webpushMessageSystemtag) {
            super.startStep(`Choosing content's systemTag as ${details.webpushMessageSystemtag}`);
            await super.systemtag(this.webpushMessageSystemtag, details.webpushMessageSystemtag);
        }
        if (details.clickAction) {
            super.startStep(`Updating clickAction as ${details.clickAction}`);
            await this.clickAction.setValue(details.clickAction)
        }
        await this.urlbtn('Image').click();
        if (details.image) {
            super.startStep(`Updating imgae url  as ${details.image}`);
            await this.urlInput('Image').setValue(details.image);
        }
        await this.urlbtn('Icon').click();
        if (details.icon) {
            super.startStep(`Updating icon url as ${details.icon}`);
            await this.urlInput('Icon').setValue(details.icon);
        }
        await super.takeScreenshot("WebPush details");
        super.endStep();
    }

    async updateMobilePushTemplateDetails(details) {
        super.startStep(`Updating MobilePush channel as below:`);
        super.startStep(`Updating title as ${details.title}`);
        await this.mobilepush_title.setValue(details.title);
        super.startStep(`Updating message as ${details.message}`);
        await this.mobilepush_msg.setValue(details.message);
        if (details.mobilepushMessageSystemtag) {
            super.startStep(`Choosing message system tag as ${details.mobilepushMessageSystemtag}`);
            await super.systemtag(this.mobilepushMessageSystemtag, details.mobilepushMessageSystemtag);
        }
        await this.urlbtn('Image').click();
        if (details.image) {
            super.startStep(`Updating image url as ${details.image}`);
            await this.urlInput('Image').setValue(details.image);
        }
        if (details.clickAction) {
            super.startStep(`Updating clickAction as ${details.clickAction}`)
            await this.clickAction.setValue(details.clickAction);
        }
        await super.takeScreenshot("MobilePush details");
        super.endStep();
    }

    async updateSMSTemplateDetails(details) {
        super.startStep(`Updating SMS content as ${details.content}`);
        await this.sms_msg.setValue(details.content);
        super.startStep(`Choosing content's system tag as ${details.smsContentSystemtag}`);
        await super.systemtag(this.smsContentSystemtag, details.smsContentSystemtag);
        await super.takeScreenshot();
        super.endStep();
    }

    async clickSaveButton(details, message) {
        super.startStep(`Confirming that template has been created successfully by checking toaster message`);
        await super.clickButton('Save', true);
        await super.validateToasterMessage(message);
        await super.takeScreenshot();
        super.startStep(`Validating whether template is created in the database with name "${details.name}"`)
        await expect(await AdminConfigDB.validate.isTemplateExists(details.name, details.categoryName)).toEqual(true);
        super.endStep();
    }
}

module.exports = new TemplateCreationPage();