const Util = require('../../util/util');
const HomePage = require('../../pageobjects/home.page');
const LoginPage = require('../../pageobjects/login.page');
const { DataCleanup, Category, Template } = require('../../../test-data/regression/admin-config.json');
const { Login } = require('../../../test-data/regression/login.json');
const { userSegment } = require('../../../test-data/regression/admin-config.json');
const CategoryLandingPage = require('../../pageobjects/category-landing.page');
const CategoryCreationgPage = require('../../pageobjects/category-creation.page');
const TemplateLandingPage = require('../../pageobjects/template-landing.page');
const TemplateCreationPage = require('../../pageobjects/template-creation.page');
const CreateUserSegment = require('../../pageobjects/user_segment-creation.page');
const UserSegmentLandingPage = require('../../pageobjects/user_segment-landing.page');
const AdminConfigDB = require('../../database/admin-config-db');

describe('Admin Configuration', () => {

    before('Logging in with valid credentials', async () => {
        try {
            Util.startStep("If the data already exists, removing the test data from the database.");
            await AdminConfigDB.delete_categoryAndTemplate(DataCleanup.categoryNameList);
            await AdminConfigDB.delete_userSegment(DataCleanup.userSegmentNameList);

            await browser.maximizeWindow();
            await LoginPage.open();
            await LoginPage.login(Login.Credential);
            await HomePage.validateLogin(Login.Credential);
            Util.endStep();
        } catch (error) {
            await browser.takeScreenshot();
            Util.reportFailedStatus(error);
        }
    });

    after('Database Cleanup', async () => {
        Util.startStep("Deleting Created Category and Template in Database");
        await AdminConfigDB.delete_categoryAndTemplate(DataCleanup.categoryNameList);

        Util.startStep("Deleting Created User segment in Database");
        await AdminConfigDB.delete_userSegment(DataCleanup.userSegmentNameList);

        Util.endStep();
    });

    describe('Category', () => {
        it('Create Category-Mandatory priority', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'Category');

                await CategoryLandingPage.clickCreateCategoryButton();

                await CategoryCreationgPage.fillCategoryDetails(Category.MandatoryPriority_PerDay);
                await CategoryLandingPage.validateCreatedCategory(Category.MandatoryPriority_PerDay);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
        it('Create Category-Medium priority', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'Category');

                await CategoryLandingPage.clickCreateCategoryButton();

                await CategoryCreationgPage.fillCategoryDetails(Category.MediumPriority_PerWeek);
                await CategoryLandingPage.validateCreatedCategory(Category.MediumPriority_PerWeek);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
        it('Create Category-Low priority', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'Category');

                await CategoryLandingPage.clickCreateCategoryButton();

                await CategoryCreationgPage.fillCategoryDetails(Category.LowPriority_PerMonth);
                await CategoryLandingPage.validateCreatedCategory(Category.LowPriority_PerMonth);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
        it('Update Category', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'Category');
                await CategoryLandingPage.updateCategory(Category.updateCategory);
                await CategoryCreationgPage.updateCategoryDetails(Category.updateCategory);
                await CategoryLandingPage.validateCreatedCategory(Category.updateCategory);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
        it('Delete Category', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'Category');
                await CategoryLandingPage.deleteCategory(Category.deleteCategory);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
    });
    describe('Template', () => {
        it('Create Template', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'Template');
                await TemplateLandingPage.clickCreateTemplateButton();
                await TemplateCreationPage.createTemplateWithChannelDetails(Template.createTemplate);
                await TemplateLandingPage.validateTemplate(Template.createTemplate);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
        it('Update Template', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'Template');
                await TemplateLandingPage.editTemplate(Template.updateTemplate);
                await TemplateCreationPage.updateTemplateWithChannelDetails(Template.updateTemplate);
                await TemplateLandingPage.validateTemplate(Template.updateTemplate);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
        it('Delete template', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'Template');
                await TemplateLandingPage.deleteTemplate(Template.deleteTemplate);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        })
    });
    describe('User Segment', () => {
        it('Create User Segmentation rule', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'User Segment');
                await UserSegmentLandingPage.clickCreateUserSegmentButton();
                await browser.pause(2000);
                await CreateUserSegment.createSegment(userSegment.createUserSegment);
                await UserSegmentLandingPage.validateCreatedUserSegment(userSegment.createUserSegment);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
        it('Update User Segmentation rule', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'User Segment');
                await CreateUserSegment.updateUserSegment(userSegment.updateUserSegment);
                await browser.pause(1000);
                await UserSegmentLandingPage.validateCreatedUserSegment(userSegment.updateUserSegment);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
        it('Delete User Segmentation rule', async () => {
            try {
                await HomePage.selectMenu('Configuration', 'User Segment');
                await UserSegmentLandingPage.deleteUserSegment(userSegment.deleteUserSegment);
                await browser.pause(1000);
            } catch (error) {
                Util.reportFailedStatus(error);
            }
        });
    });
});
