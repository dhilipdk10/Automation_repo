const { config } = require('./wdio.conf');

// Dymanic field "--browser", "--maxInstance"

var inputArg = {};
process.argv.forEach((key, index) => {
    var value = process.argv[index + 1] || '';
    if (key.startsWith('--')) {
        inputArg[key.replace('--', '')] = value.startsWith('--') ? '' : value;
    }
});

if (inputArg.browser == 'chrome-headless') {
    config.capabilities = [{
        maxInstances: inputArg.maxInstance || 5,
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--disable-infobars', '--headless', '--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox', '--disable-dev-shm-usage', 'window-size=1920,1080']
        },
        acceptInsecureCerts: true
    }];
    process.env.BROWSER = "Chrome (Headless)"
}

exports.config = config;