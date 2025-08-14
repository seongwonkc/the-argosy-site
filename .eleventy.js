// .eleventy.js
const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // This command tells Eleventy to copy your 'assets' folder to the final build.
  eleventyConfig.addPassthroughCopy("assets");

  // Custom filter to format dates for display (e.g., "Aug 15, 2025")
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("LLL dd, yyyy");
  });

  return {
    // These are the directories where Eleventy will look for files.
    dir: {
      input: ".", // Root folder
      includes: "_includes", // Folder for layouts
      data: "_data", // Folder for global data
      output: "_site" // The folder where the final website will be built
    },
    // These settings allow HTML and Markdown files to be processed as templates.
    templateFormats: ["html", "md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
