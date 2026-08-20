// Karma launcher: headless Chrome that sends a configurable Referer header.
//
// Browsers forbid setting Referer from page JavaScript and karma-chrome-launcher
// has no header hook, so this drives Chrome over the DevTools Protocol
// (puppeteer-core) and rewrites the Referer on every request before the karma
// page loads. Configure it through karma `customLaunchers`:
//
//   MyChrome: {
//     base: 'ChromeHeadlessReferer',
//     referer: 'https://example.org/',  // value for the Referer header
//     flags: ['--no-sandbox']           // optional extra Chrome flags
//   }
//
// Chrome binary: CHROME_BIN if set, otherwise the system-installed stable Chrome.

function ChromeHeadlessRefererLauncher(baseLauncherDecorator, logger, args) {
  baseLauncherDecorator(this);

  const log = logger.create('launcher.ChromeHeadlessReferer');
  this.name = 'ChromeHeadlessReferer';

  let browser = null;

  const onDisconnected = () => {
    log.error('Chrome disconnected unexpectedly');
    this._done('crashed');
  };

  this.on('start', async (url) => {
    try {
      // puppeteer-core is ESM; load it lazily.
      const { default: puppeteer } = await import('puppeteer-core');

      browser = await puppeteer.launch({
        ...(process.env.CHROME_BIN
          ? { executablePath: process.env.CHROME_BIN }
          : { channel: 'chrome' }),
        args: args.flags || []
      });
      browser.on('disconnected', onDisconnected);

      const [page] = await browser.pages();

      // Present as a regular Chrome of this version; some origins reject "HeadlessChrome".
      const userAgent = await browser.userAgent();
      await page.setUserAgent(userAgent.replace('HeadlessChrome', 'Chrome'));

      if (args.referer) {
        await page.setRequestInterception(true);
        page.on('request', (request) => {
          request
            .continue({ headers: { ...request.headers(), referer: args.referer } })
            .catch((err) => log.debug(`continue() failed for ${request.url()}: ${err.message}`));
        });
      } else {
        log.warn('No `referer` configured for this launcher; Referer header left untouched');
      }

      await page.goto(url);
    } catch (err) {
      log.error(`Failed to launch Chrome: ${err.stack || err}`);
      this._done(err);
    }
  });

  this.on('kill', async (done) => {
    if (browser) {
      browser.off('disconnected', onDisconnected);
      try {
        await browser.close();
      } catch (err) {
        log.debug(`browser.close() failed: ${err.message}`);
      }
      browser = null;
    }
    this._done();
    done();
  });
}

ChromeHeadlessRefererLauncher.$inject = ['baseLauncherDecorator', 'logger', 'args'];

module.exports = {
  'launcher:ChromeHeadlessReferer': ['type', ChromeHeadlessRefererLauncher]
};
