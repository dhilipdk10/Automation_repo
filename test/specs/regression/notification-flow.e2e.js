const Database = require("./../../database/Database");
const Util = require('../../util/util');
const HomePage = require('../../pageobjects/home.page');
const LoginPage = require('../../pageobjects/login.page');
const AdminConfigDB = require('../../database/admin-config-db');
const EmailValidation = require('../../pageobjects/emailValidation')
const NotificationFlowDB = require('../../database/notification-flow-db');
const NotificationHistoryPage = require('../../pageobjects/notificationHistoryPage');
const NotificationLandingPage = require('../../pageobjects/notification-landing.page');
const NotificationCreationPage = require('../../pageobjects/notification-creation.page');
const { Login } = require('../../../test-data/regression/login.json');
const { NotificationFlow, OutLook, DataSetup, DataCleanup } = require('../../../test-data/regression/notification-flow.json');
const notificationLandingPage = require("../../pageobjects/notification-landing.page");

describe('Notification Flow Validation', () => {

    it('Database setup', async () => {
        try {
            await Database.getDB();
            await Promise.all(Object.keys(NotificationFlow).map(async (key) => {
                var obj = NotificationFlow[key];
                if (obj.type == "Single User") obj.userId = await NotificationFlowDB.getUserIdbyEmail(obj.email);
                if (obj.edit) obj.edit.messageType = obj.messageType;
                if (obj.clone) obj.clone.messageType = obj.messageType;
                if (obj.schedule_type == "Send Later") obj.scheduleTime = Util.getScheduleTime();
                if (obj?.edit?.schedule_type == "Send Later") obj.edit.scheduleTime = Util.getScheduleTime();//Optional chaining.
                if (obj?.clone?.schedule_type == "Send Later") obj.clone.scheduleTime = Util.getScheduleTime();
                if (obj.emailValidation) obj.emailValidation.from = OutLook.loginDetails.from;
            }));

            Util.startStep("If the data already exists, removing the test data from the database.");
            await NotificationFlowDB.delete_notificationAndChildDataByCategoryName(DataCleanup.categoryNameList);
            await AdminConfigDB.delete_categoryAndTemplate(DataCleanup.categoryNameList);
            await AdminConfigDB.delete_userSegment(DataCleanup.userSegmentNameList);

            Util.startStep("Creating categories & template in Database");
            await AdminConfigDB.create_categoryAndTemplate(DataSetup.category);
            Util.startStep("Creating user segmentation rules in Database");
            await AdminConfigDB.create_userSegment(DataSetup.userSegment);
            Util.endStep();
        } catch (error) { Util.reportFailedStatus(error); }
    });

    it('Logging in with valid credentials', async () => {
        try {
            await browser.maximizeWindow();
            await LoginPage.open();
            await LoginPage.login(Login.Credential);
            await HomePage.validateLogin(Login.Credential);
        } catch (error) {
            Util.reportFailedStatus(error);
        }
    });

    it('Single User - Template msg with Low priority category - Save ', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(NotificationFlow.single_template_save);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.single_template_save);

        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Single User - Template msg with Low priority category - Edit and Send Now', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.editNotification(NotificationFlow.single_template_save);
            await NotificationCreationPage.verifyingDetailsOfCreatedNotification(NotificationFlow.single_template_save);
            await NotificationCreationPage.createNotification(NotificationFlow.single_template_save.edit);
            await notificationLandingPage.addDetailsToEditAndClone(NotificationFlow.single_template_save);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.single_template_save.edit);

            await NotificationLandingPage.viewNotificationHistory(NotificationFlow.single_template_save);
            await NotificationHistoryPage.validateHistory(NotificationFlow.single_template_save);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Single User - Template msg with Low priority category - Clone and SendLater', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.cloneNotification(NotificationFlow.single_template_save);
            await NotificationCreationPage.verifyingDetailsOfCreatedNotification(NotificationFlow.single_template_save);
            await NotificationCreationPage.schedule_Notification(NotificationFlow.single_template_save.clone)
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.single_template_save.clone);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Single User - Template msg with Mandatory priority category - Send Later', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(NotificationFlow.single_template_sendLater);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.single_template_sendLater);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Single User - Custom msg with Mandatory priority category - Send Now - With Email Validation', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(NotificationFlow.single_custom_sendNow);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.single_custom_sendNow);

            await NotificationLandingPage.viewNotificationHistory(NotificationFlow.single_custom_sendNow);
            await NotificationHistoryPage.validateHistory(NotificationFlow.single_custom_sendNow);

            try {
                await EmailValidation.loginOutlook(OutLook.loginDetails);
                await EmailValidation.recivedEmailValidation(NotificationFlow.single_custom_sendNow.emailValidation);
            } catch (e) {
                Util.endStep("failed");
                throw e;
            } finally {
                await EmailValidation.closeAndSwitchTab();
            }
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Single User - Custom msg with Medium priority category - Send Later', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(NotificationFlow.single_custom_sendLater);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.single_custom_sendLater);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Multiple User - Template msg with Mandatory priority category - Send Now', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(NotificationFlow.Multiple_template_sendNow);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.Multiple_template_sendNow);

            await NotificationLandingPage.viewNotificationHistory(NotificationFlow.Multiple_template_sendNow);
            await NotificationHistoryPage.validateHistory(NotificationFlow.Multiple_template_sendNow);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Multiple User - Template msg with Medium priority category - Send Later', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(NotificationFlow.Multiple_template_sendLater);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.Multiple_template_sendLater);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Multiple User - Custom msg with Low priority category - Send Now', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(NotificationFlow.Multiple_custom_sendNow);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.Multiple_custom_sendNow);

            await NotificationLandingPage.viewNotificationHistory(NotificationFlow.Multiple_custom_sendNow);
            await NotificationHistoryPage.validateHistory(NotificationFlow.Multiple_custom_sendNow);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Multiple User - Custom msg with Mandatory priority category - Send Later', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(NotificationFlow.Multiple_custom_sendLater);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.Multiple_custom_sendLater);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Treating the email content as an image and performing comparison and validation', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(NotificationFlow.single_template_sendNow_high);
            await NotificationLandingPage.validateCreatedNotification(NotificationFlow.single_template_sendNow_high);
            await NotificationLandingPage.viewNotificationHistory(NotificationFlow.single_template_sendNow_high);
            await NotificationHistoryPage.validateHistory(NotificationFlow.single_template_sendNow_high);
            try {
                await EmailValidation.loginOutlook(OutLook.loginDetails);
                await EmailValidation.compareImage(NotificationFlow.single_template_sendNow_high.emailValidation);
            } catch (e) {
                Util.endStep("failed");
                throw e;
            } finally {
                await EmailValidation.closeAndSwitchTab();
            }
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Database cleanup', async () => {
        try {
            Util.startStep("Deleting above creted notifications in Database");
            await NotificationFlowDB.delete_notificationAndChildDataByCategoryName(DataCleanup.categoryNameList);
            Util.startStep("Deleting above created categories & template in Database");
            await AdminConfigDB.delete_categoryAndTemplate(DataCleanup.categoryNameList);
            Util.startStep("Deleting above created user segmentation rules in Database");
            await AdminConfigDB.delete_userSegment(DataCleanup.userSegmentNameList);
            Util.endStep();
        } catch (error) { Util.reportFailedStatus(error); }
    });

});