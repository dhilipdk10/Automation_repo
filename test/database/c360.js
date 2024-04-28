const Database = require("./Database");

module.exports = {
  getSourceSystemIdBySourceSystem: async function (sourceSystemId) {
    const { sequelize, Sequelize } = await Database.getDB();

    return (
      await sequelize.query(
        "SELECT name as sourceSystem FROM source_system where id=?",
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [sourceSystemId],
        }
      )
    )?.[0].sourceSystem;
  },
  getCustomerDetailsBySource: async function (sourceSystemName, sourceId) {
    const { sequelize, Sequelize } = await Database.getDB();

    const sourceSystem = (
      await sequelize.query(
        "SELECT id as sourceSystemId FROM source_system where name=?",
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [sourceSystemName],
        }
      )
    )?.[0];
    if (!sourceSystem) throw "Invalid sourceSystemName";

    const customer = (
      await sequelize.query(
        "SELECT customer_id as customerId FROM customer_mapping where external_source_id=? and external_source_system_id=?;",
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [sourceId, sourceSystem.sourceSystemId],
        }
      )
    )?.[0];
    if (!customer) throw "Customer not found";
    return this.getCustomerDetails(customer.customerId);
  },
  getTicketStatistics: async function (customerId, accountId) {
    const { sequelize, Sequelize } = await Database.getDB();
    var ticket_Statistics = {
      totalChannels: 0,
      web: 0,
      sms: 0,
      phone: 0,
      email: 0,
      incident: 0,
      problem: 0,
      service_request: 0,
      totalTypes: 0,
    };

    var statisticsOrigin = (
      await sequelize.query(
        `SELECT count(*) as count, origin FROM c360.case where customer_id=? and account_id ${accountId ? " = ?" : "IS NULL"
        } group by origin;`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId, accountId],
        }
      )
    ).map((obj) => {
      ticket_Statistics[obj.origin.toLowerCase()] = obj.count;
      ticket_Statistics.totalChannels =
        ticket_Statistics.totalChannels + obj.count;
    });

    var statisticsType = (
      await sequelize.query(
        `SELECT count(*) as count, type FROM c360.case where customer_id=? and account_id ${accountId ? " = ?" : "IS NULL"
        } group by type;`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId, accountId],
        }
      )
    ).map((obj) => {
      ticket_Statistics[obj.type.toLowerCase()] = obj.count;
      ticket_Statistics.totalTypes = ticket_Statistics.totalTypes + obj.count;
    });

    ticket_Statistics.ticketHistory = await sequelize.query(
      `SELECT id, case_number as ticketNumber, type, subject as category, creator_name as assignee, status, priority, severity, reason as description, created_at as createdDate, updated_at as updatedDate FROM c360.case where customer_id=? and account_id ${accountId ? " = ?" : "IS NULL"
      };`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId, accountId],
      }
    );

    ticket_Statistics.ticketHistoryCount = (
      await sequelize.query(
        `SELECT count(*) as totalHistoryRecords FROM c360.case where customer_id=? and account_id ${accountId ? " = ?" : "IS NULL"
        };`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId, accountId],
        }
      )
    )[0].totalHistoryRecords;

    ticket_Statistics.relatedTask = await sequelize.query(
      `SELECT description, task_number as taskNumber FROM c360.tasks where customer_id=? and account_id ${accountId ? " = ?" : "IS NULL"
      };`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId, accountId],
      }
    );

    if (ticket_Statistics.ticketHistory.length > 0) {
      ticket_Statistics.activityLogs = (
        await sequelize.query(
          `SELECT body as description, created_at as createdDate FROM c360.case_activity_log where case_id =?;`,
          {
            type: Sequelize.QueryTypes.SELECT,
            replacements: [ticket_Statistics.ticketHistory[0].id],
          }
        )
      )?.[0];
    }
    return ticket_Statistics;
  },
  getCustomerTags: async function (customerId) {
    const { sequelize, Sequelize } = await Database.getDB();
    var customerTags = await sequelize.query(
      `SELECT field as tag, n_value as value FROM c360.customer_tags where customer_id=?;`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId],
      }
    );
    return customerTags;
  },
  getNotification: async function (customerId) {
    const { sequelize, Sequelize } = await Database.getDB();
    var notification = {};
    notification.nonCompiledConversationList = await sequelize.query(
      `SELECT id, parent_id, channel, content, status, direction, sent_at as sentTime, status FROM c360.interaction_history where customer_id=? order by updated_at desc`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId],
      }
    );
    notification.compiledConversationList = await sequelize.query(
      `SELECT id, channel, content, parent_id, direction, sent_at as sentTime, status FROM c360.interaction_history where parent_id IS NULL and customer_id=? order by created_at DESC`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId],
      }
    );
    var id = [];
    var result = {};
    notification.compiledConversationList.forEach((obj) => {
      id.push(obj.id);
      result[obj.id] = [obj];
    });
    var compiledConversationId = await sequelize.query(
      `SELECT id, channel, content, parent_id, direction, sent_at as sentTime, status FROM c360.interaction_history where customer_id=? and (parent_id in (?) or id in (?)) order by created_at`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId, id, id],
      }
    );
    notification.compiledConversation = [];
    compiledConversationId.forEach((obj) => {
      if (obj.parent_id != null) {
        result[obj.parent_id].push(obj);
      }
    });
    notification.compiledConversationList.forEach((obj) => {
      notification.compiledConversation.push(result[obj.id]);
    });
    return notification;
  },
  getOpportunities: async function (customerId) {
    const { sequelize, Sequelize } = await Database.getDB();
    var opportunities = await sequelize.query(
      `SELECT name, stage, total_amount as totalAmount, owner_name as ownerName, close_date as closedDate FROM c360.opportunity where customer_id=?;`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId],
      }
    );
    return opportunities;
  },
  getOutstanding: async function (customerId, accountId) {
    const { sequelize, Sequelize } = await Database.getDB();
    const queryResult = (
      await sequelize.query(
        `select currency_iso_code as currencyIsoCode,sum(grand_total_amount) as outstandingAmount FROM invoice where customer_id = ? and account_id = ? and status = 'PENDING'`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId, accountId],
        }
      )
    )[0];
    var result = { outStanding: queryResult.outstandingAmount, currencyIsoCode: queryResult.currencyIsoCode }
    return result;
  },
  getCustomerDetails: async function (customerId) {
    const { sequelize, Sequelize } = await Database.getDB();
    var customer = (
      await sequelize.query(
        "SELECT id, name, type FROM customer where id = ?",
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId],
        }
      )
    )[0];
    if (!customer) throw "Customer not found";
    return customer;
  },

  getContactPoint: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    var contactPoint = {};
    contactPoint.primaryEmail = (
      await sequelize.query(
        `SELECT email FROM contact_point_email where is_active = 1 and is_primary_email = 1 AND customer_id= ? and account_id ${accountId ? " = ?" : "IS NULL"
        }`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId, accountId],
        }
      )
    )[0]?.email;

    contactPoint.emailList = (
      await sequelize.query(
        `SELECT email as email FROM contact_point_email where is_active = 1 and customer_id = ? and account_id ${accountId ? " = ?" : "IS NULL"
        }`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: accountId ? [customerId, accountId] : [customerId],
        }
      )
    ).map((obj) => obj.email);

    if (!contactPoint.primaryEmail && contactPoint.emailList.length > 0) {
      contactPoint.primaryEmail = contactPoint.emailList[0];
    }

    contactPoint.primaryPhone = (
      await sequelize.query(
        `SELECT telephone_number as phone, extension_number as ext FROM contact_point_phone where is_primary_phone = 1 and is_active = 1 AND customer_id = ? and account_id ${accountId ? " = ?" : "IS NULL"
        }`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: accountId ? [customerId, accountId] : [customerId],
        }
      )
    ).map(
      (obj) =>
        `+${obj.ext} (${obj.phone.substring(0, 3)}) ${obj.phone.substring(
          3,
          6
        )}-${obj.phone.substring(6)}`
    )[0];

    contactPoint.phoneList = (
      await sequelize.query(
        `SELECT telephone_number as phone, extension_number as ext FROM contact_point_phone where is_active = 1 and customer_id = ? and account_id ${accountId ? " = ?" : "IS NULL"
        }`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: accountId ? [customerId, accountId] : [customerId],
        }
      )
    ).map(
      (obj) =>
        `+${obj.ext} (${obj.phone.substring(0, 3)}) ${obj.phone.substring(
          3,
          6
        )}-${obj.phone.substring(6)}`
    );

    if (!contactPoint.primaryPhone && contactPoint.phoneList.length > 0) {
      contactPoint.primaryPhone = contactPoint.phoneList[0];
    }

    contactPoint.primaryAddress = (
      await sequelize.query(
        `SELECT address_line1 as add1, address_line2 as add2, street, city ,state, state_province as stateProvince, country, postal_code as postalCode FROM contact_point_address where is_primary_address = 1 and is_active = 1 and customer_id = ? and account_id ${accountId ? " = ?" : "IS NULL"
        }`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: accountId ? [customerId, accountId] : [customerId],
        }
      )
    ).map((obj) =>
      [
        obj.add1,
        obj.add2,
        obj.street,
        obj.city,
        obj.state,
        obj.stateProvince,
        obj.country,
        obj.postalCode,
      ]
        .filter(Boolean)
        .join(", ")
    )[0];

    contactPoint.addressList = (
      await sequelize.query(
        `SELECT address_line1 as add1, address_line2 as add2, street, city,state, state_province, country, postal_code FROM contact_point_address where is_active = 1 and customer_id = ? AND account_id ${accountId ? " = ?" : "IS NULL"
        }`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: accountId ? [customerId, accountId] : [customerId],
        }
      )
    ).map((obj) =>
      [
        obj.add1,
        obj.add2,
        obj.street,
        obj.city,
        obj.state,
        obj.stateProvince,
        obj.country,
        obj.postalCode,
      ]
        .filter(Boolean)
        .join(", ")
    );

    if (!contactPoint.primaryAddress && contactPoint.addressList.length > 0) {
      contactPoint.primaryAddress = contactPoint.addressList[0];
    }
    return contactPoint;
  },
  getAllAccountsByCustomer: async (customerId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    return await sequelize.query(
      "Select id, account_number as accountNumber, nick_name as nickName From account where customer_id = ?",
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId],
      }
    );
  },

  subscriptionDetails: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    var subscriptionList = await sequelize.query(
      `SELECT id, subscription_number as subscriptionNumber, status, activated_at as dataOfCommencement, subscription_number as subscriptionNumber, plan_id as planId, CASE WHEN status = 'active' THEN current_period_end ELSE null end as currentPeriodEnd, phone_number, price_id FROM subscription where customer_id=? and account_id=?`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId, accountId],
      }
    );
    await Promise.all(
      subscriptionList.map(async (subscription) => {
        if (subscription.status == "ACTIVE") {
          subscription.updatedDate = (
            await sequelize.query(
              `SELECT end as updatedDate FROM usage_record WHERE subscription_id = ? `,
              {
                type: Sequelize.QueryTypes.SELECT,
                replacements: [subscription.id],
              }
            )
          )[0]?.updatedDate;
        }
        subscription.plan = (
          await sequelize.query(
            `SELECT name as planName, data_allowance, data_allowance_unit, data_bandwidth_per_sec, data_bandwidth_per_sec_unit FROM plan where id = ?`,
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: [subscription.planId],
            }
          )
        )[0];
        subscription.usageRecord = await sequelize.query(
          `SELECT SUM(data) as totalDataUsed, usage_unit as usageUnit  FROM c360.usage_record where subscription_id=? and usage_type='DATA' GROUP BY usage_unit`,
          {
            type: Sequelize.QueryTypes.SELECT,
            replacements: [subscription.id],
          }
        );
        subscription.price = (
          await sequelize.query(
            `SELECT currency_iso_code as currencyCode, amount FROM c360.price where id=?`,
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: [subscription.price_id],
            }
          )
        )[0];
        subscription.billing = (
          await sequelize.query(
            `SELECT invoice_number as invoiceNumber, currency_iso_code as currencyCode, grand_total_amount as totalAmount, invoice_date as billingInvoiceDate, due_date, status FROM invoice where customer_id=? and account_id=? and subscription_id = ? and status = 'PENDING'`,
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: [customerId, accountId, subscription.id],
            }
          )
        )[0];
      })
    );
    return subscriptionList;
  },
  getBillingPending: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    return await sequelize.query(
      `SELECT invoice_number as invoiceNumber, currency_iso_code as currencyCode, grand_total_amount as totalAmount, invoice_date as billingInvoiceDate, due_date, status FROM invoice where status='PENDING' and customer_id=? and account_id=?`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId, accountId],
      }
    );
  },
  getBillingHistoryCount: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    return (
      await sequelize.query(
        `SELECT count(*) as historyCount FROM invoice where status!='PENDING' and customer_id=? and account_id=? ;`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId, accountId],
        }
      )
    )[0]?.historyCount;
  },
  getBillingHistory: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    return await sequelize.query(
      `SELECT invoice_number as invoiceNumber, currency_iso_code as currencyCode, grand_total_amount as totalAmount, invoice_date as billingInvoiceDate, due_date, status FROM invoice where status!='PENDING' and customer_id=? and account_id=? limit 5`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId, accountId],
      }
    );
  },
  getOverViewOrderCount: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    return (
      await sequelize.query(
        `SELECT count(*) as orderCount FROM c360.order where customer_id =? AND account_id=? AND status_code = 'DRAFT'`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId, accountId],
        }
      )
    )[0]?.orderCount;
  },
  getOrderCount: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    return (
      await sequelize.query(
        `SELECT count(*) as orderCount FROM c360.order where customer_id =? AND account_id=?`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId, accountId],
        }
      )
    )[0]?.orderCount;
  },
  getAllOrders: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    var orderList = await sequelize.query(
      `SELECT id as orderId, status as orderStatus, order_number AS orderNumber, description, ordered_date, currency_iso_code, grand_total_amount as totalAmount, billing_address, billing_phone_number, total_amount,total_shipping_amount, total_shipping_discount as discount FROM c360.order where  customer_id =? AND account_id=? limit 5`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId, accountId],
      }
    );
    await Promise.all(
      orderList.map(async (order) => {
        order.summary = (
          await sequelize.query(
            `SELECT AVG(total_amount) AS averagePurchaseValue,SUM(total_amount) AS totalPurchaseValue, currency_iso_code AS currencyIsoCode FROM c360.order where  customer_id =? AND account_id=? ORDER BY ordered_date DESC LIMIT 1 ;`,
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: [customerId, accountId],
            }
          )
        )[0];

        order.summary_ordered_date = (
          await sequelize.query(
            `SELECT ordered_date FROM c360.order WHERE customer_id = ? AND account_id = ? ORDER BY ordered_date DESC LIMIT 1;`,
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: [customerId, accountId],
            }
          )
        )[0];
        order.summary_total_amount = (
          await sequelize.query(
            `SELECT total_amount as totalAmount FROM c360.order WHERE customer_id = ? AND account_id = ? ORDER BY ordered_date DESC LIMIT 1;`,
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: [customerId, accountId],
            }
          )
        )[0];
        order.orderItems = (
          await sequelize.query(
            `select product_name,unit_price as price, quantity, grand_total_amount, total_amount, currency_iso_code from c360.order_items where order_id=?;`,
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: [order.orderId],
            }
          )
        )[0];
        order.fulfillmentOrder = (
          await sequelize.query(
            `SELECT fulfilled_to_address, fulfilled_to_phone, status as shippingStatus, desired_delivery_date as shippingDate, shipped_via, tracking_number FROM c360.fulfillment_order where order_id=?;`,
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: [order.orderId],
            }
          )
        )[0];
        order.invoice = (
          await sequelize.query(
            `SELECT grand_total_amount as total, total_tax_amount as taxes, total_amount as invoiceSubTotal, total_shipping_discount as discountAmount, total_shipping_amount FROM c360.invoice where order_id=?;`,
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: [order.orderId],
            }
          )
        )[0];
      })
    );
    return orderList;
  },
  getTaskCount: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    return (
      await sequelize.query(
        `SELECT count(*) as taskCount FROM tasks where customer_id=? AND status != 'closed' AND account_id ${accountId ? " = ?" : "IS NULL"
        }`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: [customerId, accountId],
        }
      )
    )[0]?.taskCount;
  },
  getAllTask: async (customerId, accountId) => {
    const { sequelize, Sequelize } = await Database.getDB();
    return await sequelize.query(
      `SELECT id, task_number,name as taskName, priority, due_date as dueDate, status, assignee FROM tasks where customer_id=? AND status != 'closed' AND account_id ${accountId ? " = ?" : "IS NULL"
      }`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [customerId, accountId],
      }
    );
  },

  searchCustomers: async function (type, search, sourceSystemId) {
    try {
      const { sequelize, Sequelize } = await Database.getDB();
      function isPhoneNumber(phoneNumber) {
        return /^\d{10}$/.test(phoneNumber.replace(/[ -]/g, ""));
      }
      function isEmail(email) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      }
      function isNumber(number) {
        return /^[0-9]+$/.test(number);
      }
      function getSearchType(searchText) {
        if (isEmail(searchText)) {
          return "EMAIL";
        } else if (!isNaN(searchText) && isPhoneNumber(searchText)) {
          return "PHONE";
        } else if (searchText.toLowerCase().startsWith("cus")) {
          return "CUSTOMER ID";
        } else if (searchText.toLowerCase().startsWith("ord")) {
          return "ORDER ID";
        } else if (searchText.toLowerCase().startsWith("sub")) {
          return "SUBSCRIPTION ID";
        } else if (!isNaN(searchText)) {
          return "CUSTOMER ID";
        } else {
          return "NAME";
        }
      }
      const result = { customers: [], accounts: [] };
      switch (type ? type.toUpperCase() : null || getSearchType(search)) {
        case "CUSTOMER ID":
          if (sourceSystemId) {
            const customerIds = await sequelize.query(
              "select customer_id from customer_mapping where external_source_system_id = ? and external_source_id = ?",
              {
                replacements: [sourceSystemId, search],
                type: Sequelize.QueryTypes.SELECT,
              }
            );

            if (customerIds.length > 0) {
              result.customers = await sequelize.query(
                "select id, uuid, name, type, gender from customer where id in (?)",
                {
                  replacements: [customerIds.map((obj) => obj.customer_id)],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
          } else if (search.toLowerCase().startsWith("cus_")) {
            if (search.length == 36) {
              result.customers = await sequelize.query(
                "select id, uuid, name, type, gender from customer where uuid = ?",
                {
                  replacements: [search.toLowerCase()],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            } else {
              result.customers = await sequelize.query(
                "select id, uuid, name, type, gender from customer where uuid like ?",
                {
                  replacements: ["%" + search.toLowerCase() + "%"],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
          } else if (isNumber(search)) {
            result.customers = await sequelize.query(
              "select id, uuid, name, type, gender from customer where id = ? ",
              {
                replacements: [search],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
          }
          break;
        case "ORDER ID":
          if (sourceSystemId) {
            const orderObj = await sequelize.query(
              "select customer_id from `order` where external_source_system_id = ? and external_source_id = ?",
              {
                replacements: [sourceSystemId, search],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
            if (orderObj.length > 0) {
              result.customers = await sequelize.query(
                "select id, uuid, name, type, gender from customer where id in (?) ",
                {
                  replacements: [orderObj.map((obj) => obj.customer_id)],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
          } else if (search.toLowerCase().startsWith("ord_")) {
            var orderObj = null;
            if (search.length == 36) {
              orderObj = await sequelize.query(
                "select customer_id from `order` where uuid = ?",
                {
                  replacements: [search.toLowerCase()],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            } else {
              orderObj = await sequelize.query(
                "select customer_id from  `order` where uuid like ? ",
                {
                  replacements: ["%" + search.toLowerCase() + "%"],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
            if (orderObj.length > 0) {
              result.customers = await sequelize.query(
                "select id, uuid, name, type, gender from customer where id in (?) ",
                {
                  replacements: [orderObj.map((obj) => obj.customer_id)],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
          } else if (isNumber(search)) {
            const orderObj = await sequelize.query(
              "select customer_id from `order` where id = ? ",
              {
                replacements: [search],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
            if (orderObj.length > 0) {
              result.customers = await sequelize.query(
                "select id, uuid, name, type, gender from customer where id in (?) ",
                {
                  replacements: [orderObj.map((obj) => obj.customer_id)],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
          }
          break;
        case "SUBSCRIPTION ID":
          if (sourceSystemId) {
            const subObj = await sequelize.query(
              "select customer_id from subscription where external_source_system_id = ? and external_source_id = ?",
              {
                replacements: [sourceSystemId, search],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
            if (subObj.length > 0) {
              result.customers = await sequelize.query(
                "select id, uuid, name, type, gender from customer where id in (?) ",
                {
                  replacements: [subObj.map((obj) => obj.customer_id)],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
          } else if (search.toLowerCase().startsWith("sub_")) {
            var subObj = null;
            if (search.length == 36) {
              subObj = await sequelize.query(
                "select customer_id from subscription where uuid = ?",
                {
                  replacements: [search.toLowerCase()],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            } else {
              subObj = await sequelize.query(
                "select customer_id from subscription where uuid like ?",
                {
                  replacements: ["%" + search.toLowerCase() + "%"],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
            if (subObj.length > 0) {
              result.customers = await sequelize.query(
                "select id, uuid, name, type, gender from customer where id in (?) ",
                {
                  replacements: [subObj.map((obj) => obj.customer_id)],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
          } else if (isNumber(search)) {
            const subObj = await sequelize.query(
              "select customer_id from subscription where id = ?",
              {
                replacements: [search],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
            if (subObj.length > 0) {
              result.customers = await sequelize.query(
                "select id, uuid, name, type, gender from customer where id in (?) ",
                {
                  replacements: [subObj.map((obj) => obj.customer_id)],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
            }
          }
          break;
        case "EMAIL":
          var response = null;
          if (isEmail(search)) {
            response = await sequelize.query(
              "select customer_id from contact_point_email where email = ?",
              {
                replacements: [search],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
          } else {
            response = await sequelize.query(
              "select customer_id from contact_point_email where email like ?",
              {
                replacements: ["%" + search + "%"],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
          }
          if (response.length > 0) {
            result.customers = await sequelize.query(
              "select id, uuid, name, type, gender from customer where id in (?) ",
              {
                replacements: [response.map((obj) => obj.customer_id)],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
          }
          break;
        case "PHONE":
          var response = null;
          if (isNumber(search)) {
            response = await sequelize.query(
              "select customer_id from contact_point_phone where telephone_number = ?",
              {
                replacements: [search],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
          } else {
            response = await sequelize.query(
              "select customer_id from contact_point_phone where telephone_number like ?",
              {
                replacements: ["%" + search + "%"],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
          }
          if (response.length > 0) {
            result.customers = await sequelize.query(
              "select id, uuid, name, type, gender from customer where id in (?) ",
              {
                replacements: [response.map((obj) => obj.customer_id)],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
          }
          break;
        case "ACCOUNT NUMBER":
          const accObj = await sequelize.query(
            "select customer_id from account where account_number = ?",
            {
              replacements: [search],
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          if (accObj.length > 0) {
            result.customers = await sequelize.query(
              "select id, uuid, name, type, gender from customer where id in (?) ",
              {
                replacements: [accObj.map((obj) => obj.customer_id)],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
          }
          break;
        case "SUBSCRIPTION NUMBER":
          const subList = await sequelize.query(
            "select customer_id from `subscription` where subscription_number = ?",
            {
              replacements: [search],
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          if (subList.length > 0) {
            result.customers = result.customers = await sequelize.query(
              "select id, uuid, name, type, gender from customer where id = ? ",
              {
                replacements: [subList.map((obj) => obj.customer_id)],
                type: Sequelize.QueryTypes.SELECT,
              }
            );
          }
          break;
        default:
          result.customers = await sequelize.query(
            "select id, uuid, name, type, gender from customer where name like ? order by updated_at DESC",
            {
              replacements: ["%" + search + "%"],
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          break;
      }

      //account
      if (result.customers.length > 0) {
        const customerIds = result.customers.map((obj) => obj.id);
        const customerEmails = await sequelize.query(
          "select customer_id, email from contact_point_email where customer_id in (?) and is_primary_email = ? and is_active = ?",
          {
            replacements: [customerIds, true, true],
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        result.accounts = await sequelize.query(
          "select id, uuid, account_number as accountNumber, nick_name as nickName, account_type as type, brand_name, customer_id as customerId from account where customer_id in (?)",
          {
            replacements: [customerIds],
            type: Sequelize.QueryTypes.SELECT,
          }
        );
        const customerIdMap = {};
        //customers
        customerEmails.forEach(
          (customerEmail) =>
            (customerIdMap[customerEmail.customer_id] = customerEmail.email)
        );
        result.customers.forEach((customer) => {
          customer.primaryEmail = customerIdMap[customer.id];
        });
        //account
        result.customers.forEach(
          (customer) => (customerIdMap[customer.id] = customer.uuid)
        );
        result.accounts.forEach((account) => {
          account.customerUUID = customerIdMap[account.customer_id];
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  },
};
