const databaseName = "analytics";
const shufflesStoreName = "shuffles";
const databaseSchemaVersion = 1;

const pleaseReloadPageMessage =
    "It seems like you're using the outdated version of the site.\n" +
    "Please reload the page in order to resolve this issue.\n" +
    "If it doesn't take an effect - please contact the developer: mail@ivan-nosar.ru";
const pleaseCloseOtherTabsMessage =
    "It seems like you're opened an old version of this site in other tab.\n" +
    "Please close all the tabs containing this page and reopen it again in a new tab.\n" +
    "If it doesn't take an effect - please contact the developer: mail@ivan-nosar.ru";

function onOpenDbUpgradeNeeded(event) {
    const db = event.target.result;
    switch (db.version) {
        case 1: {
            // Database is not existed
            initializeDb(db);
        }
        // Add new `case` branches in order to cover the new revisions of database schema
    }
}

function onOpenDbError(event) {
    const errorMessage = event.target.error.message;
    const requestedVersion = errorMessage.slice(errorMessage.indexOf('(') + 1, errorMessage.indexOf(')'));
    const existingVersion = errorMessage.slice(errorMessage.lastIndexOf('(') + 1, errorMessage.lastIndexOf(')'));
    if (existingVersion > requestedVersion) {
        console.warn(event.target.error.message);
        alert(pleaseReloadPageMessage);
        return;
    }
    console.error("Unable to open the database. The reason is as follows:");
    console.error(event.target.error);
}

function onOpenDbBlocked() {
    console.warn("An older version of database is used in other tab. Closing all the tabs is required");
    alert(pleaseCloseOtherTabsMessage);
}

function initializeDb(db) {
    db.createObjectStore(shufflesStoreName, {
        autoIncrement: true
    });
}

function onOpenDbSuccess(callback) {
    return event => {
        if (typeof callback === "function") {
            const openedDatabase = event.target.result;
            openedDatabase.onDbVersionChanged = onDbVersionChanged;
            callback(openedDatabase);
        }
    }
}

function onDbVersionChanged() {
    if (database !== null) {
        database.close();
        console.warn("Database version has been changed. Page reload is required");
    } else {
        console.error("Database connection was not established. Page reload is required");
    }

    alert(pleaseReloadPageMessage);
}

function openDatabase(onSucessCallback) {
    const openDatabaseRequest = indexedDB.open(databaseName, databaseSchemaVersion);
    openDatabaseRequest.onupgradeneeded = onOpenDbUpgradeNeeded;
    openDatabaseRequest.onerror = onOpenDbError;
    openDatabaseRequest.onblocked = onOpenDbBlocked;
    openDatabaseRequest.onsuccess = onOpenDbSuccess(onSucessCallback);
}

function saveShuffle(shuffle, onSucessCallback) {
    if (database === null) {
        console.error("Database connection was not established. Page reload is required");
        alert(pleaseReloadPageMessage);
        return;
    }

    const transaction = database.transaction(shufflesStoreName, "readwrite");
    const shufflesStorage = transaction.objectStore(shufflesStoreName);

    const request = shufflesStorage.add(shuffle);

    request.onsuccess = function () {
        console.log("Shuffle has been saved successfully");
        if (typeof onSucessCallback === "function") {
            onSucessCallback();
        }
    };

    request.onerror = function (event) {
        console.error("Saving the shuffle ended with an error. The reason is as follows:");
        console.error(event.target.error);
        event.stopPropagation();
    };
}

function selectShuffles(callback) {
    if (database === null) {
        console.error("Database connection was not established. Page reload is required");
        alert(pleaseReloadPageMessage);
        return;
    }

    const transaction = database.transaction(shufflesStoreName, "readwrite");
    const shufflesStorage = transaction.objectStore(shufflesStoreName);

    const request = shufflesStorage.getAll();

    request.onsuccess = function (event) {
        console.log("Shuffles selected successfully");
        if (typeof callback === "function") {
            callback(event.target.result);
        }
    };

    request.onerror = function (event) {
        console.error("Unable to select shuffles. The reason is as follows:");
        console.error(event.target.error);
        event.stopPropagation();
    };
}

function eraseShuffles() {
    if (database === null) {
        console.error("Database connection was not established. Page reload is required");
        alert(pleaseReloadPageMessage);
        return;
    }

    const transaction = database.transaction(shufflesStoreName, "readwrite");
    const shufflesStorage = transaction.objectStore(shufflesStoreName);
    const request = shufflesStorage.clear();

    request.onsuccess = function () {
        console.log("Shuffle storage has been erased successfully");
    };

    request.onerror = function (event) {
        console.error("Shuffle storage erasing ended with an error. The reason is as follows:");
        console.error(event.target.error);
        event.stopPropagation();
    };
}

let database = null;

openDatabase(openedDatabase => {
    database = openedDatabase;
});
