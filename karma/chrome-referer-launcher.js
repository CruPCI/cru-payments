// Karma launcher: headless Chrome with a spoofed Referer header.
//
// The "perform live test" TSYS spec makes real calls to TSYS staging, which
// validates the Referer header against the domain registered with Cru's TSYS
// account. Browsers forbid setting Referer from page JavaScript, and Chrome has
// no launcher-level equivalent of PhantomJS's `customHeaders`, so this launcher
// drives Chrome over the DevTools Protocol (via puppeteer-core) and rewrites the
// Referer on every outgoing request to the value of TSYS_REFERRER.
//
// Interception is enabled before the karma page is loaded, so the header is in
// place before any test runs.
//
// Chrome binary resolution: CHROME_BIN if set, otherwise the system-installed
// stable Chrome (puppeteer `channel: 'chrome'`).

const TSYS_REFERRER = process.env.TSYS_REFERRER;

function ChromeHeadlessRefererLauncher(baseLauncherDecorator, logger, args) {
  baseLauncherDecorator(this);

  const log = logger.create('launcher.ChromeHeadlessReferer');
  this.name = 'ChromeHeadlessReferer';

  let browser = null;
  let closing = false;

  this.on('start', async (url) => {
    try {
      if (!TSYS_REFERRER) {
        log.warn(
          'TSYS_REFERRER is not set; requests will carry Chrome\'s default Referer ' +
          'and the live TSYS tests will fail. Set TSYS_REFERRER=https://give-stage2.cru.org/'
        );
      }

      // puppeteer-core is ESM-only; load it lazily so karma.conf.js can stay CommonJS.
      const { default: puppeteer } = await import('puppeteer-core');

      browser = await puppeteer.launch({
        headless: true,
        ...(process.env.CHROME_BIN
          ? { executablePath: process.env.CHROME_BIN }
          : { channel: 'chrome' }),
        args: ['--no-sandbox', '--disable-gpu', ...((args && args.flags) || [])]
      });

      browser.on('disconnected', () => {
        if (!closing) {
          log.error('Chrome disconnected unexpectedly');
          this._done('crashed');
        }
      });

      const page = (await browser.pages())[0] || (await browser.newPage());

      // CloudFront in front of give-stage2.cru.org returns 403 (with no CORS headers) to
      // the "HeadlessChrome" user agent, which breaks the manifest fetch in the live test.
      // Present the same UA a real Chrome of this version would send.
      const userAgent = await browser.userAgent();
      await page.setUserAgent(userAgent.replace('HeadlessChrome', 'Chrome'));

      if (TSYS_REFERRER) {
        await page.setRequestInterception(true);
        page.on('request', (request) => {
          request
            .continue({ headers: { ...request.headers(), referer: TSYS_REFERRER } })
            .catch((err) => log.debug(`continue() failed for ${request.url()}: ${err.message}`));
        });
      }

      await page.goto(url);
    } catch (err) {
      log.error(`Failed to launch Chrome: ${err && err.stack ? err.stack : err}`);
      this._done(err);
    }
  });

  this.on('kill', async (done) => {
    closing = true;
    if (browser) {
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
