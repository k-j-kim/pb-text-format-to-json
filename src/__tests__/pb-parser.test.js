import { parse } from '../../dist/pb-parser.js';
import fs from 'fs';
import { expect } from '@jest/globals';

var input = ``;

describe('pb-parser', () => {
    test('parse', () => {
        var input = fs.readFileSync('./src/__tests__/__mocks__/metadata.pb', 'utf-8');
        var output = parse(input);
        expect(output).toMatchSnapshot();
      });
});