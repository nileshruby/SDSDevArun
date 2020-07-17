import { async } from '@angular/core/testing';
import { PhoneFormatPipe } from '.';

describe('PhoneFormatPipe', () => {
    let phonepipe: PhoneFormatPipe;

    beforeEach(() => {
        phonepipe = new PhoneFormatPipe();
    });

    it('should be created', async(() => {
        expect(phonepipe).toBeTruthy();
    }));

    it('should check if the value is empty so return an empty string.', () => {
        let value = '';
        const response = phonepipe.transform(value, '');
        expect(response).toEqual('');
    });

    it('should convert phone number string to phone fomrat .', () => {
        let value = '1234567890';
        const response = phonepipe.transform(value, '');
        expect(response).toEqual('(123) 456-7890');
    });
});