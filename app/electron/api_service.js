const {
  ipcMain
} = require("electron");
const validChannels = require("./validChannels");
const path = require('path');
const pythonStriptPath = path.join(__dirname, '../py/scripts.py');
const runningProcesses = {}


const create_channel = (mainWindow, channel) =>
  ipcMain.on(channel, (_, args = {}) => {
    const childProcess = require('child_process').spawn('python', [pythonStriptPath, channel, JSON.stringify(args)]);  // TODO undefined args doesn't work
    runningProcesses[channel] = childProcess

    childProcess.stdout.on('data', (data) => {
      console.log(data.toString('utf8'));
      mainWindow.webContents.send("resp_" + channel, data.toString('utf8'));
    });

    childProcess.stderr.on('data', (data) => {
      console.error(data.toString('utf8'));
      mainWindow.webContents.send("err_" + channel, data.toString('utf8'));
    });

    childProcess.on('close', (code) => {
      mainWindow.webContents.send("close_" + channel, `child process ${channel} exited with code ${code}`);
      delete runningProcesses[channel]
    });
  });

const create_process_killer = (mainWindow, channel) =>
  ipcMain.on("kill_" + channel, () => {
    if (runningProcesses[channel]) {
      runningProcesses[channel].kill();
    } else {
      mainWindow.webContents.send("close_" + channel, `Kill requested ${channel} process is not running`);
    }
  });


module.exports = (mainWindow) => {
  validChannels.forEach(element => {
    create_channel(mainWindow, element);
  });
  // Killable processes
  create_process_killer(mainWindow, "get_container_logs")
}
