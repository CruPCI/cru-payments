/* global NodeListOf:false */
import * as tsys from './tsys';

describe('tsys', () => {
  describe('init', () => {
    beforeEach(() => {
      // Remove script tags from previous tests
      [].forEach.call(document.querySelectorAll('script[src*="tsep"]'), (element: HTMLScriptElement) =>{
        element.remove();
      });
    });
    it('should remove any existing divs', () => {
      // Add previous div
      const div: HTMLElement = document.createElement('div');
      div.setAttribute('id', 'tsep-cardNumDiv');
      document.body.appendChild(div);

      tsys.init('staging', 'deviceId', 'manifest');
      tsys._inputsObservable
        .subscribe();
      expect(document.querySelectorAll('#tsep-cardNumDiv').length).toEqual(1);
    });
    it('should create an Observable that emits the input elements', (done) => {
      // Mock TSYS inputs
      const cardInput = document.createElement('input');
      const dateInput = document.createElement('input');
      const cvvInput = document.createElement('input');

      tsys.init('staging', 'deviceId', 'manifest');
      tsys._inputsObservable
        .subscribe(inputs => {
          expect(inputs).toEqual({
            cardNumber: cardInput,
            expiryDate: dateInput,
            cvv: cvvInput
          });
          done();
        });

      // Mock TSYS inputs
      document.getElementById('tsep-cardNumDiv').appendChild(cardInput);
      document.getElementById('tsep-datepickerDiv').appendChild(dateInput);
      document.getElementById('tsep-cvv2Div').appendChild(cvvInput);
    });
    it('should add the staging vendor script to page', () => {
      tsys.init('staging', 'deviceId', 'manifest');
      tsys._inputsObservable
        .subscribe();

      const scripts = <NodeListOf<HTMLScriptElement>> document.querySelectorAll('script[src*="tsep"]');
      expect(scripts.length).toEqual(1);
      expect(scripts[0].src).toEqual('https://stagegw.transnox.com/transit-tsep-web/jsView/deviceId?manifest');
    });
    it('should add the production vendor script to page', () => {
      tsys.init('production', 'deviceId', 'manifest');
      tsys._inputsObservable
        .subscribe();

      const scripts = <NodeListOf<HTMLScriptElement>> document.querySelectorAll('script[src*="tsep"]');
      expect(scripts.length).toEqual(1);
      expect(scripts[0].src).toEqual('https://gateway.transit-pass.com/transit-tsep-web/jsView/deviceId?manifest');
    });
    it('should add a new vendor script to page each time inputsObservable is subscribed to. This fetches a new public key for each now encryption', () => {
      tsys.init('staging', 'deviceId', 'manifest');
      tsys._inputsObservable
        .subscribe();
      tsys._inputsObservable
        .subscribe();

      const scripts = <NodeListOf<HTMLScriptElement>> document.querySelectorAll('script[src*="tsep"]');
      expect(scripts.length).toEqual(2);
      expect(scripts[0].src).toEqual('https://stagegw.transnox.com/transit-tsep-web/jsView/deviceId?manifest');
      expect(scripts[1].src).toEqual('https://stagegw.transnox.com/transit-tsep-web/jsView/deviceId?manifest');
    });
    it('should handle an error if TSYS throws an error on load', (done) => {
      tsys.init('staging', 'deviceId', 'manifest');
      tsys._inputsObservable
        .subscribe(null, error => {
          expect(error).toEqual('some error');
          done();
        });
      (<any> window).tsepHandler('ErrorEvent', 'some error');
    });

    it('should behave normally if TSYS fires a non ErrorEvent event at or near load time', (done) => {
      // Mock TSYS inputs
      const cardInput = document.createElement('input');
      const dateInput = document.createElement('input');
      const cvvInput = document.createElement('input');

      tsys.init('staging', 'deviceId', 'manifest');
      tsys._inputsObservable
        .subscribe(inputs => {
          expect(inputs).toEqual({
            cardNumber: cardInput,
            expiryDate: dateInput,
            cvv: cvvInput
          });
          done();
        });

      (<any> window).tsepHandler('FieldValidationErrorEvent', 'some error');

      // Mock TSYS inputs
      document.getElementById('tsep-cardNumDiv').appendChild(cardInput);
      document.getElementById('tsep-datepickerDiv').appendChild(dateInput);
      document.getElementById('tsep-cvv2Div').appendChild(cvvInput);
    });
  });
  describe('encrypt', () => {
    beforeEach(() => {
      // Mock TSYS inputs
      this.cardInput = document.createElement('input');
      this.dateInput = document.createElement('input');
      this.cvvInput = document.createElement('input');

      tsys.init('staging', 'deviceId', 'manifest');

      this.putInputsInDivs = () => {
        // Mock TSYS inputs
        document.getElementById('tsep-cardNumDiv').appendChild(this.cardInput);
        document.getElementById('tsep-datepickerDiv').appendChild(this.dateInput);
        document.getElementById('tsep-cvv2Div').appendChild(this.cvvInput);
      };

      this.fireTsepEvent = (eventType: string) => {
        setTimeout(() => {
          (<any> window).tsepHandler(eventType, eventType + ' body');
        });
      };

      // Mock jquery and trigger
      this.triggerFn = jasmine.createSpy('trigger');
      (<any> window).$ = () => ({trigger: this.triggerFn });
      spyOn((<any> window), '$').and.callThrough();
    });
    it('should fill the TSYS inputs', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {
          expect(this.cardInput.value).toEqual('1234567890123');
          expect(this.dateInput.value).toEqual('12/2015');
          expect(this.cvvInput.value).toEqual('123');
          done();
        }, () => done.fail('it should not have thrown an error'));

      this.putInputsInDivs();

      this.fireTsepEvent('TokenEvent');
    });
    it('should trigger the focusout event to start the TSYS encryption', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => {
          expect((<any> window).$).toHaveBeenCalledWith(this.cardInput);
          expect(this.triggerFn ).toHaveBeenCalledWith('focusout');
          done();
        }, () => done.fail('it should not have thrown an error'));

      this.putInputsInDivs();

      this.fireTsepEvent('TokenEvent');
    });
    it('should handle a successful tokenization', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(event => {
          expect(event).toEqual('TokenEvent body');
          done();
        }, () => done.fail('should not have thrown an error'));

      this.putInputsInDivs();

      this.fireTsepEvent('TokenEvent');
    });
    it('should handle a error during tokenization', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => done.fail('should have thrown an error'),
          error => {
            expect(error).toEqual('ErrorEvent body');
            done();
          });

      this.putInputsInDivs();

      this.fireTsepEvent('ErrorEvent');
    });
    it('should handle a validation error caught by the TSYS library', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => done.fail('should have thrown an error'),
          error => {
            expect(error).toEqual('FieldValidationErrorEvent body');
            done();
          });

      this.putInputsInDivs();

      this.fireTsepEvent('FieldValidationErrorEvent');
    });

    it('should handle a two successful tokenizations in a row', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(event => {
          expect(event).toEqual('TokenEvent body');
        }, () => done.fail('should not have thrown an error'));

      this.putInputsInDivs();

      this.fireTsepEvent('TokenEvent');

      setTimeout(() => {
        tsys.encrypt('1234567890123', '123', 12, 2015)
          .subscribe(event => {
            expect(event).toEqual('TokenEvent body');
            done();
          }, () => done.fail('should not have thrown an error'));

        this.putInputsInDivs();

        this.fireTsepEvent('TokenEvent');
      });
    });


    it('should handle two errors in a row', (done) => {
      tsys.encrypt('1234567890123', '123', 12, 2015)
        .subscribe(() => done.fail('should have thrown an error'),
          error => {
            expect(error).toEqual('ErrorEvent body');
          });

      this.putInputsInDivs();

      this.fireTsepEvent('ErrorEvent');

      setTimeout(() => {
        tsys.encrypt('1234567890123', '123', 12, 2015)
          .subscribe(() => done.fail('should have thrown an error'),
            error => {
              expect(error).toEqual('ErrorEvent body');
              done();
            });

        this.putInputsInDivs();

        this.fireTsepEvent('ErrorEvent');
      });
    });
  });
});
