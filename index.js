const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();

  const extractOtherUrls = async () => {
    const url = "https://www.bankmega.com/promolainnya.php";
    console.log(`Scraping Other URLs on: ${url}`);
    const page = await browser.newPage();
    await page.goto(url);

    const otherUrlsOnPage = await page.evaluate(() =>
      Array.from(document.querySelectorAll("ul#promolain.clearfix li a")).map(
        item => item.href
      )
    );

    return otherUrlsOnPage;
  };

  const otherUrls = await extractOtherUrls();
  console.log(otherUrls);
})();
