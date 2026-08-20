import { Retailer } from "@/types";

/** PLACEHOLDER DATA — managed from /admin/retailers in production. */
export const retailers: Retailer[] = [
  {
    id: "1",
    name: "Enoteca Regionale del Piemonte",
    type: "shop",
    region: "Piemonte",
    country: "Italy",
    website: "https://example.com",
  },
  {
    id: "2",
    name: "Vinotheek De Kelder",
    type: "shop",
    region: "North Holland",
    country: "Netherlands",
    website: "https://example.com",
  },
  {
    id: "3",
    name: "Weinhandel Schmidt",
    type: "shop",
    region: "Bavaria",
    country: "Germany",
    website: "https://example.com",
  },
  {
    id: "4",
    name: "Cave à Vin Lumière",
    type: "shop",
    region: "Île-de-France",
    country: "France",
    website: "https://example.com",
  },
  {
    id: "5",
    name: "Ristorante La Terrazza",
    type: "restaurant",
    region: "Piemonte",
    country: "Italy",
  },
  {
    id: "6",
    name: "Alpine Fine Wine Imports",
    type: "importer",
    region: "Nationwide",
    country: "Germany",
    website: "https://example.com",
  },
];
