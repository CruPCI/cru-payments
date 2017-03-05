import * as tsys from './tsys';

import {Observable} from 'rxjs/Observable';
import {once as mockOnce} from 'fetch-mock';

/* eslint-disable no-undef */
interface TsysError {
  message: string;
  data: any;
}
/* eslint-enable no-undef */

describe('tsys', () => {
  describe('init', () => {
    it('should set config variables', () => {
      tsys.init('staging', 'deviceId', 'manifest');
      expect(tsys._env).toEqual('staging');
      expect(tsys._deviceId).toEqual('deviceId');
      expect(tsys._manifest).toEqual('manifest');
    });
  });

  describe('makeRequest', () => {
    it('should handle a json response', (done) => {
      mockOnce(
        '<some url>',
        { key: 'value' }
      );
      tsys._makeRequest('<some url>', { body: '<some body>' }, (request: Request) => request.json(), 'testing fetch')
        .subscribe((data: any) => {
          expect(data.key).toEqual('value');
          done();
        });
    });
    it('should handle a text response', (done) => {
      mockOnce(
        '<some url>',
        'some string'
      );
      tsys._makeRequest('<some url>', { body: '<some body>' }, (request: Request) => request.text(), 'testing fetch')
        .subscribe((data: string) => {
          expect(data).toEqual('some string');
          done();
        });
    });
    it('should handle a server error', (done) => {
      mockOnce(
        '<some url>',
        new Response('some error', { status: 500, statusText: 'Internal Server Error' })
      );
      tsys._makeRequest('<some url>', { body: '<some body>' }, (request: Request) => request.text(), 'testing fetch')
        .subscribe(() => done.fail(),
          (error: TsysError) => {
            expect(error).toEqual({ message: `Server error while testing fetch`, data: { status: 500, statusText: 'Internal Server Error', body: 'some error' } });
            done();
          });
    });
    it('should handle a network error', (done) => {
      mockOnce(
        '<some url>',
        { throws: new TypeError('Failed to fetch') }
      );
      tsys._makeRequest('<some url>', { body: '<some body>' } , (request: Request) => request.text(), 'testing fetch')
        .subscribe(() => done.fail(),
          (error: TsysError) => {
            expect(error).toEqual({ message: `Network error while testing fetch`, data: new TypeError('Failed to fetch') });
            done();
          });
    });
  });

  describe('fetchTsysData', () => {
    beforeEach(() => {
      tsys.init('staging', 'deviceId', 'manifest');
    });
    it('should get the staging url, key, and keyId for tokenization', (done) => {
      spyOn(tsys, '_makeRequest').and.returnValue(Observable.of("function getKey() { return '<key>'; } function getKeyId() { return '<keyId>' } function getUrl() { return '<url>' }"));
      tsys._fetchTsysData()
        .subscribe((data: tsys.TsysData) => {
          expect(tsys._makeRequest).toHaveBeenCalledWith(
            'https://stagegw.transnox.com/transit-tsep-web/jsView/deviceId?manifest',
            {},
            jasmine.any(Function),
            'loading TSYS library'
          );
          expect(data).toEqual({
            url: '<url>',
            key: '<key>',
            keyId: '<keyId>'
          });
          done();
        });
    });

    it('should get the production url, key, and keyId for tokenization', (done) => {
      spyOn(tsys, '_makeRequest').and.returnValue(Observable.of("function getKey() { return '<key>'; } function getKeyId() { return '<keyId>' } function getUrl() { return '<url>' }"));
      tsys.init('production', 'deviceId', 'manifest');
      tsys._fetchTsysData()
        .subscribe((data: tsys.TsysData) => {
          expect(tsys._makeRequest).toHaveBeenCalledWith(
            'https://gateway.transit-pass.com/transit-tsep-web/jsView/deviceId?manifest',
            {},
            jasmine.any(Function),
            'loading TSYS library'
          );
          expect(data).toEqual({
            url: '<url>',
            key: '<key>',
            keyId: '<keyId>'
          });
          done();
        });
    });

    it('should handle an error parsing the TSYS code', (done) => {
      spyOn(tsys, '_makeRequest').and.returnValue(Observable.of('@'));
      tsys._fetchTsysData()
        .subscribe(() => {},
          (error: TsysError) => {
            expect(error).toEqual({
              message: 'Error parsing TSYS code',
              data: jasmine.any(SyntaxError)
            });
            done();
          });
    });

    it('should handle a missing function', (done) => {
      spyOn(tsys, '_makeRequest').and.returnValue(Observable.of(''));
      tsys._fetchTsysData()
        .subscribe(() => {},
          (error: TsysError) => {
            expect(error).toEqual({
              message: 'TSYS load error',
              data: 'TSYS did not provide a getUrl, getKey, and/or getKeyId function'
            });
            done();
          });
    });

    it('should handle a error passed by the TSYS library', (done) => {
      spyOn(tsys, '_makeRequest').and.returnValue(Observable.of('window.onload = function () {var eEvent = new Object();eEvent.responseCode="TSEPERR911";eEvent.status="FAIL";eEvent.message="Authentication Failed"; try{tsepHandler("ErrorEvent", eEvent);}catch(e){}};'));
      tsys._fetchTsysData()
        .subscribe(() => {},
          (error: TsysError) => {
            expect(error).toEqual({
              message: 'TSYS load error',
              data: {responseCode: "TSEPERR911", status: "FAIL", message: "Authentication Failed"}
            });
            done();
          });
    });
  });

  describe('encrypt', () => {
    beforeEach(() => {
      this.validKey = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCH+HoBX8drfBn88Z49gYnK7Z9FVbbBg76lXHfoEUSPHLuzQ9ws4fR3PzDcKO3VIb6/9g3VBfFvMLrdimAGRwqmm4kk/JnnDFWF/HBVmncRTtDkNPuEN15+XJSB8RcvUVQ7s8gkutCU/w2ZXzI5+7XpEyX08Ao7f2IKuncBQmDQJwIDAQAB-----END PUBLIC KEY-----';

      spyOn(tsys, '_fetchTsysData').and.returnValue(Observable.of({
        url: '<url>',
        key: this.validKey,
        keyId: '<keyId>'
      }));
      tsys.init('staging', '<deviceId>', '<manifest>');
    });

    it('should throw an error if deviceId was not set', (done) => {
      tsys.init('staging', '', 'manifest');
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {},
          error => {
            expect(error).toEqual({ message: 'Device ID not set', data: 'init needs to be called first' });
            done();
          });
    });

    it('should throw an error if manifest was not set', (done) => {
      tsys.init('staging', 'deviceId', '');
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {},
          error => {
            expect(error).toEqual({ message: 'Manifest not set', data: 'init needs to be called first' });
            done();
          });
    });

    it('should handle a successful tokenization', (done) => {
      const tokenObj = {
        cardType: 'X',
        cvv2: '1234',
        expirationDate: '10/2017',
        maskedCardNumber: '1000',
        message: 'Success',
        responseCode: 'A0000',
        status: 'PASS',
        transactionID: '6417599',
        tsepToken: 'aNWEmSu7RRF1000'
      };
      spyOn(tsys, '_makeRequest').and.returnValue(Observable.of(tokenObj));
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(data => {
          expect(tsys._makeRequest).toHaveBeenCalledWith(
            '<url>/generateTsepToken',
            {
              method: 'POST',
              body: jasmine.stringMatching(/\{"deviceID":"<deviceId>","uniqueKeyIdentifier":"<keyId>","manifest":"<manifest>","encCardNumber":.{100,},"expirationDate":"12\/2015","cvv2":"123"\}/),
              headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              })
            },
            jasmine.any(Function),
            'performing tokenization'
          );
          expect(data).toEqual(tokenObj);
          done();
        }, () => done.fail('should not have thrown an error'));
    });

    it('should convert month to a string', (done) => {
      spyOn(tsys, '_makeRequest').and.returnValue(Observable.of({ status: 'PASS' }));
      tsys.encrypt('1234567890123', '123', 1, 2015)
        .subscribe(data => {
          expect(tsys._makeRequest).toHaveBeenCalledWith(
            '<url>/generateTsepToken',
            {
              method: 'POST',
              body: jasmine.stringMatching(/\{"deviceID":"<deviceId>","uniqueKeyIdentifier":"<keyId>","manifest":"<manifest>","encCardNumber":.{100,},"expirationDate":"01\/2015","cvv2":"123"\}/),
              headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              })
            },
            jasmine.any(Function),
            'performing tokenization'
          );
          expect(data).toEqual({ status: 'PASS' });
          done();
        }, () => done.fail('should not have thrown an error'));
    });

    it('should handle an invalid key', (done) => {
      (<jasmine.Spy> tsys._fetchTsysData).and.returnValue(Observable.of({
        url: '<url>',
        key: '<key>',
        keyId: '<keyId>'
      }));

      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {},
        error => {
          expect(error).toEqual({ message: 'Encryption error', data: 'Could not encrypt the card number with the key provided by TSYS' });
          done();
        });
    });

    it('should handle a error when TSYS status is not pass', (done) => {
      spyOn(tsys, '_makeRequest').and.returnValue(Observable.of({ status: 'FAILURE' }));
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {},
          error => {
            expect(error).toEqual({ message: 'Tokenization error', data: { status: 'FAILURE' } });
            done();
          });
    });
  });
});
