const fs = require("fs");
const path = require("path");
const UglifyJS = require("uglify-js");

const distDir = path.join(__dirname, "dist");

const minifyFile = (filePath) => {
  const code = fs.readFileSync(filePath, "utf8");

  const result = UglifyJS.minify(code);

  if (result.error) {
    console.error(`Error minifying ${file}:`, result.error);
  } else {
    fs.writeFileSync(filePath, result.code);
    console.log(`Minified: ${filePath}`);
  }
};

const minifyDir = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      minifyDir(filePath);
    } else {
      minifyFile(filePath);
    }
  });
};

minifyDir(distDir);
