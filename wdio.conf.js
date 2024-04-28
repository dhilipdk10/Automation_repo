const allure = require('allure-commandline')
const Path = require('path');
const Util = require('./test/util/util');

exports.config = {
    runner: 'local',
    specs: [
        './test/specs/*.js'
    ],
    exclude: [
        // 'path/to/excluded/files'
    ],
    suites: {
        regression: ['./test/specs/regression/signup-login-flow.js',
            './test/specs/regression/search-flow-e2e.js',
            './test/specs/regression/customer360-flow-e2e.js'],
        sanity: ['./test/specs/sanity/*.js']
    },
    maxInstances: 5,
    capabilities: [{
        maxInstances: 5,
        browserName: 'chrome',
        acceptInsecureCerts: true,
        'goog:chromeOptions': {
            prefs: {
                'profile.default_content_setting_values.notifications': 2
            }
        }
    }],
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    // logLevel: process.env.LOG_LEVEL || 'error',
    logLevel: 'error',
    bail: 0,
    baseUrl: process.env.APP_URL,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['chromedriver', 'intercept', ['image-comparison',
        {
            baselineFolder: Path.join(process.cwd(), './baselineImages/'),
            formatImageName: '{tag}',
            screenshotPath: Path.join(process.cwd(), './actualImages/'),
            savePerInstance: true,
            autoSaveBaseline: true,
            blockOutStatusBar: true,
            blockOutToolBar: true,
        }]
    ],
    framework: 'mocha',
    reporters: ['spec', ['allure', { outputDir: 'allure-results', disableWebdriverStepsReporting: true }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 1000000
    },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    before: async function (capabilities, specs) {
        if (specs) {
            await browser.maximizeWindow();
            Util.addEnvironmentDetails();
            Util.addExecutorDetails();
        }
    },
    /**
     * Function to be executed after a test (in Mocha/Jasmine only)
     * @param {Object}  test             test object
     * @param {Object}  context          scope object the test was executed with
     * @param {Error}   result.error     error object in case the test fails, otherwise `undefined`
     * @param {Any}     result.result    return object of test function
     * @param {Number}  result.duration  duration of test
     * @param {Boolean} result.passed    true if test has passed, otherwise false
     * @param {Object}  result.retries   informations to spec related retries, e.g. `{ attempts: 0, limit: 0 }`
     */
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            await browser.takeScreenshot();
        }
    },
    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    onComplete: function (exitCode, config, capabilities, results) {
        const reportError = new Error('Could not generate Allure report')
        const generation = allure(['generate', 'allure-results', '--clean'])
        return new Promise((resolve, reject) => {
            const generationTimeout = setTimeout(() => reject(reportError), 20 * 1000)
            generation.on('error', async function (err) {
                console.error("Error =>", err);
            });
            generation.on('exit', async function (exitCode) {
                try {
                    clearTimeout(generationTimeout);
                    if (exitCode !== 0) {
                        return reject(reportError);
                    }
                    Util.modifyAllureScript();
                    console.log('Allure report successfully generated');
                    if (process.env.IS_LOCAL_DEVELOPMENT != "true") await Util.deleteReportFolders("results/");
                } catch (err) {
                    console.error("Error =>", err);
                }
                resolve()
            })
        })
    }
}
