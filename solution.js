const puppeteer = require("puppeteer");
const fs = require("fs");
require("node-json-color-stringify");

console.log("Proses scraping sedang berjalan, mohon tunggu sejenak...");

(async () => {
  const browser = await puppeteer.launch();

  const extractCategories = async () => {
    const url = "https://www.bankmega.com/promolainnya.php";
    console.log(`Scraping Categories on: ${url}`);
    const page = await browser.newPage();
    await page.goto(url);

    const categoriesOnPage = await page.evaluate(() =>
      Array.from(document.querySelectorAll("div#subcatpromo img")).map(
        category => category.title
      )
    );

    return categoriesOnPage;
  };

  const categories = await extractCategories();
  console.log(categories);

  //////////////////////////////////////////////////

  const extractPromos = async (url, product, subcat) => {
    console.log(`Scraping Promos on: ${url}`);
    const page = await browser.newPage();
    await page.goto(url);

    const promosOnPage = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img#imgClass")).map(promo => ({
        title: promo.title,
        imageUrl: promo.src
      }))
    );

    const promoDetailUrlsOnPage = await page.evaluate(() =>
      Array.from(document.querySelectorAll("ul#promolain.clearfix li a")).map(
        item => item.href
      )
    );

    const combined = [];
    for (let i = 0; i < promosOnPage.length; i++) {
      combined.push({
        title: promosOnPage[i].title,
        imageUrl: promosOnPage[i].imageUrl,
        promoDetailUrl: promoDetailUrlsOnPage[i]
      });
    }

    if (combined.length < 1) {
      console.log(`Terminate Recursion on: ${url}`);
      return combined;
    } else {
      const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
      const nextUrl = `https://www.bankmega.com/promolainnya.php?product=${product}&subcat=${subcat}&page=${nextPageNumber}`;

      return combined.concat(await extractPromos(nextUrl, product, subcat));
    }
  };

  function objectify(key, value) {
    return {
      [key]: value
    };
  }

  const result = [];
  for (let i = 1; i <= categories.length; i++) {
    result.push(
      objectify(
        categories[i - 1],
        await extractPromos(
          `https://www.bankmega.com/promolainnya.php?product=1&subcat=${i}&page=1`,
          1,
          [i]
        )
      )
    );
  }

  //////////////////////////////////////////////////

  console.log(JSON.colorStringify(result, null, 2));

  //////////////////////////////////////////////////

  await browser.close();

  //////////////////////////////////////////////////

  fs.writeFile("solution.json", JSON.stringify(result, null, 2), err => {
    if (err) throw err;
  });
})();
