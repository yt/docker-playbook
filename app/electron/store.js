const fs = require('fs');

module.exports = {
  saveContainer: (name, data) => {
    return fs.writeFileSync(`app/data/container/${name}.json`, JSON.stringify(data));
  },
  getContainer: (name) => {
    const rawdata = fs.readFileSync(`app/data/container/${name}.json`);
    return JSON.parse(rawdata);
  },
  getContainerTemplates: () => {
    return fs.readdirSync(`app/data/container/`).map((e) => e.replace('.json', ''));
  },
  deleteContainer: (name) => {
    return fs.unlinkSync(`app/data/container/${name}.json`);
  },
  
  getPlaybook: (name) => {
    const rawdata = fs.readFileSync(`app/data/playbook/${name}.json`);
    return JSON.parse(rawdata);
  },
  getPlaybooks: () => {
    return fs.readdirSync(`app/data/playbook/`).map((e) => e.replace('.json', ''));
  },
  savePlaybook: (name, data) => {
    return fs.writeFileSync(`app/data/playbook/${name}.json`, JSON.stringify(data));
  },
  deletePlaybook: (name) => {
    return fs.unlinkSync(`app/data/playbook/${name}.json`);
  },
}