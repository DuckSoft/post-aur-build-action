const core = require("@actions/core");
const artifact = require("@actions/artifact");

const path = require("path");
const fs = require("fs");
const process = require("process");

async function run() {
  try {
    const pkgs = fs
      .readdirSync(process.cwd(), { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry =>
        fs
          .readdirSync(entry.name, { withFileTypes: true })
          .filter(file => file.isFile() && file.name.indexOf(".pkg.tar") !== -1)
          .map(file => ({
            pkgfile: file.name,
            pkgpath: path.join(entry.name, file.name)
          }))
      )
      .reduce((acc, x) => acc.concat(x), []);

    console.log(pkgs);

    if (pkgs.length === 0) {
      core.setFailed(`Cannot find a package in: ${process.cwd()}`);
      return;
    }

    core.info("Uploading artifacts...");

    Promise.all(
      pkgs.map(entry =>
        artifact
          .create()
          .uploadArtifact(entry["pkgfile"], [entry["pkgpath"]], ".", {
            continueOnError: false
          })
          .then(result => {
            core.info(` - Uploaded: ${result.artifactName}`);
          })
      )
    )
      .then(() => {
        core.info("All artifact uploaded.");
      })
      .catch(e => {
        core.error(`Artifact upload error: ${e.message}`);
      });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
