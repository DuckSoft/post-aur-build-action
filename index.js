const core = require('@actions/core');
const path = require('path');
const fs = require('fs');
const process = require('process');

// most @actions toolkit packages have async methods
async function run() {
  try {
      const pkgs = fs.readdirSync(process.cwd(), { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => 
          fs.readdirSync(entry.name, { withFileTypes: true })
            .filter(file => file.isFile() && file.name.indexOf(".pkg.tar") !== -1)
            .map(file => ({
              "pkgfile": file.name,
              "pkgpath": path.join(process.pwd(), entry.name, file.name)
            }))
        ).reduce((acc, x) => acc.concat(x), [])

      if (pkgs.length > 1) {
        core.setFailed("We do not support more than one package at a time!");
        return;
      } else if (pkgs.length === 0) {
        core.setFailed("Cannot find a package in: " + process.cwd());
        return;
      }

      let { pkgfile, pkgpath } = pkgs[0];
      core.setOutput("pkgfile", pkgfile);
      core.setOutput("pkgpath", pkgpath);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
