export const expectedResults = [
  {
    id: "14581449",
    title:
      "| ERSTBEZUG | 2 ZIMMER | 3. OG | DRESDNER STRASSE | UNWEIT TECHNIKUM WIEN | AB FEBRUAR",
    price: 935,
    size: 5312,
    url: "https://immobilien.derstandard.at/detail/14581449",
    address: "1200 Wien, Dresdner Straße",
    coordinates: null,
    rooms: 2,
    status: "filtered",
  },
  {
    id: "14595199",
    title: "NETTE FAMILIENWOHNUNG PRATERNÄHE WG NICHT MÖGLICH",
    price: 1080,
    size: 8722,
    url: "https://immobilien.derstandard.at/detail/14595199",
    address: "1020 Wien, Prater",
    coordinates: null,
    rooms: 3,
    status: "active",
  },
  {
    id: "14611916",
    title:
      "Gemütliche und zentral gelegene 2 Zimmer Wohnung ab sofort verfügbar",
    price: 990,
    size: 56,
    url: "https://immobilien.derstandard.at/detail/14611916",
    address: "1020 Wien, Leopold Moses Gasse 4",
    coordinates: null,
    rooms: 2,
    status: "active",
  },
  {
    id: "14610239",
    title: "Helle 2-Zimmerwohnung nahe dem WU Campus und Wiener Prater",
    price: 1099.77,
    size: 5114,
    url: "https://immobilien.derstandard.at/detail/14610239",
    address: "1020 Wien, Ausstellungsstraße",
    coordinates: null,
    rooms: 2,
    status: "active",
  },
  {
    id: "14609852",
    title:
      '70 m² Wohnung (Warmmiete) ,top Lage: U-Bahn-Station "Taborstraße" bzw nähe Praterstern und Augarten',
    price: 1260,
    size: 70,
    url: "https://immobilien.derstandard.at/detail/14609852",
    address: "1020 Wien, Vereinsgasse 8",
    coordinates: null,
    rooms: 3,
    status: "active",
  },
  {
    id: "14606644",
    title: "Charmante Altbauwohnung nahe Prater und Donaukanal zu vermieten",
    price: 1282,
    size: 79,
    url: "https://immobilien.derstandard.at/detail/14606644",
    address: "1020 Wien, Hofenedergasse",
    coordinates: null,
    rooms: 2,
    status: "active",
  },
];

import fs from "fs";
import path from "path";
export const rawResults = fs.readFileSync(
  path.resolve(__dirname, "./standard.html"),
  "utf8"
);
