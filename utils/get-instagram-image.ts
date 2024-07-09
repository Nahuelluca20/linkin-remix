import puppeteer from "puppeteer";

export async function getInstagramImageUrl(postUrl: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(postUrl, { waitUntil: "networkidle0" });

    // Esperar a que la imagen se cargue
    await page.waitForSelector(
      'img[class*="x5yr21d xu96u03 x10l6tqk x13vifvy x87ps6o xh8yej3"]',
      { timeout: 5000 }
    );

    // Obtener la URL de la imagen
    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector(
        'img[class*="x5yr21d xu96u03 x10l6tqk x13vifvy x87ps6o xh8yej3"]'
      ) as HTMLImageElement | null;
      return img ? img?.src : null;
    });

    await browser.close();
    return imageUrl;
  } catch (error) {
    console.error("Error al obtener la imagen:", error);
    await browser.close();
    return null;
  }
}
