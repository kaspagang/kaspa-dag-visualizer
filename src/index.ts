import { app, BrowserWindow } from 'electron';

const createWindow = (): void => {
    let win = new BrowserWindow({
        width: 1900,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.webContents.openDevTools()
    win.loadFile('index.html');
}

app.on('ready', createWindow);
