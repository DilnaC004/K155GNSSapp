# K155GNSSapp

How to set up development environment - https://reactnative.dev/docs/environment-setup

run project with - yarn start

packages:
yarn add react-native-vector-icons
yarn add react-native-ble-plx
npm i gps 
yarn add @react-native-async-storage/async-storage - https://react-native-async-storage.github.io/async-storage/docs/api
yarn add react-native-document-picker 
npm i react-native-fs

Notes:
Zuzka - původní apka

Je matoucí, že pro RTK je jedno tlačítko a pro statiku to spustím jedním a vypnu tím pro RTK. Bylo by lepší mít samostatnou stránku, kde by bylo ideální mít:
*tlačítko spuštění/vypnutí *volitelný časovač *pole pro zapsání výšky stroje a CB *pole pro název souboru (mohl by být *obecný a mohlo by se na jeho konec připojovat CB pro přehlednost...)

Taky by bylo fajn, kdyby to někde ukazovalo nejen seznam aktuálně chytaných satelitů, ale seznam všech satelitů co se během měření povedlo chytit a dobu kontinuálního měření na ně (ideálně graficky, jak to mají topcony). - NEBUDEME DĚLAT

Nepropisuje se zadaná výška stroje do rinexu. - VYŘEŠIT PŘES OMEZENI OKEN PRO ZAPSÁNÍ VÝŠKY ANTÉNY

Na některých telefonech padá ukládání při běhu apky na pozadí (žádné omezení v telefonu pro aplikace na pozadí nebylo a stejně se logování vypínalo). Nebo režim spánku/zhasnutý displej dělal problémy. Bylo by super nějaké varování při výpadku ukládání z libovolného důvodu (hlavně uvedené a ztrátu BT spojení). Mohlo by to na konci hodit hlášku s časem, jak dlouho to měřilo ten daný soubor.

Také nějak nastavit, aby to varovalo, když se neukládají správná data (problém s ukládáním jen nmea zpráv). - PŘIDAT OKNO s videlnými přijatými zprávy jako u SerialMonitoru

Zdenda - původní apka

vložení fazového centra
upravit zobrazení float fix s názvem
výběr ukládání cesty souborů
střední chyba průměru měření pří měření RTK, když se neměří tak to brát z NMEA zprávy

David

kod bodu

založka nastavení měření výška antény, fázové centrum,

nmea zprávy uložit v bluetooth záložky

Oprav vkládání bodů a její transformace do druhého SS

title: "Bod1", x: 1, y: 2, z: 3, b: 1, l: 2, h: 3, type: 1, // 0 - measured point, 1 - add point ofset: 0.5, antena: 1.5, date: "21.7.2023 19:26:36",
 
