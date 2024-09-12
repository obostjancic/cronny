export type JSONValue = number | string | boolean | JSONObject | JSONArray;

export type JSONArray = JSONValue[];

export type JSONObject = {
  [key: string]: JSONValue;
};

export type JSON = JSONObject | JSONArray;
