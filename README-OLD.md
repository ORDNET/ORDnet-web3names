# ORD/Poker v1 — inscription-ready web MVP

Deze map bevat een clean-room pokerclient die als één HTML-bestand kan worden ingeschreven, plus een optionele stateless WebSocket-relay voor cross-device kamers.

## Bestanden

- `ord-poker-v1.html` — de volledige client; geen externe fonts, afbeeldingen of JavaScriptbibliotheken.
- `server.js` — optionele WebSocket room relay; geen wallet, custody, game engine of database.
- `package.json` — Node.js dependency op `ws`.
- `preview-lobby.png` en `preview-table.png` — lokale screenshots van de build.

## Wat werkt nu

- Professionele responsive lobby en pokertafel in de ORD/app-vormtaal.
- Texas Hold’em practice voor 2–6 seats met testchips.
- Blinds, fold/check/call/raise/all-in, bots, showdown, side-potberekening en een 7-card evaluator.
- SHA-256 hash-chain per hand.
- Shuffle commit vóór de hand; reveal pas nadat de hand is afgelopen.
- Export en verificatie van een JSON proof bundle.
- `BroadcastChannel`-kamers tussen tabs op dezelfde origin.
- Configureerbare WebSocket-relay voor verschillende apparaten.
- Room chat en host-authoritative multiplayer-MVP.
- Detectie van een compatible `window.ordnet` / ORD/plug wallet.
- Optionele 1-sat proof marker via de walletplugin.
- Geen WIF, seed of private key in de HTML of localStorage.

## Wat nog niet als real-money poker mag worden gebruikt

De remote room in v1 is host-authoritative: de host draait de engine en kent de kaarten. Daardoor is deze modus geschikt voor UI-, netwerk- en speltests, maar niet voor inzetten met echte BSV.

Voor real-money productie zijn ten minste nodig:

1. dealerless commutative-encryption dealing of een aantoonbaar gelijkwaardig protocol;
2. ondertekende, table/hand/seat-bound netwerkframes en replaybescherming;
3. BSV multisig/n-of-n funding, cooperative settlement en vooraf ondertekende recovery;
4. SPV/miner-first-seen verificatie;
5. reconnect-, timeout-, disconnect- en dispute flows;
6. onafhankelijke cryptografische en transactionele audit.

De repository `prof-faustus/bsv-poker` is proprietary / all rights reserved. Deze build kopieert daarom geen broncode; hij implementeert een eigen browser-MVP op basis van publiek beschreven architectuurconcepten. Voor het rechtstreeks gebruiken of naar WebAssembly compileren van de originele core is schriftelijke toestemming van de rechthebbende nodig.

## Is `server.js` nodig?

Niet voor:

- practice tegen bots;
- een ingeschreven single-player client;
- tab-to-tab tests op dezelfde origin via `BroadcastChannel`;
- proof export en verificatie.

Wel praktisch voor:

- spelers op verschillende computers of netwerken;
- room discovery en aanwezigheid;
- betrouwbare cross-device message delivery.

De relay is niet trusted voor geld of kaarten. Hij stuurt JSON-berichten door en bewaart geen table state. Een latere WebRTC-versie kan de relay reduceren tot signalling, maar voor bereikbaarheid is meestal nog steeds een signalling/STUN/TURN-laag nodig.

## Relay installeren

```bash
cd ord-poker-v1
npm install
PORT=8080 ALLOWED_ORIGINS='https://jouw-inscription-origin.example' npm start
```

Voor ontwikkeling kan `ALLOWED_ORIGINS='*'` worden gebruikt. In productie hoort dit beperkt te worden tot de origins waarop de inscription wordt weergegeven.

Belangrijke variabelen:

```text
PORT=8080
HOST=0.0.0.0
WS_PATH=/poker
ALLOWED_ORIGINS=https://browser.ordnet.io,https://ord-rtr-bsv.com
MAX_ROOM_CLIENTS=12
MAX_MESSAGE_BYTES=65536
RATE_MAX_MESSAGES=80
IDLE_ROOM_TTL_MS=1800000
```

### HTTPS / WSS

Wanneer de ingeschreven HTML via HTTPS draait, moet de relay met `wss://` worden benaderd. Zet Node achter Caddy, Nginx of een andere TLS reverse proxy.

Voorbeeld Caddyfile:

```caddy
poker.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Voer daarna in de app bij **Settings → WebSocket relay** in:

```text
wss://poker.example.com/poker
```

## Inschrijving

Inscribe uitsluitend `ord-poker-v1.html` als `text/html;charset=utf-8`. Het bestand bevat geen hardcoded relayverplichting. De eindgebruiker kan later een relay invullen of een URL gebruiken zoals:

```text
?room=TABLE42&relay=wss%3A%2F%2Fpoker.example.com%2Fpoker
```

Daardoor blijft de client immutable, terwijl het transportendpoint vervangbaar blijft.

## Walletgrens

De client slaat geen private keys op. De enige ingebouwde walletactie is een optionele, expliciet goed te keuren 1-sat marker met de proof root als reference. Dit is geen escrow, geen inscription van de volledige proof en geen bewijs dat een pokerpot veilig is afgehandeld.

## Testen

```bash
npm run check
```

Open de HTML in een moderne browser. Voor `BroadcastChannel` test je bij voorkeur vanaf dezelfde HTTPS-origin of een lokale webserver; twee losse `file://`-vensters gedragen zich per browser verschillend.
