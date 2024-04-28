const Util = require("../util/util");

module.exports = class page {
  startStep(message) {
    Util.startStep(message);
  }
  endStep(status) {
    Util.endStep(status);
  }
  addAttachment(name, content, type) {
    Util.addAttachment(name, content, type);
  }

  click_Tab(title) {
    return $(`.//li[contains(., '${title}')]`);
  }

  async clickTab(title) {
    await this.click_Tab(title).click();
    await browser.pause(3000);
  }
  async currencyUnit(currencyCode) {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£ ",
    };
    return symbols[currencyCode] || currencyCode;
  }
  async scrollIntoView(elem) {
    const getResult = async function (elem) {
      await elem.scrollIntoView({ block: "center", inline: "center" });
    };
    await browser.execute(getResult, await elem);
    await browser.pause(500);
  }

  async takeScreenshot(message = "Screenshot") {
    this.startStep(message, true);
    await browser.takeScreenshot();
  }
  open(path) {
    return browser.url(path);
  }
};
