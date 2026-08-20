import { Wine } from "@/types";

/**
 * This is now Valletti's REAL wine range, taken from the professional
 * bottle shots Niels shared (7 wines, two appellations):
 *
 *   - Dogliani Superiore DOCG "Coste di San Martino" (Dolcetto)
 *   - Dogliani Superiore DOCG "Vescu" (Dolcetto)
 *   - Dogliani DOCG "Pianezzo" (Dolcetto — named for the estate's home
 *     vineyard, matching the winery's own address)
 *   - Langhe DOC Nebbiolo (Nebbiolo)
 *   - Langhe DOC Barbera (Barbera)
 *   - Langhe DOC Barbera "Lurenzin" (Barbera)
 *   - Langhe DOC Bianco (100% Timorasso, confirmed by Roberto)
 *
 * What's REAL: names, appellations, cru names, grape (Dogliani DOCG and
 * Dogliani Superiore DOCG are by law 100% Dolcetto; Langhe Nebbiolo/
 * Barbera are named for their grape; Langhe Bianco is 100% Timorasso),
 * wine type, and the bottle photos. Wines are presented generically
 * (no vintage/year shown) rather than tied to one specific vintage.
 * What's STILL PLACEHOLDER: tasting notes, vineyard background story,
 * and pairing suggestions — all flagged below for Roberto to confirm or
 * rewrite in his own words.
 *
 * In production this comes from the Supabase `wines` table (see
 * /supabase/schema.sql) and is managed from /admin/wines, with narrative
 * text stored per-language in `wine_translations`. This prototype shows
 * English copy only to keep the demo content manageable.
 */
export const wines: Wine[] = [
  {
    id: "1",
    slug: "dogliani-superiore-coste-di-san-martino",
    name: "Dogliani Superiore — Coste di San Martino",
    type: "red",
    grapeVariety: "Dolcetto",
    vineyardName: "Coste di San Martino, Dogliani",
    vineyardDescription:
      "From the Coste di San Martino vineyard in Dogliani (CN), Piemonte — the heartland of Dolcetto, and the only place in Italy where this grape earns DOCG Superiore status. [Placeholder — Roberto to add detail on the plot: exposure, altitude, soil.]",
    grapeDescription:
      "100% Dolcetto, vinified to the stricter Dogliani Superiore standard, which requires lower yields and a minimum period of ageing before release — a world apart from simple, early-drinking Dolcetto.",
    plotSize: "[Placeholder — confirm plot size in hectares]",
    fermentation: "[Placeholder — Roberto to confirm: steel tank, controlled temperature]",
    maceration: "[Placeholder — Roberto to confirm maceration length]",
    agingVessel: "barrel",
    barrelSize: "500L (tonneau)",
    agingNotes: "[Placeholder — Roberto to confirm ageing period before release]",
    experienceDescription:
      "[Placeholder — Roberto to confirm tasting notes.] Deep ruby in the glass, with dark plum, violet and the characteristic bitter-almond note on the finish that's the signature of great Dolcetto di Dogliani. Fuller and more structured than most Dolcetto thanks to the Superiore ageing requirement.",
    pairingText:
      "Classic Piemontese fare — tajarin with ragù, braised meats, or hard mountain cheeses. Serve at 16–18°C.",
    abv: "14%",
    servingTemp: "16–18°C",
    imageUrl: "/wines/dogliani-superiore-coste-di-san-martino.jpg",
    featured: true,
  },
  {
    id: "2",
    slug: "dogliani-superiore-vescu",
    name: "Dogliani Superiore — Vescu",
    type: "red",
    grapeVariety: "Dolcetto",
    vineyardName: "Vescu, Dogliani",
    vineyardDescription:
      "From the Vescu vineyard in Dogliani — a separate cru from Coste di San Martino, giving Roberto two distinct expressions of Dogliani Superiore from the same estate. [Placeholder — Roberto to add what makes Vescu different: soil, exposure, age of vines.]",
    grapeDescription:
      "100% Dolcetto, vinified to Dogliani Superiore DOCG standard.",
    plotSize: "[Placeholder — confirm plot size in hectares]",
    fermentation: "[Placeholder — Roberto to confirm: steel tank, controlled temperature]",
    maceration: "[Placeholder — Roberto to confirm maceration length]",
    agingVessel: "barrel",
    barrelSize: "500L (tonneau)",
    agingNotes: "[Placeholder — Roberto to confirm ageing period before release]",
    experienceDescription:
      "[Placeholder — Roberto to add tasting notes for Vescu specifically, and how it compares to Coste di San Martino.]",
    pairingText: "[Placeholder — pairing suggestions to confirm.] Serve at 16–18°C.",
    abv: "14%",
    servingTemp: "16–18°C",
    imageUrl: "/wines/dogliani-superiore-vescu.jpg",
    featured: true,
  },
  {
    id: "3",
    slug: "dogliani-pianezzo",
    name: "Dogliani — Pianezzo",
    type: "red",
    grapeVariety: "Dolcetto",
    vineyardName: "Pianezzo MGA, Dogliani",
    vineyardDescription:
      "The Pianezzo MGA is part of the Dogliani DOCG, a high-altitude ridge at 420–600 meters above sea level, renowned for its fresh, deeply-fruited 100% Dolcetto wines. These chalky calcareous-clay soils are the continuation of the Serravallian ridge that extends south through the hills of Serralunga in Barolo, culminating in the hill of San Martino, below which sits Casa Valletti.",
    grapeDescription:
      "Dolcetto 100%, from 3 different vineyards blended after malolactic fermentation.",
    plotSize: "[Placeholder — total plot size in hectares not on Roberto's sheet; yield confirmed at 7 tons/ha across the 3 blended parcels]",
    altitude: "500 m s.l.m. (1640 ft)",
    trainingSystem: "Espalier with Guyot pruning system",
    cultivationMethod:
      "No systemic products are used and weed control is carried out mechanically.",
    harvestPeriod: "Mid-September",
    grapeYield: "7 tons per hectare (2.8 tons per acre)",
    vineyardParcels: [
      {
        exposure: "West",
        soil: "Formazione di Lequio (Serravalliano), clayey marl with silt, brown colour",
        averageAge: "15 years old",
      },
      {
        exposure: "East",
        soil: "Formazione di Lequio (Serravalliano), clayey marl with a part of silt and limestone, white colour",
        averageAge: "30 years old",
      },
      {
        exposure: "South-East",
        soil: "Formazione di Lequio (Serravalliano), lime marl with a small part of sand, white colour",
        averageAge: "25 years old",
      },
    ],
    unfiltered: true,
    fermentation:
      "Traditional method, fermentation of the grapes in contact with the skins, without added yeasts, for around 6–8 days in stainless steel tanks at 28°C (82.4°F).",
    maceration: "6–8 days on the skins, together with fermentation.",
    agingVessel: "steel",
    agingNotes: "8 months in stainless steel tanks, then 6 months in bottle.",
    experienceDescription:
      "[Placeholder — Roberto to confirm tasting notes.]",
    pairingText: "[Placeholder — pairing suggestions to confirm.]",
    abv: "[Placeholder — confirm alcohol %]",
    servingTemp: "[Placeholder — confirm serving temperature]",
    imageUrl: "/wines/dogliani-pianezzo.jpg",
    featured: true,
  },
  {
    id: "4",
    slug: "langhe-nebbiolo",
    name: "Langhe Nebbiolo",
    type: "red",
    grapeVariety: "Nebbiolo",
    vineyardName: "[Placeholder — confirm vineyard/plot name]",
    vineyardDescription:
      "[Placeholder — Roberto to describe the Nebbiolo vineyard: location, exposure, why it sits under Langhe DOC rather than Barolo/Barbaresco.]",
    grapeDescription: "100% Nebbiolo, Piemonte's most prized red grape.",
    plotSize: "[Placeholder — confirm plot size in hectares]",
    fermentation: "[Placeholder — Roberto to confirm: steel tank, controlled temperature]",
    maceration: "[Placeholder — Roberto to confirm maceration length]",
    agingVessel: "barrel",
    barrelSize: "225L (barrique)",
    agingNotes: "[Placeholder — Roberto to confirm ageing period before release]",
    experienceDescription:
      "[Placeholder — Roberto to add tasting notes: expect the classic Nebbiolo profile of red fruit, rose and firm tannin, in a more approachable Langhe style.]",
    pairingText: "[Placeholder — pairing suggestions to confirm.] Serve at 16–18°C.",
    abv: "14%",
    servingTemp: "16–18°C",
    imageUrl: "/wines/langhe-nebbiolo.jpg",
    featured: true,
  },
  {
    id: "5",
    slug: "langhe-barbera",
    name: "Langhe Barbera",
    type: "red",
    grapeVariety: "Barbera",
    vineyardName: "[Placeholder — confirm vineyard/plot name]",
    vineyardDescription:
      "[Placeholder — Roberto to describe the vineyard this Barbera comes from.]",
    grapeDescription: "100% Barbera, known for its bright acidity and dark-fruit character.",
    plotSize: "[Placeholder — confirm plot size in hectares]",
    fermentation: "[Placeholder — Roberto to confirm: steel tank, controlled temperature]",
    maceration: "[Placeholder — Roberto to confirm maceration length]",
    agingVessel: "steel",
    agingNotes: "[Placeholder — Roberto to confirm ageing period before release]",
    experienceDescription:
      "[Placeholder — Roberto to add tasting notes.]",
    pairingText: "[Placeholder — pairing suggestions to confirm.] Serve at 16°C.",
    abv: "13.5%",
    servingTemp: "16°C",
    imageUrl: "/wines/langhe-barbera.jpg",
    featured: false,
  },
  {
    id: "6",
    slug: "langhe-barbera-lurenzin",
    name: "Langhe Barbera — Lurenzin",
    type: "red",
    grapeVariety: "Barbera",
    vineyardName: "Lurenzin",
    vineyardDescription:
      "A single-vineyard Barbera from the Lurenzin plot — the estate's more structured take on Barbera, distinct from the standard Langhe Barbera bottling. [Placeholder — Roberto to add detail on the plot and how it differs.]",
    grapeDescription: "100% Barbera, vinified from the Lurenzin cru.",
    plotSize: "[Placeholder — confirm plot size in hectares]",
    fermentation: "[Placeholder — Roberto to confirm: steel tank, controlled temperature]",
    maceration: "[Placeholder — Roberto to confirm maceration length]",
    agingVessel: "barrel",
    barrelSize: "350L",
    agingNotes: "[Placeholder — Roberto to confirm ageing period before release]",
    experienceDescription: "[Placeholder — Roberto to add tasting notes specific to Lurenzin.]",
    pairingText: "[Placeholder — pairing suggestions to confirm.] Serve at 16–17°C.",
    abv: "14%",
    servingTemp: "16–17°C",
    imageUrl: "/wines/langhe-barbera-lurenzin.jpg",
    featured: false,
  },
  {
    id: "7",
    slug: "langhe-bianco",
    name: "Langhe Bianco",
    type: "white",
    grapeVariety: "Timorasso",
    vineyardName: "[Placeholder — confirm vineyard/plot name]",
    vineyardDescription:
      "[Placeholder — Roberto to describe the Timorasso vineyard: location, exposure, soil.]",
    grapeDescription:
      "100% Timorasso — a native Piemontese white grape prized for its ability to age, developing rich texture and honeyed, mineral notes over time.",
    plotSize: "[Placeholder — confirm plot size in hectares]",
    fermentation: "[Placeholder — Roberto to confirm: steel tank, controlled temperature]",
    maceration: "[Placeholder — Roberto to confirm — typically minimal/no skin contact for this white]",
    agingVessel: "steel",
    agingNotes: "[Placeholder — Roberto to confirm ageing period before release]",
    experienceDescription: "[Placeholder — Roberto to add tasting notes.]",
    pairingText: "[Placeholder — pairing suggestions to confirm.] Serve chilled at 8–10°C.",
    abv: "13%",
    servingTemp: "8–10°C",
    imageUrl: "/wines/langhe-bianco.jpg",
    featured: false,
  },
];

export function getWineBySlug(slug: string): Wine | undefined {
  return wines.find((w) => w.slug === slug);
}

export function getFeaturedWines(): Wine[] {
  return wines.filter((w) => w.featured);
}
