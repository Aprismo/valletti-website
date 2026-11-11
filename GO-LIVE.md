# GO-LIVE — Valletti

Tjekliste til at sætte siden i drift på Robertos egne konti. Alt
oprettes nyt og separat fra Aprisom/Aprismo (se `../CLAUDE.md`).
Kodebranchen er `produktion-klar`.

## 1. Supabase (Robertos konto)

1. **Opret projekt.** Vælg en EU-region (fx Frankfurt). Gem
   databasens password et sikkert sted.
2. **Kør skemaet.** SQL Editor → New query → indsæt hele
   `supabase/schema.sql` → Run. Det opretter tabeller, row-level
   security, storage-bucket'en `media` (offentlig læsning) og dens
   upload-/sletteregler.
3. **Indlæs startindhold.** Ny query → indsæt hele `supabase/seed.sql`
   → Run. Det indlæser de 7 vine, billedbiblioteket, sidebilleder,
   åbningstider og designprofilen (navn, farver, adresse). Forhandlere
   og lukkeperioder er bevidst tomme, fordi dem i `/data` er
   pladsholdere. De oprettes i admin.
4. **Tjek bucket'en.** Storage → `media` skal findes og stå som
   *Public*. Hvis trin 2 ikke kunne oprette den: opret den manuelt med
   navnet `media`, slå *Public bucket* til, og kør de fire
   `create policy … on storage.objects`-linjer nederst i `schema.sql`
   igen.
5. **Slå offentlig tilmelding FRA (vigtigt).** Authentication → Sign In
   / Providers → slå **"Allow new users to sign up"** fra. Ellers kan
   alle med den offentlige nøgle oprette en bruger og redigere siden,
   fordi alle indloggede brugere har skriveadgang.
6. **Opret admin-brugeren.** Authentication → Users → Add user →
   Create new user: Robertos e-mail og et stærkt password, sæt
   flueben i **Auto Confirm User**.
7. **URL-konfiguration.** Authentication → URL Configuration → Site
   URL = `https://<robertos-domæne>`.
8. **Hent nøglerne.** Project Settings → API: kopiér *Project URL* og
   *anon/publishable key* til Vercel (se trin 3). Brug **ikke**
   service_role/secret-nøglen.

## 2. Resend (Robertos konto)

1. Domains → Add domain → Robertos domæne. Læg de viste DNS-records
   (SPF/DKIM) ind hos domæneudbyderen, og vent til domænet står som
   *Verified*.
2. API Keys → Create API key (Sending access).

## 3. Vercel (Robertos konto)

1. **Importér repoet** (branch `produktion-klar`, eller `main` når den
   er merget). Framework: Next.js, ingen ændringer i build-indstillinger.
   Bemærk: repoet ligger i dag under GitHub-organisationen *Aprismo*.
   Hvis Robertos Vercel ikke skal kobles til den organisation, så
   overfør eller kopiér repoet til en GitHub-konto, der er hans, først.
2. **Miljøvariabler** (Settings → Environment Variables, Production):

   | Navn | Værdi |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
   | `RESEND_API_KEY` | Resend API key |
   | `CONTACT_NOTIFY_EMAIL` | Indbakken der skal modtage henvendelser (fx `info@vallettigiacinto.it`) |
   | `CONTACT_FROM_EMAIL` | Afsender på det verificerede domæne, fx `Valletti <noreply@robertos-domæne>` |

   `NEXT_PUBLIC_*`-værdierne bygges ind ved build. Hvis du ændrer dem,
   skal du lave en ny deploy (Redeploy).
3. **Deploy**, og tilføj derefter domænet under Settings → Domains
   (DNS hos domæneudbyderen efter Vercels anvisning).
4. Den lokale mappe `.vercel/` peger på et **eksisterende** Vercel-projekt
   (ikke Robertos). Hvis du deployer med `vercel`-CLI'en herfra, så slet
   mappen og kør `vercel link` mod Robertos konto først.

## 4. Test efter deploy

- [ ] Forsiden og en vin-side vises på alle 5 sprog.
- [ ] `/admin` sender til `/admin/login`, og login med Robertos bruger virker.
- [ ] Ret en vin i admin → ændringen ses på den offentlige side efter genindlæsning.
- [ ] Upload et billede i Media Library → det vises (URL på `…supabase.co/storage/…`).
- [ ] Ret åbningstider og en farve i Design → ses på siden.
- [ ] Send kontaktformularen på `/en/visit` → mailen lander i `CONTACT_NOTIFY_EMAIL`, og "Svar" går til afsenderen.
- [ ] Log ud → `/admin` kræver login igen.
