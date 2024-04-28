const Page = require("./page");
const database = require("../database/c360");
const Util = require("../util/util");

class Order extends Page {
  get lastPurchaseDate() {
    return $(
      `//app-orders//ion-label[text()=' Last purchase Date ']/following-sibling::ion-note`
    );
  }
  get lastPurchaseAmount() {
    return $(
      `//app-orders//ion-label[text()=' Last purchase Date ']/following-sibling::ion-note/following-sibling::h4`
    );
  }
  get averagePurchaseDate() {
    return $(
      `//app-orders//ion-label[text()=' Average purchase value ']/following-sibling::h4`
    );
  }
  get totalPurchaseValue() {
    return $(
      `//app-orders//ion-label[text()=' Total purchase value ']/following-sibling::h4`
    );
  }

  get orderLoader() {
    return $(`//ion-loading`);
  }
  get ordersNotFound() {
    return $(`//app-orders//div[text()=' No orders found ']`);
  }
  orderNumberClick(optns) {
    return $(
      `//app-orders//thead[//tr//th//span[text()='Order Number']]/following-sibling::tbody//tr[${optns}]//td[1]//a`
    );
  }
  orderNumber(optns) {
    return $(
      `//app-orders//thead[//tr//th//span[text()='Order Number']]/following-sibling::tbody//tr[${optns}]//td[1]`
    );
  }
  orderDate(optns) {
    return $(
      `//app-orders//thead[//tr//th//span[text()='Order date']]/following-sibling::tbody//tr[${optns}]//td[2]`
    );
  }
  order_Status(optns) {
    return $(
      `//app-orders//thead[//tr//th//span[text()='Status']]/following-sibling::tbody//tr[${optns}]//td[3]`
    );
  }
  orderAmount(optns) {
    return $(
      `//app-orders//thead[//tr//th//span[text()='Amount']]/following-sibling::tbody//tr[${optns}]//td[4]`
    );
  }
  get nextPage() {
    return $(`//app-orders//swiper-container//button[@aria-label="Next page"]`);
  }

  get orderDetails() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[contains(.,'Order Id:')]`
    );
  }
  get historyStatus() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()=' Status']/following-sibling::ion-card//ion-note`
    );
  }
  get customerName() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()='Customer Information']/following-sibling::ion-card//ion-note`
    );
  }
  get billingAddress() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()='Billing Address']/following-sibling::ion-card//ion-note[1]`
    );
  }
  get billingPhoneNumber() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()='Billing Address']/following-sibling::ion-card//ion-note/following-sibling::ion-note`
    );
  }
  get shippingAddress() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()='Shipping Address']/following-sibling::ion-card//ion-note[1]`
    );
  }
  get shippingPhoneNumber() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()='Shipping Address']/following-sibling::ion-card//ion-note/following-sibling::ion-note`
    );
  }
  get shippingStatus() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()='Shipping Information']/following-sibling::ion-card//ion-note[1]`
    );
  }
  get shippingOnDate() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()='Shipping Information']/following-sibling::ion-card//ion-note[2]`
    );
  }
  get shippingVia() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()='Shipping Information']/following-sibling::ion-card//ion-note[3]`
    );
  }
  get trackingNumber() {
    return $(
      `//app-orders//swiper-slide[@aria-label="2 / 2"]//ion-label[text()='Shipping Information']/following-sibling::ion-card//ion-note[4]`
    );
  }

  get productName() {
    return $(
      `//app-orders//tr[//th//p[text()='Product']]/following-sibling::tr//td[1]//p`
    );
  }
  get productPrice() {
    return $(
      `//app-orders//tr[//th//p[text()='Price']]/following-sibling::tr//td[2]//p`
    );
  }
  get productQuantity() {
    return $(
      `//app-orders//tr[//th//p[text()='Quantity']]/following-sibling::tr//td[3]//p`
    );
  }
  get subTotal() {
    return $(
      `//app-orders//tr[//th//p[text()='Subtotal']]/following-sibling::tr//td[4]//p[1]`
    );
  }
  get previousSubTotal() {
    return $(
      `//app-orders//tr[//th//p[text()='Subtotal']]/following-sibling::tr//td[4]//p[2]`
    );
  }

  get totalSubTotal() {
    return $(
      `//app-orders//ion-label[text()='Subtotal']/following-sibling::ion-note`
    );
  }
  get shippingCost() {
    return $(
      `//app-orders//ion-label[text()='Shipping cost']/following-sibling::ion-note`
    );
  }
  get totalDiscounts() {
    return $(
      `//app-orders//ion-label[text()='Discounts']/following-sibling::ion-note`
    );
  }
  get totalTaxes() {
    return $(
      `//app-orders//ion-label[text()='Taxes']/following-sibling::ion-note`
    );
  }
  get total() {
    return $(
      `//app-orders//ion-label[text()='Totals']/following-sibling::ion-note`
    );
  }
  get backToClick() {
    return $(`//app-orders//ion-icon[@name="chevron-back-outline"]`);
  }

  async orderPurchase(customerId, account_id) {
    super.startStep(
      `Fetching orders list of the customer ID ${customerId} from the database.`
    );
    const orderCount = await database.getOrderCount(customerId, account_id);
    await super.clickTab("Orders ");
    if (orderCount == 0) {
      const noOrders = await this.ordersNotFound.getText();
      super.startStep(`Customer id  ${customerId}  has ${noOrders}`);
    } else {
      if (orderCount > 5) {
        super.startStep(
          `Customer ID  ${customerId} has more orders to view in next page`
        );
        const orderNextPageExist = await this.nextPage;
        await orderNextPageExist.isExisting();
      } else {
        super.startStep(
          `Customer ID  ${customerId} has no more orders to view in next page`
        );
      }
      super.startStep(
        `Fetching the orders detail for the customer ID ${customerId} from the database`
      );
      const ordersList = await database.getAllOrders(customerId, account_id);
      for (let i = 0; i < ordersList.length; i++) {
        var index = i + 1;
        super.startStep(
          `Iterating through each order's List details in the database.`
        );
        const {
          orderStatus,
          orderNumber,
          totalAmount,
          ordered_date,
          currency_iso_code,
          billing_address,
          billing_phone_number,
          total_amount,
          summary_total_amount,
          summary_ordered_date,
          fulfillmentOrder,
          orderItems,
          invoice,
          summary,
        } = ordersList[i];
        const symbol = await super.currencyUnit(currency_iso_code);
        if (index == 1) {
          await super.scrollIntoView(await this.lastPurchaseDate);
          super.startStep(`Fetching purchase overview from database`);
          const { averagePurchaseValue, totalPurchaseValue } = summary;
          const { ordered_date } = summary_ordered_date;
          const { totalAmount } = summary_total_amount;
          super.startStep(`Validating last Purchased Date.`);
          const lastPurchaseDate = await this.lastPurchaseDate.getText();
          super.startStep(
            `As expected, lastPurchase Date is  ${lastPurchaseDate} from order history`
          );
          const expectedDate = new Date(ordered_date);
          const recivedDate = new Date(lastPurchaseDate);
          const formattedExpectedDate = expectedDate.toLocaleDateString(
            "en-GB",
            { month: "short", day: "2-digit", year: "numeric" }
          );
          const formattedOrderDate = recivedDate.toLocaleDateString("en-GB", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
          await expect(formattedOrderDate).toEqual(formattedExpectedDate);

          await browser.pause(500);
          super.startStep(`Validating last purchase amount`);
          const last_purchase_amount = await this.lastPurchaseAmount.getText();
          super.startStep(
            `As expected, last purchase amount is ${last_purchase_amount} from order history`
          );
          const formattedTotalAmount = parseFloat(totalAmount).toFixed(2);
          await expect(last_purchase_amount).toEqual(`${symbol} ${formattedTotalAmount}`);

          super.startStep(`Validating average purchase amount`);
          const averageAmount = await this.averagePurchaseDate.getText();
          super.startStep(
            `As expected, average purchase amount is ${averageAmount} from order history`
          );
          const formattedAveragePurchaseValue = parseFloat(averagePurchaseValue).toFixed(2);
          await expect(averageAmount).toEqual(`${symbol} ${formattedAveragePurchaseValue}`);

          super.startStep(`Validating total purchase amount`);
          const totalPurchaseAmount = await this.totalPurchaseValue.getText();
          super.startStep(
            `As expected total purchase amount is ${totalPurchaseAmount} from order history`
          );
          const formattedTotalPurchaseValue = parseFloat(totalPurchaseValue).toFixed(2);
          await expect(totalPurchaseAmount).toEqual(`${symbol} ${formattedTotalPurchaseValue}`);
        }
        await browser.pause(500);
        await super.scrollIntoView(await this.orderNumber(index));

        super.startStep(`Validating order number of purchase history`);
        const order_number = await this.orderNumber(index).getText();
        super.startStep(`As expected order number is ${order_number}`);
        await expect(order_number).toEqual(orderNumber);

        super.startStep(`Validating order date of purchase history`);
        const order_date = await this.orderDate(index).getText();
        const expectedDate = new Date(ordered_date);
        const recivedDate = new Date(order_date);
        const formattedExpectedDate = expectedDate.toLocaleDateString("en-GB", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
        const formattedOrderDate = recivedDate.toLocaleDateString("en-GB", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
        super.startStep(`As expected order date is ${formattedOrderDate}`);
        await expect(formattedOrderDate).toEqual(formattedExpectedDate);

        super.startStep(`Validating order status of purchase history`);
        const order_status = await this.order_Status(index).getText();
        super.startStep(`As expected order status is ${order_status}`);
        await expect(order_status.toUpperCase()).toEqual(
          orderStatus.toUpperCase()
        );

        super.startStep(`Validating order amount of purchase history`);
        const order_amount = await this.orderAmount(index).getText();
        super.startStep(`As expected order amount is ${order_amount}`);
        const formattedTotalAmount = parseFloat(totalAmount).toFixed(2);
        await expect(order_amount).toEqual(`${symbol} ${formattedTotalAmount}`);

        await super.takeScreenshot();

        await browser.pause(500);

        if (index == 1) {
          super.startStep(`As expected to click order number: ${order_number}`);
          await this.orderNumberClick(index).click();

          const loadder = await this.orderLoader;
          await loadder.waitForDisplayed({
            reverse: true,
            timeout: 10000,
            timeoutMsg: "Order loader is not found in the screen.",
          });
          await super.scrollIntoView(await this.orderDetails);
          await super.takeScreenshot();
          const order_details = await this.orderDetails.getText();
          if (order_details != null && order_details !== "") {
            await browser.pause(500);
            super.startStep(
              `Fetching fulfillment order detail from the database`
            );
            const parts = order_details.split("|");

            const orderId = parts[0].trim().split(": ")[1];
            const orderedDate = parts[1].trim().split(": ")[1];
            const amountString = parts[2].trim().split(": ")[1];

            super.startStep(
              `As expected order number ${orderId} matches in order history`
            );
            await expect(orderId).toEqual(orderNumber);

            const expectedDate = new Date(orderedDate);
            const recivedDate = new Date(ordered_date);
            const formattedExpectedDate = expectedDate.toLocaleDateString(
              "en-GB",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              }
            );
            const formattedOrderDate = recivedDate.toLocaleDateString("en-GB", {
              month: "short",
              day: "2-digit",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            });
            super.startStep(
              `As expected order date ${formattedOrderDate} matches in order history`
            );
            await expect(formattedExpectedDate).toEqual(formattedOrderDate);

            super.startStep(
              `As expected order amount ${amountString} matches in order history`
            );
            const formattedTotalAmount = parseFloat(totalAmount).toFixed(2);
            await expect(amountString).toEqual(
              `${symbol} ${formattedTotalAmount}`
            );

            const order_status = await this.historyStatus.getText();
            super.startStep(
              `As expected order status ${order_status} matches in order history`
            );
            await expect(order_status).toEqual(orderStatus);

            const billingAddress = await this.billingAddress.getText();
            super.startStep(
              `As expected billing address in orders is ${billingAddress}`
            );
            await expect(billingAddress).toEqual(billing_address);

            const billingPhoneNumber = await this.billingPhoneNumber.getText();
            const phnNum = billingPhoneNumber.trim().split(":")[1];
            super.startStep(
              `As expected billing phone number in orders is ${phnNum}`
            );
            await expect(phnNum.trim()).toEqual(billing_phone_number);

            if (orderItems) {
              const {
                product_name,
                price,
                quantity,
                grand_total_amount,
                total_amount,
              } = orderItems;

              const productName = await this.productName.getText();
              super.startStep(
                `As expected product name in orders is ${productName}`
              );
              await expect(productName).toEqual(product_name);

              const productQuantity = await this.productQuantity.getText();
              super.startStep(
                `As expected product quantity in orders is ${productQuantity}`
              );
              await expect(Number(productQuantity)).toEqual(quantity);

              const orderProductPrice = await this.productPrice.getText();
              super.startStep(
                `As expected product price in orders is ${orderProductPrice}`
              );
              await expect(Number(orderProductPrice)).toEqual(price);

              const orderSubTotal = await this.subTotal.getText();
              super.startStep(
                `As expected product subTotal price of an item in order ${orderSubTotal}`
              );
              const formattedTotalAmount = parseFloat(grand_total_amount).toFixed(2);
              await expect(orderSubTotal).toEqual(
                `${symbol} ${formattedTotalAmount}`
              );

              const orderPreviousSubTotal = await this.previousSubTotal.getText();
              super.startStep(`As expected product subTotal price of an item before adjustment in orders ${orderPreviousSubTotal}`);
              const formattedPreviousSubtotalAmount = parseFloat(total_amount).toFixed(2);
              await expect(orderPreviousSubTotal).toEqual(`${symbol} ${formattedPreviousSubtotalAmount}`);
            }

            if (fulfillmentOrder) {
              const {
                fulfilled_to_address,
                fulfilled_to_phone,
                shippingStatus,
                shippingDate,
                shipped_via,
              } = fulfillmentOrder;
              await super.scrollIntoView(await this.shippingAddress);
              const shippingAddress = await this.shippingAddress.getText();
              super.startStep(
                `As expected shipping address in orders is ${shippingAddress}`
              );
              await expect(shippingAddress).toEqual(fulfilled_to_address);

              const shippingPhoneNumber =
                await this.shippingPhoneNumber.getText();
              const shippingPhn = shippingPhoneNumber.split(":")[1].trim();
              super.startStep(
                `As expected shipping phoneNumber in orders is ${shippingPhn}`
              );
              await expect(shippingPhn).toEqual(fulfilled_to_phone);

              const full_status = await this.shippingStatus.getText();
              const shipping_status = full_status.split(":")[1].trim();
              super.startStep(
                `As expected shipping Status in orders is ${shipping_status}`
              );
              await expect(shipping_status).toEqual(shippingStatus);

              const full_date = await this.shippingOnDate.getText();
              const shipping_date = full_date.split(":")[1].trim();
              const expectedShippingDate = new Date(shipping_date);
              const recivedShippingDate = new Date(shippingDate);
              const formattedExpectedShippingDate =
                expectedShippingDate.toLocaleDateString("en-GB", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                });
              const formattedShippingDate =
                recivedShippingDate.toLocaleDateString("en-GB", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                });
              super.startStep(
                `As expected shipping date in orders is ${formattedExpectedShippingDate}`
              );
              await expect(formattedExpectedShippingDate).toEqual(
                formattedShippingDate
              );

              if (shipped_via == null) {
                const full_shippingVia = await this.shippingVia.getText();
                const shipping_via = full_shippingVia.split(":")[1].trim();
                super.startStep(
                  `As expected shipping is done via ${shipping_via}`
                );
                await expect(shipping_via).toEqual("***");
              } else {
                const full_shippingVia = await this.shippingVia.getText();
                const shipping_via = full_shippingVia.split(":")[1].trim();
                super.startStep(
                  `As expected shipping is done via ${shipping_via}`
                );
                await expect(shipping_via).toEqual(shipped_via);
              }
            }

            if (invoice) {
              const {
                total,
                taxes,
                invoiceSubTotal,
                discountAmount,
                total_shipping_amount,
              } = invoice;
              await super.scrollIntoView(await this.totalSubTotal);
              const totalsSubtotal = await this.totalSubTotal.getText();
              super.startStep(
                `As expected subTotal price of all products is ${totalsSubtotal}`
              );
              await expect(Number(totalsSubtotal)).toEqual(invoiceSubTotal);

              const shippingCost = await this.shippingCost.getText();
              super.startStep(
                `As expected Total items shipping price is ${shippingCost}`
              );
              await expect(Number(shippingCost)).toEqual(total_shipping_amount);

              const orderTotalDiscounts = await this.totalDiscounts.getText();
              super.startStep(
                `As expected Total discount amount is ${orderTotalDiscounts}`
              );
              await expect(Number(orderTotalDiscounts)).toEqual(
                -discountAmount
              );

              const orderTotalTaxes = await this.totalTaxes.getText();
              super.startStep(
                `As expected Total taxes amount is ${orderTotalTaxes}`
              );
              await expect(Number(orderTotalTaxes)).toEqual(taxes);

              const orderTotal = await this.total.getText();
              var order_total = orderTotal.trim().split(" ");
              const total_currencyUnit = order_total[0];
              const totalOrderAmount = order_total[1];
              const formatted_Total = parseFloat(total).toFixed(2)
              super.startStep(
                `As expected, Grand total price is ${orderTotal}`
              );
              await expect(`${total_currencyUnit} ${totalOrderAmount}`).toEqual(
                `${symbol} ${formatted_Total}`
              );
            }
          }
          await super.scrollIntoView(await this.backToClick);
          super.startStep(`Navigating back to orders history table`);
          await this.backToClick.click();
        }
      }
    }
    super.endStep();
  }
}
module.exports = new Order();
