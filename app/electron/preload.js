// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {
  contextBridge,
  ipcRenderer
} = require("electron");
const validChannels = require("./validChannels");
const store = require('./store');

window.addEventListener('DOMContentLoaded', () => {
  // TODO implement a loading screen, check docker version etc..

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    console.log(type, process.versions[type]);
  }
})

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
  ...store,
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.send(channel, data);
    }
    throw "This channel is not whitelisted"
  },
  // Currently there can only be one listener per channel, if we want to add more, we will need to manage listeners.
  receive: (channel, callback) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners("resp_" + channel);
      return ipcRenderer.on("resp_" + channel, (event, ...args) => callback(...args));
    }
    throw "This channel is not whitelisted"
  },
  receiveError: (channel, callback) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners("err_" + channel);
      return ipcRenderer.on("err_" + channel, (event, ...args) => callback(...args));
    }
    throw "This channel is not whitelisted"
  },
  receiveClose: (channel, callback) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners("close_" + channel);
      return ipcRenderer.on("close_" + channel, (event, ...args) => callback(...args));
    }
    throw "This channel is not whitelisted"
  },
  kill: (channel) => {
    const killableChannels = ["get_container_logs"];
    if (killableChannels.includes(channel)) {
      return ipcRenderer.send("kill_" + channel);
    }
    throw "This channel is not whitelisted for kill operation"
  },
});