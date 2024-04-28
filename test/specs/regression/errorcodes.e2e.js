const Util = require('../../util/util');
const Database = require("./../../database/Database");
const HomePage = require('../../pageobjects/home.page');
const LoginPage = require('../../pageobjects/login.page');
const NotificationFlowDB = require('../../database/notification-flow-db');
const NotificationHistoryPage = require('../../pageobjects/notificationHistoryPage');
const NotificationLandingPage = require('../../pageobjects/notification-landing.page');
const NotificationCreationPage = require('../../pageobjects/notification-creation.page');
const ErrorBaseline = require('../../pageobjects/errorBaseline-landing.page');
const ABtestingLandingpage = require('../../pageobjects/abtesting-landing.page');

const { Login } = require('../../../test-data/regression/login.json');
const { errorcodes, API } = require('../../../test-data/regression/error_flow.json');
const Notification = require('../../api/notification');
const User = require('../../api/user');

before(async () => {
    var accessToken = await User.generateToken();
    Notification.XSRFTOKEN = accessToken;
});

describe('Error Codes validation for failed notifications', () => {
    it('Database setup', async () => {
        try {
            await Database.getDB();
            await Promise.all(Object.keys(errorcodes).map(async (key) => {
                var obj = errorcodes[key];
                if (obj.type == "Single User") obj.userId = await NotificationFlowDB.getUserIdbyEmail(obj.email);
            }));
        } catch (error) { Util.reportFailedStatus(error); }
    })
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
    it('ERR-4102 : ERROR_SES_EMAIL_NOT_VERIFIEDSES', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(errorcodes.ERR_4102);
            await NotificationLandingPage.validateCreatedNotification(errorcodes.ERR_4102);

            await NotificationLandingPage.viewNotificationHistory(errorcodes.ERR_4102);
            await NotificationHistoryPage.validateHistory(errorcodes.ERR_4102);
            await ErrorBaseline.errorBaseLine(errorcodes.ERR_4102);
        } catch (e) { Util.reportFailedStatus(e) }
    });
    it('ERR-4002 : ERROR_FIREBASE_WEB_PUSH', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(errorcodes.ERR_4002);
            await NotificationLandingPage.validateCreatedNotification(errorcodes.ERR_4002);

            await NotificationLandingPage.viewNotificationHistory(errorcodes.ERR_4002);
            await NotificationHistoryPage.validateHistory(errorcodes.ERR_4002);
            await ErrorBaseline.errorBaseLine(errorcodes.ERR_4002);
        } catch (e) { Util.reportFailedStatus(e) }
    });
    it('ERR-4003 : ERROR_FIREBASE_MOBILE_PUSH', async () => {
        try {
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.clickCreateNotificationButton();

            await NotificationCreationPage.createNotification(errorcodes.ERR_4003);
            await NotificationLandingPage.validateCreatedNotification(errorcodes.ERR_4003);

            await NotificationLandingPage.viewNotificationHistory(errorcodes.ERR_4003);
            await NotificationHistoryPage.validateHistory(errorcodes.ERR_4003);
            await ErrorBaseline.errorBaseLine(errorcodes.ERR_4003);
        } catch (e) { Util.reportFailedStatus(e) }
    });
    it('ERR-3002 : ERROR_CHANNEL_NOT_FOUND', async () => {
        try {
            await Notification.create_Template_Notification(API.ERR_3002);

            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.validateCreatedNotification(API.ERR_3002);
            await NotificationLandingPage.viewNotificationHistoryResult(API.ERR_3002);
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.verifyRetryOption(API.ERR_3002);
            await ErrorBaseline.errorBaseLine(API.ERR_3002);
        }
        catch (error) {
            Util.reportFailedStatus(error);
        }
    });

    it('ERR-4001 : ERROR_FIREBASE_INVALID_OR_NOT_REGISTERED_IDENTIFIER', async () => {
        try {
            await User.addChannel(API.ERR_4001.addChannels);
            await Notification.create_Template_Notification(API.ERR_4001);

            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.validateCreatedNotification(API.ERR_4001);
            await NotificationLandingPage.viewNotificationHistoryResult(API.ERR_4001);
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.verifyRetryOption(API.ERR_4001);
            await ErrorBaseline.errorBaseLine(API.ERR_4001);
        }
        catch (error) {
            Util.reportFailedStatus(error);
        }
    });
    it('ERR-3003 : ERROR_NOT_ENOUGH_USER_FOR_AB_TESTING', async () => {
        try {
            await Notification.create_ABTesting_Notification(API.ERR_3003);

            await HomePage.selectMenu("A/B testing");
            await ABtestingLandingpage.validateCreatedABtest(API.ERR_3003.validateABTesting);
            await ABtestingLandingpage.viewAbTestResult(API.ERR_3003.validateABTesting);
            await ABtestingLandingpage.retryFailedNotification(API.ERR_3003.validateABTesting);
            await HomePage.selectMenu("A/B testing");
            await ABtestingLandingpage.verifyRetryOption(API.ERR_3003.validateABTesting);
            await ErrorBaseline.errorBaseLine(API.ERR_3003.validateABTesting);
        }
        catch (error) {
            Util.reportFailedStatus(error);
        }
    });
    it('ERR-3001 : ERROR_USER_NOT_FOUND', async () => {
        try {
            await Notification.create_Template_Notification(API.ERR_3001);

            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.validateCreatedNotification(API.ERR_3001);
            await NotificationLandingPage.viewNotificationHistoryResult(API.ERR_3001);
            await HomePage.selectMenu('Notification');
            await NotificationLandingPage.verifyRetryOption(API.ERR_3001);
            await ErrorBaseline.errorBaseLine(API.ERR_3001);
        }
        catch (error) {
            Util.reportFailedStatus(error);
        }
    });
});