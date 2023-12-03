const { execSync } = require("child_process");

module.exports = () => {
    const branch =
        execSync("git rev-parse --abbrev-ref HEAD")
        .toString("utf8")
        .replace(/[\n\r\s]+$/, "");
    return { branch: branch.toLowerCase() };
};
