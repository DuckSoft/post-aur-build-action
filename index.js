const core = require('@actions/core');
const path = require('path');
const fs = require('fs');
const process = require('process');

// readDir promise version
const readDirPromise = (path) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    })
  })
}

// most @actions toolkit packages have async methods
async function run() {
  try {
      const names = await readDirPromise(process.cwd());
      console.log("CWD Files:" + names);

      const pkgs = names.filter(i => i.indexOf(".pkg.tar") !== -1);
      
      pkgs.forEach(pkg => {
        console.log("Found package: " + path.join(proces.cwd(), pkg));
      });

      if (pkgs.length > 1) {
        core.setFailed("We do not support more than one package at a time!");
        return;
      } else if (pkgs.length === 0) {
        core.setFailed("Cannot find a package in: " + process.cwd());
        return;
      }

      core.setOutput("pkgfile", pkgs[0]);
      core.setOutput("pkgpath", path.join(proces.cwd(), pkgs[0]));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
