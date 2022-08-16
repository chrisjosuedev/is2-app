require("dotenv").config();

const { app, BrowserWindow, Menu } = require("electron");

const server = require("./app");

let mainWindow;

function createWindow() {
    const { screen } = require("electron");

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    mainWindow = new BrowserWindow({
        width,
        height,
        webPreferences: {
            nodeIntegration: true,
        },
        title: "IS2 Solutions",
        icon: __dirname + "/public/img/favicon/favicon-is2.ico",
    });

    mainWindow.loadURL('http://localhost:81');
    mainWindow.on("close", function (e) {
        const choice = require("electron").dialog.showMessageBoxSync(this, {
            type: "question",
            buttons: ["Yes", "No"],
            title: "Confirmacion",
            message: "¿Estas seguro que deseas salir de la aplicación?",
        });
        if (choice === 1) {
            e.preventDefault();
        }
    });
    mainWindow.maximize();
    
    mainWindow.webContents.setUserAgent(
        mainWindow.webContents.getUserAgent() + 'ZC+fqvK]Jy'
    );
    
    Menu.setApplicationMenu(null);
}

app.on("ready", createWindow);

app.on("resize", function (e, x, y) {
    mainWindow.setSize(x, y);
    mainWindow.maximize();
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    }
});

