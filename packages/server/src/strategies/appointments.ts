import type { Runner } from "@cronny/types";
import { createLogger } from "../utils/logger.js";
import { Filter, matchDataFilter } from "../utils/filter.js";

const logger = createLogger("appointments");
const API_URL = "https://id-austria.info/api/appointments";

type Provider = "magistrate" | "police" | "finanzamt";
type ProviderFilter = Provider | "all";

export type AppointmentParams = {
  provider?: ProviderFilter;
  filters?: Filter<AppointmentResult>[];
};

export type AppointmentResult = {
  id: string;
  title: string;
  provider: Provider;
  locationId: string;
  locationName: string;
  locationAddress: string;
  district: string;
  forCitizens: boolean;
  forForeigners: boolean;
  appointmentTime: string;
  durationMinutes: number | null;
  url: string;
  status?: "active" | "filtered";
};

const titleFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Vienna",
  dateStyle: "short",
  timeStyle: "short",
});

function formatTitle(appointmentTime: string, locationName: string): string {
  const when = titleFormatter.format(new Date(appointmentTime));
  return `${when} — ${locationName}`;
}

type ApiAppointment = {
  id: string;
  provider: Provider;
  location_id: string;
  location_name: string;
  appointment_time: string;
  duration_minutes: number | null;
};

type ApiLocation = {
  provider: Provider;
  location_id: string;
  name: string;
  address: string;
  district: string;
  for_citizens: boolean;
  for_foreigners: boolean;
};

type ApiResponse = {
  appointments: ApiAppointment[];
  locations: ApiLocation[];
};

export const run: Runner<AppointmentParams, AppointmentResult> = async (
  params,
) => {
  const provider: ProviderFilter = params?.provider ?? "all";
  const filters = params?.filters;

  const res = await fetch(API_URL, {
    headers: {
      Accept: "*/*",
      Referer: "https://id-austria.info/",
    },
  });

  if (!res.ok) {
    throw new Error(
      `appointments API request failed: ${res.status} ${res.statusText}`,
    );
  }

  const data = (await res.json()) as ApiResponse;
  const locMap = new Map<string, ApiLocation>();
  for (const l of data.locations) {
    locMap.set(`${l.provider}:${l.location_id}`, l);
  }

  let results: AppointmentResult[] = data.appointments.map((a) => {
    const loc = locMap.get(`${a.provider}:${a.location_id}`);
    return {
      id: a.id,
      title: formatTitle(a.appointment_time, a.location_name),
      provider: a.provider,
      locationId: a.location_id,
      locationName: a.location_name,
      locationAddress: loc?.address ?? "",
      district: loc?.district ?? "",
      forCitizens: loc?.for_citizens ?? true,
      forForeigners: loc?.for_foreigners ?? false,
      appointmentTime: a.appointment_time,
      durationMinutes: a.duration_minutes,
      url: "https://id-austria.info/",
    };
  });

  if (provider !== "all") {
    results = results.filter((r) => r.provider === provider);
  }

  logger.info(`Found ${results.length} appointments for provider=${provider}`);

  if (!filters?.length) {
    return results.map((r) => ({ ...r, status: "active" }));
  }

  return results.map((r) => {
    const ok = filters.every((f) => {
      const m = matchDataFilter(r, f);
      return f.negate ? !m : m;
    });
    return { ...r, status: ok ? "active" : "filtered" };
  });
};
