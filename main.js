const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENVIRONMENT
//process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'dev';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({});
    // Load html file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    })
    
    // Build the menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenutTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
})


// Handle create add window 
function createAddWindow(){
    // Create new window
    addWindow = new BrowserWindow({
        width: 800,
        height: 400,
        title: 'Search for Currency'
    });
    // Load html file into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'searchCurrency.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    })
}

// Catch currency:add
ipcMain.on('currency:add', function(e, currency){
    mainWindow.webContents.send('currency:add', currency);
    addWindow.close();
});

// Create menu template
const mainMenutTemplate = [
    {
        label:'File', 
        submenu: [
            {
                label: 'Search',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Add Currency'
            },
            {
                label: 'Clear',
                click(){
                    mainWindow.webContents.send('currency:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If Mac, add empty object to menu
if(process.platform == 'darwin') {
    mainMenutTemplate.unshift({});
}

// Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenutTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}