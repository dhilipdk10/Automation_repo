const { Sequelize, Op } = require("sequelize");

module.exports = {
    isConnectionCreated: false,
    errorMessage: null,
    db: {},
    init: async function () {
        try {
            //To create a MySQL connection
            const sequelize = new Sequelize(
                process.env.DATABASE_SCHEMA,
                process.env.DATABASE_USERNAME,
                process.env.DATABASE_PASSWORD,
                {
                    dialect: "mysql",
                    host: process.env.DATABASE_HOST,
                    port: process.env.DATABASE_PORT,

                    logging: false,
                    define: {
                        freezeTableName: true
                    },
                    retry: {
                        match: [/Deadlock/i, /ER_CON_COUNT_ERROR/i, /Too many connections/i],
                        max: 3, // Maximum rety 3 times
                        backoffBase: 2000, // Initial backoff duration in ms. Default: 100,
                        backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
                    }
                }
            );
            await sequelize.authenticate();
            console.log("DB Authenticated Successfully");

            this.db.sequelize = sequelize;
            this.db.Sequelize = Sequelize;
            this.db.Op = Op;

            this.isConnectionCreated = true;
        } catch (err) {
            this.isConnectionCreated = false;
            this.errorMessage = err;
            console.log("Error while Authentication ", err);
        }
    },
    getDB: async function () {
        if (!this.isConnectionCreated) await this.init();
        return this.db;
    },
}
