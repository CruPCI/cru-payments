/* global NodeListOf:false */
import * as tsys from './tsys';

import {Observable} from 'rxjs/Observable';

describe('tsys', () => {
  beforeEach(() => {
    tsys._setupInputs();
  });

  afterEach(() => {
    // Remove script tags from previous tests
    [].forEach.call(document.querySelectorAll('script[src*="tsep"]'), (element: HTMLScriptElement) =>{
      element.remove();
    });

    [].forEach.call(
      document.querySelectorAll('#tsep-cardNumDiv, #tsep-datepickerDiv, #tsep-cvv2Div'),
      (input: HTMLElement) => input.remove()
    );
  });
  describe('init', () => {
    beforeEach(() => {
      // Mock TSYS inputs
      this.cardInput = document.createElement('input');
      this.dateInput = document.createElement('input');
      this.cvvInput = document.createElement('input');

      this.fillDivs = () => {
        document.getElementById('tsep-cardNumDiv').appendChild(this.cardInput);
        document.getElementById('tsep-datepickerDiv').appendChild(this.dateInput);
        document.getElementById('tsep-cvv2Div').appendChild(this.cvvInput);
      };
    });

    it('should create an Observable that emits the input elements', (done) => {
      tsys.init('staging', 'deviceId', 'manifest');
      tsys._inputsObservable
        .subscribe(inputs => {
          expect(inputs).toEqual({
            cardNumber: this.cardInput,
            expiryDate: this.dateInput,
            cvv: this.cvvInput
          });
          done();
        });

      this.fillDivs();
    });

    it('should behave normally if TSYS fires a non ErrorEvent event at or near load time', (done) => {
      tsys.init('staging', 'deviceId', 'manifest');
      tsys._inputsObservable
        .subscribe(inputs => {
          expect(inputs).toEqual({
            cardNumber: this.cardInput,
            expiryDate: this.dateInput,
            cvv: this.cvvInput
          });
          done();
        });

      (<any> window).tsepHandler('FieldValidationErrorEvent', 'some error');

      this.fillDivs();
    });
  });

  describe('importVendorCode', () => {
    it('should add the staging vendor script to page', (done) => {
      tsys.init('staging', 'deviceId', 'manifest');
      tsys._importVendorCode().subscribe(() => {
        const scripts = <NodeListOf<HTMLScriptElement>> document.querySelectorAll('script[src*="tsep"]');
        expect(scripts.length).toEqual(1);
        expect(scripts[0].src).toEqual('https://stagegw.transnox.com/transit-tsep-web/jsView/deviceId?manifest');
        done();
      });
    });

    it('should add the production vendor script to page', (done) => {
      tsys.init('production', 'deviceId', 'manifest');
      tsys._importVendorCode().subscribe(() => {
        const scripts = <NodeListOf<HTMLScriptElement>> document.querySelectorAll('script[src*="tsep"]');
        expect(scripts.length).toEqual(1);
        expect(scripts[0].src).toEqual('https://gateway.transit-pass.com/transit-tsep-web/jsView/deviceId?manifest');
        done();
      });
    });
    it('should support adding duplicate vendor scripts in order to fetch new keys', (done) => {
      tsys.init('staging', 'deviceId', 'manifest');
      tsys._importVendorCode().subscribe();
      tsys._importVendorCode().subscribe(() => {
        const scripts = <NodeListOf<HTMLScriptElement>> document.querySelectorAll('script[src*="tsep"]');
        expect(scripts.length).toEqual(2);
        expect(scripts[0].src).toEqual('https://stagegw.transnox.com/transit-tsep-web/jsView/deviceId?manifest');
        expect(scripts[1].src).toEqual('https://stagegw.transnox.com/transit-tsep-web/jsView/deviceId?manifest');
        done();
      });
    });
  });

  describe('encrypt', () => {
    beforeEach(() => {
      // Mock import vendor code
      spyOn(tsys, '_importVendorCode').and.returnValue(Observable.of('new key loaded'));

      // Mock TSYS inputs
      this.cardInput = document.createElement('input');
      this.dateInput = document.createElement('input');
      this.cvvInput = document.createElement('input');

      tsys.init('staging', 'deviceId', 'manifest');

      //Setup divs
      tsys._inputsObservable
        .subscribe();

      // Fill divs with inputs
      document.getElementById('tsep-cardNumDiv').appendChild(this.cardInput);
      document.getElementById('tsep-datepickerDiv').appendChild(this.dateInput);
      document.getElementById('tsep-cvv2Div').appendChild(this.cvvInput);


      this.fireTsepEvent = (eventType: string, eventBody: any) => {
        setTimeout(() => {
          (<any> window).tsepHandler(eventType, eventBody);
        });
      };

      // Mock jquery and trigger
      this.triggerFn = jasmine.createSpy('trigger');
      (<any> window).jqtsep = () => ({trigger: this.triggerFn });
      spyOn((<any> window), 'jqtsep').and.callThrough();
    });

    it('should add a new vendor script to page each time encrypt is subscribed to. This fetches a new public key for each now encryption', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {
        });

      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {
          expect((<any> tsys._importVendorCode).calls.count()).toEqual(2);
          done();
        });

      this.fireTsepEvent('TokenEvent', {status: 'PASS'});
      this.fireTsepEvent('TokenEvent', {status: 'PASS'});
    });

    it('should handle an error if TSYS throws an error on load', (done) => {
      tsys.init('staging', 'deviceId', 'manifest');
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(null, error => {
          expect(error).toEqual('some error');
          done();
        });

      this.fireTsepEvent('ErrorEvent', 'some error');
    });

    it('should fill the TSYS inputs', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {
          expect(this.cardInput.value).toEqual('1234567890123');
          expect(this.dateInput.value).toEqual('12/2015');
          expect(this.cvvInput.value).toEqual('123');
          done();
        }, () => done.fail('it should not have thrown an error'));

      this.fireTsepEvent('TokenEvent', {status: 'PASS'});
    });

    it('should trigger the focusout event to start the TSYS encryption', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {
          expect((<any> window).jqtsep).toHaveBeenCalledWith(this.cardInput);
          expect(this.triggerFn ).toHaveBeenCalledWith('focusout');
          done();
        }, () => done.fail('it should not have thrown an error'));

      this.fireTsepEvent('TokenEvent', {status: 'PASS'});
    });
    it('should handle a successful tokenization', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(event => {
          expect(event).toEqual({status: 'PASS'});
          done();
        }, () => done.fail('should not have thrown an error'));

      this.fireTsepEvent('TokenEvent', {status: 'PASS'});
    });
    it('should handle a error during tokenization', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => done.fail('should have thrown an error'),
          error => {
            expect(error).toEqual('ErrorEvent body');
            done();
          });

      this.fireTsepEvent('ErrorEvent', 'ErrorEvent body');
    });
    it('should handle a error when TSYS status is not pass', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => done.fail('should have thrown an error'),
          error => {
            expect(error).toEqual({status: 'FAILURE'});
            done();
          });

      this.fireTsepEvent('TokenEvent', {status: 'FAILURE'});
    });
    it('should handle a validation error caught by the TSYS library', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => done.fail('should have thrown an error'),
          error => {
            expect(error).toEqual('FieldValidationErrorEvent body');
            done();
          });

      this.fireTsepEvent('FieldValidationErrorEvent', 'FieldValidationErrorEvent body');
    });

    it('should handle a two successful tokenizations in a row', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(event => {
          expect(event).toEqual({status: 'PASS'});
        }, () => done.fail('should not have thrown an error'));

      this.fireTsepEvent('TokenEvent', {status: 'PASS'});

      setTimeout(() => {
        tsys.encrypt('1234567890123', '123', 12, 2015)
          .subscribe(event => {
            expect(event).toEqual({status: 'PASS'});
            done();
          }, () => done.fail('should not have thrown an error'));

        this.fireTsepEvent('TokenEvent', {status: 'PASS'});
      });
    });


    it('should handle two errors in a row', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => done.fail('should have thrown an error'),
          error => {
            expect(error).toEqual('ErrorEvent body');
          });

      this.fireTsepEvent('ErrorEvent', 'ErrorEvent body');

      setTimeout(() => {
        tsys.encrypt('1234567890123', '123', 12, 2015)
          .subscribe(() => done.fail('should have thrown an error'),
            error => {
              expect(error).toEqual('ErrorEvent body');
              done();
            });

        this.fireTsepEvent('ErrorEvent', 'ErrorEvent body');
      });
    });

    it('should work with the old TSYS library and use $ to trigger focusout', (done) => {
      delete (<any> window).jqtsep;

      this.triggerFn = jasmine.createSpy('trigger');
      (<any> window).$ = () => ({trigger: this.triggerFn });
      spyOn((<any> window), '$').and.callThrough();

      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(event => {
          expect(event).toEqual({status: 'PASS'});
          expect(this.triggerFn).toHaveBeenCalledWith('focusout');
          done();
        }, () => done.fail('should not have thrown an error'));

      this.fireTsepEvent('TokenEvent', {status: 'PASS'});
    });
  });
});
