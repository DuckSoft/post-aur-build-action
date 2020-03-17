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
              "pkgpath": path.join(process.cwd(), entry.name, file.name)
            }))
        ).reduce((acc, x) => acc.concat(x), []);
      
      console.log(pkgs);

      if (pkgs.length > 1) {
        core.setFailed("We do not support more than one package at a time!");
        return;
      } else if (pkgs.length === 0) {
        core.setFailed("Cannot find a package in: " + process.cwd());
        return;
      }

      core.setOutput("pkgfile", pkgs[0]['pkgfile']);
      core.setOutput("pkgpath", pkgs[0]['pkgpath']);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
