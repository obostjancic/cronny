"use strict";
// fetch list with
// https://www.immobilienscout24.at/portal/graphql?operationName=findPropertiesByParams&variables=%7B%22aspectRatio%22%3A1.77%2C%22params%22%3A%7B%22countryCode%22%3A%22AT%22%2C%22estateType%22%3A%22APARTMENT%22%2C%22from%22%3A%2215%22%2C%22size%22%3A%2210%22%2C%22transferType%22%3A%22RENT%22%2C%22useType%22%3A%22RESIDENTIAL%22%2C%22zipCode%22%3A%221200%22%7D%7D&extensions=%7B%22persistedQuery%22%3A%7B%22sha256Hash%22%3A%221a73f5536e8aad220c24f1b4ce4f7654e3d7a1d932e85134f9efc1777f34f4ce%22%2C%22version%22%3A1%7D%7D
Object.defineProperty(exports, "__esModule", { value: true });
// response contains "exposeID"
// use that to query https://www.immobilienscout24.at/expose/graphql
