const cwd = process.cwd();
const fs = require("fs");
const nunjucks = require("nunjucks");

const Klass = class Template {
  constructor() {
    this.fields = [];
  }

  conf(obj, ns = false) {
    const keys = Object.keys(obj);

    keys.forEach((key) => {
      if (typeof obj[key] !== "object") {
        const child = ns ? `${ns}_${key}` : key;

        this.fields.push({ [child.toUpperCase()]: obj[key] });
      } else if (Object.keys(obj[key]).length) {
        const parent = ns ? `${ns}_${key}` : key;

        if (!parent.includes("private")) {
          this.conf(obj[key], parent);
        }
      }
    });
  }

  create(tpl, path) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    fs.writeFileSync(path, this.tpl(tpl));
  }

  tpl(type) {
    let tpl = "";

    this.fields.forEach((field) => {
      for (const key in field) {
        const opts = { key: key, prop: field[key] };
        const ctx = nunjucks.render(`${cwd}/grunt/templates/${type}.njk`, opts);
        tpl = `${tpl}${ctx}\n`;
      }
    });

    return tpl;
  }
};

module.exports = new Klass();
