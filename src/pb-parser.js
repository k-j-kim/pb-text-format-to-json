import parsimmon from 'parsimmon';
import colors from 'colors';

const {
    regex,
    string,
    optWhitespace,
    lazy,
    alt,
    seq,
    formatError
} = parsimmon;

const comment = regex(/#.+/).then(optWhitespace.atMost(1));
const whitespace = optWhitespace.then(comment.atMost(1));

const lexeme = p => p.skip(whitespace);

const colon = lexeme(string(':'));

const lbrace = lexeme(string('{'));
const rbrace = lexeme(string('}'));

const stripFirstLast = x => x.substr(1, x.length - 2);

const identifier = lexeme(regex(/[a-zA-Z_][0-9a-zA-Z_+-]*/));
const doubleString = lexeme(regex(/".*"/).map(stripFirstLast));
const singleString = lexeme(regex(/'.*'/).map(stripFirstLast));

const number = lexeme(regex(/[.]?[0-9+-][0-9a-zA-Z_.+-]*/)).map(Number);
const trueLiteral = lexeme(string('true')).result(true);
const falseLiteral = lexeme(string('false')).result(false);

const expr = lazy('an expression', () => alt(pair, message).many());

const message = seq(identifier, colon.times(0, 1).then(lbrace).then(expr).skip(rbrace))
    .map(message => ({
        type: 'message',
        name: message[0],
        values: message[1]
    }));

const value = alt(trueLiteral, falseLiteral, number, doubleString, singleString, identifier);

const pair = seq(identifier.skip(colon), value)
    .map(pair => ({
        type: 'pair',
        name: pair[0],
        value: pair[1]
    }));

function parseRaw(input) {
    const result = whitespace.then(expr).parse(input);
    if (!result.status) {
        result.error = formatError(input, result);
    }
    return result;
}

function parse(input, schema = {}) {
    const raw = parseRaw(input);
    if (raw.error) {
        console.log(raw.error.red);
        return { error: raw.error };
    } else {
        return toObject(raw.value, schema);
    }

}

function toObject(input, schema = {}) {
    const result = input.reduce((acc, item) => {
        var value = item.values ? toObject(item.values) : item.value;
        var isArray = schema[item.name] && schema[item.name] instanceof Array;

        if (!acc[item.name]) {
            acc[item.name] = isArray ? [value] : value;
        } else if (acc[item.name] instanceof Array) {
            acc[item.name].push(value);
        } else {
            acc[item.name] = [acc[item.name], value];
        }
        return acc;
    }, {});
    return result;
}

export { parse };