const myConn = require("../db");
const cron = require("node-cron");
const fs = require("fs");
const spawn = require("child_process").spawn;

const USER_DB = "root";
const PASSWORD_DB = "admin";
const DB_NAME = "db_is2_solutions";

const { dataBaseBackupsDir } = require("./directories");

const queryDB = async () => {
    try {
        const min = await myConn.query("select min_db from ajustes;");
        return min[0].min_db;
    } catch (err) {
        throw err;
    }
};

queryDB()
    .then((time) => {
        const newTime = time.split(":");
        console.log("----------------------------");
        console.log(`Updated every: ${newTime[0]}:${newTime[1]}.`);
        dbBackup(newTime[0], newTime[1]);
    })
    .catch((err) => console.error(err));

const dbBackup = (hourValue, minValue) => {
    cron.schedule(`${minValue} ${hourValue} * * *`, () => {
        const dumpFileName = `${dataBaseBackupsDir}\\${DB_NAME}_${Math.round(
            Date.now() / 1000
        )}.dump.sql`;
        const writeStream = fs.createWriteStream(dumpFileName);
        console.log("------------------------");
        console.log("Running Database Backup...");
        const dump = spawn("mysqldump", [
            "-u",
            `${USER_DB}`,
            `-p${PASSWORD_DB}`,
            `${DB_NAME}`,
        ]);
        dump.stdout
            .pipe(writeStream)
            .on("finish", function () {
                console.log("DB Backup Completed...");
                console.log("------------------------");
            })
            .on("error", function (err) {
                console.log(err);
            });
    });
};
