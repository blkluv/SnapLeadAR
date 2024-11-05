// jsdoc.config.js
module.exports = {
    tags: {
        allowUnknownTags: true,
        dictionaries: ["jsdoc"],
    },
    source: {
        include: ["src"],
        includePattern: ".+\\.js(doc|x)?$",
        excludePattern: "(^|\\/|\\\\)_",
    },
    plugins: ["plugins/markdown"],
    templates: {
        cleverLinks: false,
        monospaceLinks: false,
    },
    opts: {
        destination: "./docs",
        recurse: true,
        readme: "./README.md",
    },
};
