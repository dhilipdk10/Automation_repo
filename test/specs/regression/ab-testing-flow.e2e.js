const HomePage = require('../../pageobjects/home.page');
const LoginPage = require('../../pageobjects/login.page');
const ABtesting = require('../../pageobjects/abtesting-creation.page');
const ABtestingLandingpage = require('../../pageobjects/abtesting-landing.page');
const { ABTestingFlow, DataSetup, DataCleanup } = require('../../../test-data/regression/ab-testing-flow.json');
const { Login } = require('../../../test-data/regression/login.json');
const Util = require('../../util/util');
const AdminConfigDB = require('../../database/admin-config-db');
const NotificationFlowDB = require('../../database/notification-flow-db');

describe('A/B testing Flow Validation', () => {

    it('Database setup', async () => {
        try {
            Object.keys(ABTestingFlow).map((key) => {
                var obj = ABTestingFlow[key];
                if (obj.schedule_type == "Send Later") obj.scheduleTime = Util.getScheduleTime();
            });

            Util.startStep("If the data already exists, removing the test data from the database.");
            await NotificationFlowDB.delete_notificationAndChildDataByCategoryName(DataCleanup.categoryNameList);
            await AdminConfigDB.delete_categoryAndTemplate(DataCleanup.categoryNameList);
            await AdminConfigDB.delete_userSegment(DataCleanup.userSegmentNameList);

            Util.startStep("Creating categories & templates in Database");
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

    it('A/B testing - Template with Low priority category - Send Now', async () => {
        try {
            await ABtestingLandingpage.clickCreateABtestingButton();
            await ABtesting.createABtesting(ABTestingFlow.template_sendNow);
            await ABtestingLandingpage.validateCreatedABtest(ABTestingFlow.template_sendNow);
            await ABtestingLandingpage.viewAbTestResult(ABTestingFlow.template_sendNow);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('A/B testing - Template with Mandatory priority category- Send Later', async () => {
        try {
            await ABtestingLandingpage.clickCreateABtestingButton();
            await ABtesting.createABtesting(ABTestingFlow.template_sendLater);
            await ABtestingLandingpage.validateCreatedABtest(ABTestingFlow.template_sendLater);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('A/B testing - Template with Mandatory priority category- Save', async () => {
        try {
            await ABtestingLandingpage.clickCreateABtestingButton();
            await ABtesting.createABtesting(ABTestingFlow.template_save);
            await ABtestingLandingpage.validateCreatedABtest(ABTestingFlow.template_save);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('A/B testing - Template with Mandatory priority category- Send Later - Edit', async () => {
        try {
            await ABtestingLandingpage.clickCreateABtestingButton();
            await ABtesting.createABtesting(ABTestingFlow.template_save);
            await ABtestingLandingpage.validateCreatedABtest(ABTestingFlow.template_save);
            await ABtestingLandingpage.editABTesting(ABTestingFlow.template_save);
            await ABtesting.editABTestDetails(ABTestingFlow.template_save.editDetails);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('A/B testing - Template with Low priority category - Send Now - Clone ', async () => {
        try {
            await ABtestingLandingpage.clickCreateABtestingButton();
            await ABtesting.createABtesting(ABTestingFlow.template_sendLater);
            await ABtestingLandingpage.clickCloneABTesting(ABTestingFlow.template_sendLater);
            await ABtesting.verifyDetailsAndClone(ABTestingFlow.template_sendLater);
            await ABtestingLandingpage.validateCreatedABtest(ABTestingFlow.template_sendLater);
        } catch (e) { Util.reportFailedStatus(e) }
    });

    it('Database Cleanup', async () => {
        try {
            Util.startStep("Deleting above created notifications in Database");
            await NotificationFlowDB.delete_notificationAndChildDataByCategoryName(DataCleanup.categoryNameList);
            Util.startStep("Deleting above created categories in Database");
            await AdminConfigDB.delete_categoryAndTemplate(DataCleanup.categoryNameList);
            Util.startStep("Deleting above created user segments in Database");
            await AdminConfigDB.delete_userSegment(DataCleanup.userSegmentNameList);
            Util.endStep();
        } catch (error) { Util.reportFailedStatus(error); }
    });
});
