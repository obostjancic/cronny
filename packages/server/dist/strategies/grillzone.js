"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
exports.fetchCurrentGrillareaState = fetchCurrentGrillareaState;
const test_1 = require("@playwright/test");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const logger_1 = __importDefault(require("../utils/logger"));
const request_1 = require("../utils/request");
const env_1 = require("../utils/env");
async function run(params) {
    return await fetchCurrentGrillareaState(params);
}
async function fetchCurrentGrillareaState(params) {
    const browser = await test_1.chromium.launch({
        headless: env_1.isProd,
    });
    (0, request_1.sleep)(1000);
    const page = await browser.newPage();
    try {
        logger_1.default.log("Fetching https://mein.wien.gv.at/grillplatz");
        const results = [];
        for (const month of getMonthNamesInInterval(params.from, params.to)) {
            const areaResults = await checkAreas(params.areas, page, month);
            results.push(areaResults);
        }
        return results.flat();
    }
    catch (e) {
        logger_1.default.log("Error fetching grill areas", e);
        throw e;
    }
    finally {
        page.close();
    }
}
async function checkAreas(areas, page, month) {
    const { from, to } = datesForMonth(month);
    const grillPlatzReserveUrl = "https://mein.wien.gv.at/grillplatz/internet/Startseite.aspx";
    await page.goto(grillPlatzReserveUrl, {
        waitUntil: "networkidle",
    });
    await (0, request_1.sleep)();
    const rows = await page.$$("#BuchbareGrillplaetze_grpGrid_gdResult > tbody > tr");
    rows.shift();
    for (const area of rows) {
        const areaRow = await area.$$("td");
        const areaCheckbox = await areaRow[0].$("input");
        if (!areaCheckbox) {
            logger_1.default.error("No checkbox found for area");
            continue;
        }
        const areaNumber = Number(await areaRow[1].innerText());
        if (areas.includes(areaNumber)) {
            await areaCheckbox.click();
        }
    }
    await (0, request_1.sleep)();
    const selectAreasButtonId = "#btngroupBottom_cmdSelectGrillplatz_input";
    const selectAreas = await page.$(selectAreasButtonId);
    if (!selectAreas) {
        throw new Error("No select areas button found");
    }
    await selectAreas.click();
    await page.waitForLoadState("networkidle");
    await (0, request_1.sleep)();
    const startDateId = "#Groupofcontrols1_txtDatumVon_input";
    const startDateElement = await page.$(startDateId);
    if (!startDateElement) {
        throw new Error("No start date element found");
    }
    await fillDate(startDateElement, from);
    const endDateId = "#Groupofcontrols1_txtDatumBis_input";
    const endDateElement = await page.$(endDateId);
    if (!endDateElement) {
        throw new Error("No end date element found");
    }
    await fillDate(endDateElement, to);
    await (0, request_1.sleep)();
    const proceedButtonId = "#grp1_cmdWeiter_input";
    const proceedButton = await page.$(proceedButtonId);
    if (!proceedButton) {
        throw new Error("No proceed button found");
    }
    await proceedButton.click();
    await page.waitForLoadState("networkidle");
    const areaResults = await collectAreaResults(page);
    logger_1.default.log(`Found ${areaResults?.length ?? 0} results for interval: ${toString(from)} - ${toString(to)}`);
    return areaResults;
}
async function collectAreaResults(page) {
    await (0, request_1.sleep)();
    const areaOpts = await page.$$("#GroupGrillplatz_cboGrillplatz_input > option");
    await (0, request_1.sleep)();
    let results = [];
    for (const areaOptIdx of areaOpts.map((_, i) => i)) {
        await (0, request_1.sleep)();
        await page.waitForLoadState("networkidle");
        await (0, request_1.sleep)();
        const areaDropdownId = "#GroupGrillplatz_cboGrillplatz_input";
        const areaDropdown = await page.$(areaDropdownId);
        if (!areaDropdown) {
            throw new Error("No area dropdown found");
        }
        await areaDropdown.scrollIntoViewIfNeeded();
        await areaDropdown.click();
        await areaDropdown.selectOption({ index: areaOptIdx });
        const confirmButtonId = "#GroupGrillplatz_cmdGrillplatz_input";
        const confirmButton = await page.$(confirmButtonId);
        if (!confirmButton) {
            throw new Error("No confirm button found");
        }
        await confirmButton.click();
        await page.waitForLoadState("networkidle");
        await (0, request_1.sleep)();
        // get name of area
        const selectedArea = await text(page.$("#GroupGrillplatz_cboGrillplatz_input > option[selected='selected']"));
        await (0, request_1.sleep)();
        const calenderTable = await page.$("#GroupKalender_calH");
        if (!calenderTable) {
            throw new Error("No calender table found");
        }
        const days = await calenderTable.$$("tbody > tr > td > a[style*='color:Black']");
        const { areaNumber } = splitIntoNumAndLocation(selectedArea);
        const daysArr = await Promise.all(days.map(async (day) => {
            const title = await day.getAttribute("title");
            if (!title) {
                throw new Error("No title found for day");
            }
            return { id: areaNumber, day: toDate(title), area: areaNumber };
        }));
        results = results.concat(daysArr);
    }
    return results;
}
const fillDate = async (dateElement, targetDate) => {
    await dateElement.scrollIntoViewIfNeeded();
    await dateElement.click();
    await dateElement.fill("");
    await dateElement.type(toString(targetDate));
    await dateElement.press("Enter", { delay: 100 });
};
const toDate = (dayStr) => {
    const parsedDay = (0, date_fns_1.parse)(dayStr, "dd. LLLL", 0, { locale: locale_1.de });
    parsedDay.setFullYear(2024);
    return parsedDay;
};
const splitIntoNumAndLocation = (str) => {
    const [areaNumber, location] = str.split("(");
    return {
        areaNumber: Number(areaNumber.slice(6).trim()),
        location: location.trim().replace(")", ""),
    };
};
const numOfDaysAvailable = (str) => {
    const splitStr = str.split("möglich");
    const extractedDays = splitStr[0]
        ? splitStr[0].match(/\d+|\./g)?.join("")
        : "";
    if (extractedDays?.includes("2024")) {
        return 1;
    }
    return Number(extractedDays);
};
const text = async (promise) => promise.then((el) => el?.innerText());
const toString = (date) => (0, date_fns_1.format)(date, "dd.MM.yyyy", { locale: locale_1.de });
const groupBy = (array, key) => {
    return array.reduce((acc, item) => {
        (acc[item[key]] = acc[item[key]] || []).push(item);
        return acc;
    }, {});
};
const mergeResults = (results) => {
    const grouped = groupBy(results.flat(), "id");
    return Object.values(grouped).map((areaResults) => ({
        id: areaResults[0].id,
        days: areaResults.reduce((acc, curr) => [...acc, ...curr.days], []),
    }));
};
const datesForMonth = (month) => {
    const currentYear = new Date().getFullYear();
    const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
    ];
    const monthNumber = months.indexOf(month) + 1;
    const daysInMonth = new Date(currentYear, monthNumber, 0).getDate();
    return {
        from: new Date(`${currentYear}-${monthNumber}-01`),
        to: new Date(`${currentYear}-${monthNumber}-${daysInMonth}`),
    };
};
const padLeft = (str, length = 6, pad = " ") => {
    return str.length >= length ? str : padLeft(pad + str, length, pad);
};
const getMonthNamesInInterval = (start, end) => {
    const months = [];
    const date = new Date(start);
    const endDate = new Date(end);
    while (date <= endDate) {
        months.push(date.toLocaleString("default", { month: "long" }).toLowerCase());
        date.setMonth(date.getMonth() + 1);
    }
    return months;
};
