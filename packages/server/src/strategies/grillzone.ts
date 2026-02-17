import type { Runner } from "@cronny/types";
import { ElementHandle, Page, chromium } from "@playwright/test";
import { format, parse, startOfTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import { isProd } from "../utils/env.js";
import { createLogger } from "../utils/logger.js";
import { sleep } from "../utils/request.js";

const logger = createLogger("grillzone");

type GrillAreaParams = {
  from: Date;
  to: Date;
  areas: number[];
};

export const run: Runner<GrillAreaParams, any> = async (params) => {
  const data = await fetchCurrentGrillareaState(adjustParams(params));
  return data;
};

const adjustParams = (params: GrillAreaParams | null): GrillAreaParams => {
  if (!params) {
    throw new Error("No params provided");
  }

  const tomorrow = startOfTomorrow();

  if (new Date(params.from) < tomorrow) {
    logger.warn("From date is in the past, adjusting to tomorrow");
    params.from = tomorrow;
  }

  return params;
};

export async function fetchCurrentGrillareaState(params: GrillAreaParams) {
  const browser = await chromium.launch({
    headless: isProd,
  });
  await sleep(1000);

  const page = await browser.newPage();
  try {
    logger.debug("Fetching https://mein.wien.gv.at/grillplatz");
    const results = [];

    for (const month of getMonthNamesInInterval(params.from, params.to)) {
      const areaResults = await checkAreas(params.areas, page, month);
      results.push(areaResults);
    }
    return results.flat();
  } catch (e) {
    logger.error("Error fetching grill areas", e);
    throw e;
  } finally {
    await page.close();
    await browser.close();
  }
}

async function checkAreas(areas: number[], page: Page, month: string) {
  const { from, to } = datesForMonth(month);
  const grillPlatzReserveUrl =
    "https://mein.wien.gv.at/grillplatz/internet/Startseite.aspx";
  await page.goto(grillPlatzReserveUrl, {
    waitUntil: "networkidle",
  });

  await sleep();
  const rows = await page.$$(
    "#BuchbareGrillplaetze_grpGrid_gdResult > tbody > tr"
  );
  rows.shift();
  for (const area of rows) {
    const areaRow = await area.$$("td");
    const areaCheckbox = await areaRow[0].$("input");

    if (!areaCheckbox) {
      logger.error("No checkbox found for area");
      continue;
    }

    const areaNumber = Number(await areaRow[1].innerText());
    if (areas.includes(areaNumber)) {
      await areaCheckbox.click();
    }
  }

  await sleep();
  const selectAreasButtonId = "#btngroupBottom_cmdSelectGrillplatz_input";
  const selectAreas = await page.$(selectAreasButtonId);

  if (!selectAreas) {
    throw new Error("No select areas button found");
  }

  await selectAreas.click();
  await page.waitForLoadState("networkidle");

  await sleep();
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

  await sleep();
  const proceedButtonId = "#grp1_cmdWeiter_input";
  const proceedButton = await page.$(proceedButtonId);

  if (!proceedButton) {
    throw new Error("No proceed button found");
  }

  await proceedButton.click();
  await page.waitForLoadState("networkidle");

  const areaResults = await collectAreaResults(page);

  logger.info(
    `Found ${areaResults?.length ?? 0} results for interval: ${toString(
      from
    )} - ${toString(to)}`
  );

  return areaResults;
}

async function collectAreaResults(page: Page) {
  await sleep();
  const areaOpts = await page.$$(
    "#GroupGrillplatz_cboGrillplatz_input > option"
  );
  await sleep();

  let results: any[] = [];
  for (const areaOptIdx of areaOpts.map((_, i) => i)) {
    await sleep();
    await page.waitForLoadState("networkidle");
    await sleep();

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

    await sleep();
    // get name of area
    const selectedArea = await text(
      page.$(
        "#GroupGrillplatz_cboGrillplatz_input > option[selected='selected']"
      )
    );
    await sleep();

    const calenderTable = await page.$("#GroupKalender_calH");

    if (!calenderTable) {
      throw new Error("No calender table found");
    }

    const days = await calenderTable.$$(
      "tbody > tr > td > a[style*='color:Black']"
    );

    const { areaNumber } = splitIntoNumAndLocation(selectedArea);

    const daysArr = await Promise.all(
      days.map(async (day) => {
        const title = await day.getAttribute("title");

        if (!title) {
          throw new Error("No title found for day");
        }

        return { id: areaNumber, day: toDate(title), area: areaNumber };
      })
    );

    results = results.concat(daysArr);
  }

  return results;
}

const fillDate = async (dateElement: ElementHandle, targetDate: Date) => {
  await dateElement.scrollIntoViewIfNeeded();
  await dateElement.click();
  await dateElement.fill("");
  await dateElement.type(toString(targetDate));
  await dateElement.press("Enter", { delay: 100 });
};

const toDate = (dayStr: string) => {
  const parsedDay = parse(dayStr, "dd. LLLL", 0, { locale: de });
  parsedDay.setFullYear(new Date().getFullYear());

  return parsedDay;
};

const splitIntoNumAndLocation = (str: string) => {
  const [areaNumber, location] = str.split("(");
  return {
    areaNumber: Number(areaNumber.slice(6).trim()),
    location: location.trim().replace(")", ""),
  };
};

const text = async (promise: Promise<any>) =>
  promise.then((el) => el?.innerText());

const toString = (date: Date) => format(date, "dd.MM.yyyy", { locale: de });

const datesForMonth = (month: string) => {
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

const getMonthNamesInInterval = (start: Date, end: Date) => {
  const months: string[] = [];

  const date = new Date(start);
  const endDate = new Date(end);

  while (date <= endDate) {
    months.push(
      date.toLocaleString("default", { month: "long" }).toLowerCase()
    );
    date.setMonth(date.getMonth() + 1);
  }
  return months;
};
