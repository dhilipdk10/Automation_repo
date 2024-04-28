const fs = require('fs-extra');
const assert = require('assert');
const moment = require('moment');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({ apiVersion: "2006-03-01", region: process.env.AWS_REGION });

const { startStep, endStep, addAttachment } = require('@wdio/allure-reporter');

const Util = {
    isStepStarted: false,
    startStep: (message) => {
        Util.endStep();
        startStep(message);
        Util.isStepStarted = true;
    },
    endStep: (status) => {
        if (Util.isStepStarted) {
            endStep(status);
            Util.isStepStarted = false;
        }
    },
    addAttachment: (name, content, type) => {
        addAttachment(name, content, type);
    },
    reportFailedStatus: (error) => {
        console.error("Step Error => ", error);
        if (error.message == "invalid session id") {
            console.error("Issue related to 'invalid session id' detected");
        }
        Util.endStep("failed");
        try { browser.disableInterceptor() } catch (e) { }
        assert.fail(error.message || error);
    },
    getScheduleTime: function () {
        return moment().add(1, 'days').format('MM/DD/YYYY, HH:mm:ss');
    },
    addEnvironmentDetails: function () {
        let env_Variables =
            `<environment>
            <parameter>
                <key>Browser Name</key>
                <value>${process.env.BROWSER || browser.capabilities.browserName}</value>
            </parameter>    
            <parameter>
                <key>Browser Version</key>
                <value>${browser.capabilities.browserVersion}</value>
            </parameter>
            <parameter>
                <key>Application URL</key>
                <value>${process.env.APP_URL}</value>
            </parameter>
            <parameter>
                <key>API URL</key>
                <value>${process.env.API_URL}</value>
            </parameter>
            <parameter>
                <key>Database Host</key>
                <value>${process.env.DATABASE_HOST}</value>
            </parameter>
        </environment>`;
        fs.writeFileSync('./allure-results/environment.xml', env_Variables);

    },
    addExecutorDetails: function () {
        if (process.env.CODEBUILD_BUILD_ID) {
            var projectName = process.env.CODEBUILD_BUILD_ID.split(":")[0];
            var awsAccountId = process.env.CODEBUILD_BUILD_ARN.split(":")[4];
            var executor_Variables =
                `{
                "name": "AWS Code Build",
                "type": "codebuild",
                "buildName": "${projectName}",
                "buildUrl": "https://${process.env.AWS_REGION}.console.aws.amazon.com/codesuite/codebuild/${awsAccountId}/projects/${projectName}/build/${process.env.CODEBUILD_BUILD_ID.replace(":", "%3A")}/log?region=${process.env.AWS_REGION}"
            }`;
            fs.writeFileSync('./allure-results/executor.json', executor_Variables);
        }
    },
    modifyAllureScript: function () {
        try {
            fs.copySync("./allure/icons", "./allure-report/icons");
            fs.appendFileSync('./allure-report/styles.css', ".executor-icon__codebuild {background-image: url(./icons/codebuild-icon.png)} div.widgets-grid div[data-id='behaviors'], div.widgets-grid div[data-id='history-trend'] { display: none }");
            console.log("**************** Update App.js File started ******************");

            var suitsJson = JSON.parse(fs.readFileSync("./allure-report/data/suites.json", "utf-8"));
            var mapArray = suitsJson.children.map(obj => obj.uid);

            var widgetSuitsJson = JSON.parse(fs.readFileSync("./allure-report/widgets/suites.json", "utf-8"));
            widgetSuitsJson.items.sort((a, b) => mapArray.indexOf(a.uid) - mapArray.indexOf(b.uid));
            fs.writeFileSync("./allure-report/widgets/suites.json", JSON.stringify(widgetSuitsJson));

            var appjsScript = fs.readFileSync("./allure-report/app.js", "utf-8");
            appjsScript = appjsScript
                .replace('href="."', 'href="index.html"')
                .replace('sorter:"sorter.name"', 'sorter:"sorter.order"')
                .replace('".fa-sort-asc":".fa-sort-desc"', '".fa-sort-desc":".fa-sort-asc"')
                .replace('byOrder,byName', 'byOrder,byOrder')
                .replace('window.localStorage.getItem(e.storageKey());',
                    `window.localStorage.getItem(e.storageKey());
                    if(!n && e.storageKey() === 'ALLURE_REPORT_SETTINGS_WIDGETS') {
                    n = '{"widgets":[["summary","environment","executors"],["suites","categories"]]}'
                };`
                )
            fs.writeFileSync("./allure-report/app.js", appjsScript);
            console.log("**************** Update App.js File completed ******************");

            /* ----------------- BELOW CODE IS TO CHECK STRING VARIABLE TO DO SOME ALTERATIONS  ------------------------------------ */

            // const newFileName = 'newFile.txt'; // You can change the file name and extension as needed
            // const newFilePath = path.join(directoryPath, newFileName);
            // fs.writeFile(newFilePath, appjsScript, (err) => {
            //     if (err) {
            //         console.error('Error writing file:', err);
            //     } else {
            //         console.log('File written successfully!');
            //         console.log('New file path:', newFilePath);
            //     }
            // });
        } catch (err) {
            console.error("Error while modify allure script", err);
        }
    },
    deleteReportFolders: async function (prefix) {
        try {
            console.log("Validate and deleting report folder started");
            const bucket = process.env.REPORT_S3_BUCKET_NAME;
            const resultCount = process.env.MAX_RESULT_COUNT || 10;
            const response = await S3.listObjectsV2({ Bucket: bucket, Prefix: prefix, Delimiter: '/' }).promise();
            var sortedFolders = response.CommonPrefixes.sort((a, b) => {
                const prefixA = parseInt(a.Prefix.split('/')[1]);
                const prefixB = parseInt(b.Prefix.split('/')[1]);
                return prefixB - prefixA;
            });
            const foldersToDelete = sortedFolders.slice(resultCount - 1);

            console.log("Folders to Delete => ", foldersToDelete);

            for (let i = 0; i < foldersToDelete.length; i++) {
                const { Prefix } = foldersToDelete[i];

                const objects = await S3.listObjectsV2({ Bucket: bucket, Prefix }).promise();
                const deleteObjects = objects.Contents.map(obj => ({ Key: obj.Key }));

                console.log(`Folder [${Prefix}] start to Delete with ${deleteObjects.length} files`);
                await S3.deleteObjects({ Bucket: bucket, Delete: { Objects: deleteObjects } }).promise();
                console.log(`Folder [${Prefix}] Deleted successfully`);
            }

            console.log("Folders Cleanup Completed");
        } catch (err) {
            console.error("Error while deleting report folder", err);
        }
    }
};

module.exports = Util;