import puppeteer from "puppeteer";

export async function getInstagramImageUrl(
  postUrl: string
): Promise<string | null> {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
  const page = await browser.newPage();

  try {
    // Set a custom user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Enable request interception
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        ["image", "stylesheet", "font"].indexOf(request.resourceType()) !== -1
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(postUrl, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for the image to load
    await page.waitForSelector(
      'img[class*="x5yr21d xu96u03 x10l6tqk x13vifvy x87ps6o xh8yej3"]',
      { timeout: 15000 }
    );

    // Get the image URL
    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector(
        'img[class*="x5yr21d xu96u03 x10l6tqk x13vifvy x87ps6o xh8yej3"]'
      ) as HTMLImageElement | null;
      return img ? img.src : null;
    });

    console.log("Image URL found:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error getting the image:", error);
    return null;
  } finally {
    await browser.close();
  }
}
