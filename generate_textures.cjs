const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
    headless: true
  });
  
  // 1. Generate the Card Texture (1080 x 1080)
  const cardPage = await browser.newPage();
  await cardPage.setViewport({ width: 1080, height: 1080 });
  
  const photoUrl = 'file:///' + path.resolve(__dirname, 'src/assets/images/mani-babu.jpg').replace(/\\/g, '/');
  
  const cardHtml = `
    <html>
      <body style="margin: 0; padding: 0; background-color: #000; width: 1080px; height: 1080px; display: flex;">
        <!-- LEFT HALF: Front of the Card -->
        <div style="width: 540px; height: 1080px; background-color: #0c0c0c; position: relative; overflow: hidden; border-right: 2px solid #333;">
           
           <!-- Subtle background gradient -->
           <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(0,255,220,0.1), transparent);"></div>
           
           <!-- Logo Top Left -->
           <div style="position: absolute; top: 40px; left: 40px; display: flex; align-items: center; gap: 10px;">
              <div style="width: 40px; height: 40px; background-color: #00ffdc; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-weight: 900; font-size: 24px; color: black;">M</div>
              <span style="color: white; font-family: sans-serif; font-weight: bold; font-size: 20px; letter-spacing: 2px;">PORTFOLIO</span>
           </div>
           
           <!-- User Photo -->
           <div style="position: absolute; top: 150px; left: 50%; transform: translateX(-50%); width: 280px; height: 280px; border-radius: 50%; overflow: hidden; border: 6px solid #00ffdc; box-shadow: 0 0 40px rgba(0,255,220,0.5);">
              <img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
           </div>
           
           <!-- Vertical decorative text on the right edge -->
           <div style="position: absolute; right: -80px; top: 500px; transform: rotate(90deg); color: rgba(255,255,255,0.05); font-family: sans-serif; font-weight: 900; font-size: 150px; letter-spacing: 10px; pointer-events: none;">
              MANI
           </div>
           
           <!-- User Details Tag -->
           <div style="position: absolute; bottom: 100px; left: 40px; right: 40px; background-color: white; border-radius: 20px; padding: 30px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
              <h1 style="margin: 0; font-family: sans-serif; font-weight: 900; font-size: 36px; color: black; text-transform: uppercase;">Kalla Mani Babu</h1>
              <div style="background-color: black; color: #00ffdc; display: inline-block; padding: 10px 25px; border-radius: 50px; margin-top: 15px; font-family: sans-serif; font-weight: bold; font-size: 18px; letter-spacing: 1px;">
                 FULL STACK DEV
              </div>
           </div>
           
        </div>

        <!-- RIGHT HALF: Back of the Card -->
        <div style="width: 540px; height: 1080px; background-color: #0c0c0c; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
           <div style="width: 120px; height: 120px; background-color: #00ffdc; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-weight: 900; font-size: 80px; color: black; margin-bottom: 20px;">M</div>
           <div style="color: white; font-family: sans-serif; font-weight: bold; font-size: 40px; letter-spacing: 4px;">PORTFOLIO</div>
           <div style="color: #6b7280; font-family: sans-serif; font-size: 24px; margin-top: 15px;">kallamanibabu.me</div>
           
           <div style="margin-top: 80px; width: 70%; display: flex; flex-direction: column; gap: 20px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px;">
                 <span style="color: #9ca3af; font-family: sans-serif; font-size: 20px;">EXPERIENCE</span>
                 <span style="color: white; font-family: sans-serif; font-size: 20px; font-weight: bold;">2+ YEARS</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px;">
                 <span style="color: #9ca3af; font-family: sans-serif; font-size: 20px;">PROJECTS</span>
                 <span style="color: white; font-family: sans-serif; font-size: 20px; font-weight: bold;">4+ COMPLETED</span>
              </div>
           </div>
        </div>
      </body>
    </html>
  `;
  
  await cardPage.setContent(cardHtml, { waitUntil: 'networkidle0' });
  await cardPage.screenshot({ path: path.resolve(__dirname, 'src/assets/Lanyard/card lanyard.png') });
  
  // 2. Generate the Strap Texture (1000 x 250 approximate)
  const strapPage = await browser.newPage();
  await strapPage.setViewport({ width: 1000, height: 250 });
  
  const strapHtml = `
    <html>
      <body style="margin: 0; padding: 0; background-color: #000; width: 1000px; height: 250px; display: flex; align-items: center; justify-content: center;">
         <div style="display: flex; align-items: center; gap: 30px;">
            <div style="width: 100px; height: 100px; background-color: #00ffdc; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-weight: 900; font-size: 70px; color: black;">M</div>
            <div style="display: flex; flex-direction: column;">
               <div style="color: white; font-family: sans-serif; font-weight: bold; font-size: 70px; letter-spacing: 5px;">Mani Babu</div>
               <div style="color: #00ffdc; font-family: sans-serif; font-size: 40px; font-style: italic;">Developer</div>
            </div>
         </div>
      </body>
    </html>
  `;
  
  await strapPage.setContent(strapHtml, { waitUntil: 'networkidle0' });
  await strapPage.screenshot({ path: path.resolve(__dirname, 'src/assets/Lanyard/lanyard.png') });
  
  await browser.close();
  console.log('Textures generated successfully!');
})();
