import Parsimmon from "parsimmon";

export type ParseResult = Parsimmon.Success<any> | (Parsimmon.Failure & { error: string });
export type Values = Array<{type: 'pair'; name: string; value: any} | {type: 'message'; name: string; values: any}>; 

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

export interface JSONObject {
    [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> { }