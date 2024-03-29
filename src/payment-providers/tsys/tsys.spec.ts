import * as tsys from './tsys';

import {Observable} from 'rxjs/Observable';
import * as fetchMock from 'fetch-mock';

/* eslint-disable no-undef */
interface TsysError {
  message: string;
  data: any;
}
/* eslint-enable no-undef */
let validKey: string = '';

describe('tsys', () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2015, 3, 1)); // Apr 01 2015
  });
  afterEach(() => {
    jasmine.clock().uninstall();
  });

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
      fetchMock.once(
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
      fetchMock.once(
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
      fetchMock.once(
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
      fetchMock.once(
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

  describe('removeAppendChild', () => {
    it('it should remove appendChild calls', () => {
      expect(tsys._removeAppendChild(`var fileref=document.createElement("script");fileref.setAttribute("type","text/javascript");fileref.setAttribute("src", "https://stagegw.transnox.com/transit-tsep-web/resources/jsencrypt.js");document.getElementsByTagName("head")[0].appendChild(fileref);var fileref=document.createElement("script");fileref.setAttribute("type","text/javascript");fileref.setAttribute("src", "https://stagegw.transnox.com/transit-tsep-web/resources/tsep.js");document.getElementsByTagName("head")[0].appendChild(fileref);function getKey(){return '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDV1MDP6OJRHpaf8QvLwchZe2fpmQEhr7GHzypHov3504w/cNxEI5+F4xb70PwtZ+AvfAMg6h9SHnaKf4TrbUepOyAb5FIYXPgidqezV0hxWSnK6L44JOmS/fJDmD8JOl4KmWKbfsGio+qVNOQ0M96NxTWQbM5Bsd7r/5NXDleJrQIDAQAB-----END PUBLIC KEY-----'; } function getKeyId(){return 'p6ngr1edsfdginitgef9hpalbn'} function getDeviceId(){return '88812128320102'} function getManifest(){return '486139234ec6da677cab682f15c1dc6a7901251fafe34ea165a367eab1cfa9bbba07218b03754e61782dd01782674358db91cf274df96d7c5ac2280b03351d0f57616d7e'} function getUrl(){return 'https://stagegw.transnox.com/transit-tsep-web'};`)).toEqual(`var fileref=document.createElement("script");fileref.setAttribute("type","text/javascript");fileref.setAttribute("src", "https://stagegw.transnox.com/transit-tsep-web/resources/jsencrypt.js");var fileref=document.createElement("script");fileref.setAttribute("type","text/javascript");fileref.setAttribute("src", "https://stagegw.transnox.com/transit-tsep-web/resources/tsep.js");function getKey(){return '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDV1MDP6OJRHpaf8QvLwchZe2fpmQEhr7GHzypHov3504w/cNxEI5+F4xb70PwtZ+AvfAMg6h9SHnaKf4TrbUepOyAb5FIYXPgidqezV0hxWSnK6L44JOmS/fJDmD8JOl4KmWKbfsGio+qVNOQ0M96NxTWQbM5Bsd7r/5NXDleJrQIDAQAB-----END PUBLIC KEY-----'; } function getKeyId(){return 'p6ngr1edsfdginitgef9hpalbn'} function getDeviceId(){return '88812128320102'} function getManifest(){return '486139234ec6da677cab682f15c1dc6a7901251fafe34ea165a367eab1cfa9bbba07218b03754e61782dd01782674358db91cf274df96d7c5ac2280b03351d0f57616d7e'} function getUrl(){return 'https://stagegw.transnox.com/transit-tsep-web'};`);
    });
  });

  describe('encrypt', () => {
    beforeEach(() => {
      validKey = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCH+HoBX8drfBn88Z49gYnK7Z9FVbbBg76lXHfoEUSPHLuzQ9ws4fR3PzDcKO3VIb6/9g3VBfFvMLrdimAGRwqmm4kk/JnnDFWF/HBVmncRTtDkNPuEN15+XJSB8RcvUVQ7s8gkutCU/w2ZXzI5+7XpEyX08Ao7f2IKuncBQmDQJwIDAQAB-----END PUBLIC KEY-----';

      spyOn(tsys, '_fetchTsysData').and.returnValue(Observable.of({
        url: '<url>',
        key: validKey,
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

  describe('perform live test', () => {
    it('should successfully receive a token from TSYS', (done) => {
      (<any> fetchMock)._unMock();
      (<any> window).fetch('https://give-stage2.cru.org/cortex/tsys/manifest')
        .then((response: Response) => {
          if (!response.ok) {
            throw 'Error fetching deviceId and manifest from EP';
          }
          return response.json();
        })
        .then((tsysData: { deviceId: string, manifest: string }) => {
          tsys.init('staging', tsysData.deviceId, tsysData.manifest);
          tsys.encrypt('4111111111111111', '123', 12, new Date().getFullYear() + 1)
            .subscribe(response => {
                expect(response).toEqual({
                  responseCode: 'A0000',
                  status: 'PASS',
                  message: 'Success',
                  expirationDate: '12/2016',
                  cvv2: '123',
                  tsepToken: jasmine.stringMatching(/^[A-Za-z0-9]{16}$/),
                  maskedCardNumber: '1111',
                  cardType: 'V',
                  transactionID: jasmine.stringMatching(/^\d{7,8}$/)
                });
                done();
              },
              error => {
                done.fail(error);
              });
        })
        .catch((error: any) => done.fail(error));
    }, 10000); // Give TSYS 10s to respond
    it('should receive an error message from TSYS', (done) => {
      (<any> fetchMock)._unMock();
      tsys.init('staging', 'test', 'testingErrorMessage');
      tsys.encrypt('4111111111111111', '123', 12, new Date().getFullYear() + 1)
        .subscribe(() => {
            done.fail('Should not have succeeded');
          },
          error => {
            expect(error).toEqual({ message: 'TSYS load error', data: {
              responseCode: 'TSEPERR911',
              status: 'FAIL',
              message: 'Authentication Failed' }
            });
            done();
          });
    }, 10000); // Give TSYS 10s to respond
  });
});
