import parsimmon from 'parsimmon';

export type ParseResult = parsimmon.Success<any> | (parsimmon.Failure & { error: string });
export type Values = Array<{type: 'pair'; name: string; value: any} | {type: 'message'; name: string; values: any}>; 

export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONObject 
    | JSONArray;

export interface JSONObject {
    [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> { }

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

const lexeme = <T>(p: parsimmon.Parser<T>) => p.skip(whitespace);

const colon = lexeme(string(':'));

const lbrace = lexeme(string('{'));
const rbrace = lexeme(string('}'));

const stripFirstLast = (x: string) => x.substring(1, x.length - 1);

const identifier = lexeme(regex(/[a-zA-Z_][0-9a-zA-Z_+-]*/));
const doubleString = lexeme(regex(/".*"/).map(stripFirstLast));
const singleString = lexeme(regex(/'.*'/).map(stripFirstLast));

const number = lexeme(regex(/[.]?[0-9+-][0-9a-zA-Z_.+-]*/)).map(Number);
const trueLiteral = lexeme(string('true')).result(true);
const falseLiteral = lexeme(string('false')).result(false);

const PbLang = parsimmon.createLanguage({
    Expr: function (r) {
        return alt(r.Pair, r.Message).many();
    },
    Message: function (r) {
        return seq(identifier, colon.times(0, 1).then(lbrace).then(r.Expr).skip(rbrace))
            .map(message => ({
                type: 'message',
                name: message[0],
                values: message[1]
            }));
    },
    Value: function () {
        return alt(trueLiteral, falseLiteral, number, doubleString, singleString, identifier)
    },
    Pair: function (r) {
        return seq(identifier.skip(colon), r.Value)
            .map(pair => ({
                type: 'pair',
                name: pair[0],
                value: pair[1]
            }));
    }
});


function parseRaw(input: string): ParseResult {
    const result = whitespace.then(PbLang.Expr).parse(input);
    if (!result.status) {
        return {
            ...result,
            error: formatError(input, result)
        };
    }
    return result;
}

export function parse(input: string, schema = {}): JSONObject | {error: string} {
    const raw = parseRaw(input);
    if ('error' in raw) {
        console.error(raw.error);
        return { error: raw.error };
    } else {
        return toObject(raw.value, schema);
    }
}

function toObject(input: Values, schema: JSONObject = {}) {
    const result = input.reduce((acc: JSONObject, item) => {
        var value = item.type === 'message' ? toObject(item.values) : item.value;
        var isArray = schema[item.name] && schema[item.name] instanceof Array;

        if (!(item.name in acc)) {
            acc[item.name] = isArray ? [value] : value;
        } else if (acc[item.name] instanceof Array) {
            (<JSONArray>acc[item.name]).push(value);
        } else {
            acc[item.name] = [acc[item.name], value];
        }
        return acc;
    }, {});
    return result;
}