import React from "react";
import { Text, Image, Linking } from "react-native";

export const TaskInfoText = {
    1:
        (
            <>
                <Text style={{ fontWeight: 'bold', fontSize: 18, padding: 10 }}>Obecné pokyny</Text>
                <Text>Podmínkou udělení zápočtu je absolvování všech sedmi (7) úloh a odevzdání technických zpráv, vždy podle požadavku vedoucího úlohy. Termín odevzdání úloh bude upřesněn v průběhu výuky.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Povinné vybavení pro skupinu</Text>
                <Text>  •	pásmo minimálně 20 m dlouhé</Text>
                <Text>  •	deštník</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 12, padding: 10 }}>Technické zprávy</Text>
                <Text>Technické zprávy se odevzdávají za měřickou četu v tištěné formě nebo po dohodě s vedoucím úlohy v elektronické podobě a musí obsahovat tyto náležitosti:</Text>
                <Text>  •	První stranu s popisovým polem.</Text>
                <Text>  •	Číslované stránky.</Text>
                <Text>  •	Stručný popis zadání.</Text>
                <Text>  •	Popis použitých postupů.</Text>
                <Text>  •	Informace o použitém technickém vybavení.</Text>
                <Text>  •	Informace kdy a za jakých podmínek bylo měření prováděno a jméno nebo jména měřičů.</Text>
                <Text>  •	Protokol o výpočtu, výsledky.</Text>
                <Text>  •	Údaje v technické zprávě musí být kompletní, aby bylo možno ověřit, že při měření nedošlo k překročení povolených tolerancí, že měření není zatíženo zjevnými hrubými chybami apod.</Text>
                <Text>  •	Závěr - slovní a kvalitativní hodnocení splnění úlohy.</Text>
                <Text>  •	Další přílohy (zápisníky, náčrty, výkresy, apod.).</Text>
                <Text>Je-li technická zpráva odevzdávána v elektronické podobě, názvy souborů musí být tvořeny následujícím způsobem (bez diakritiky písmeny malé abecedy):</Text>
                <Text>Technická zpráva, za skupinu:</Text>
                <Text>&lt;ID_skupiny&gt;&lt;označení_měřické_čety(1,2,3)&gt;_&lt;číslo_úlohy&gt;_tz.pdf</Text>
                <Text>Příloha:</Text>
                <Text>&lt;ID_skupiny&gt;&lt;označení_měřické_čety(1,2,3)&gt;_&lt;číslo_úlohy&gt;_priloha.&lt;přípona&gt;</Text>
                <Text>Není-li vyučujícím řečeno jinak, technické zprávy mohou být odevzdávány ve formátu PDF nebo Postscript (přípona .pdf nebo .ps).</Text>
                <Text>Odkaz na <Text style={{ color: 'blue' }} onPress={() => Linking.openURL('https://geo.fsv.cvut.cz/gwiki/155VGP_Výuka_v_terénu_Geodetické_přístroje')}>stránky předmětu</Text> pro úplnost.</Text>
            </>
        ),
    2:
        (
            <>
                <Text style={{ fontWeight: 'bold', fontSize: 18, padding: 10 }}>Trigonometrická nivelace</Text>
                <Text>Cílem úlohy je procvičení trigonometrické nivelace a následného zpracování dat na modelové zakázce.
                    Zadání úlohy je velmi stručné: Zadavatel zakázky požaduje výškové zaměření jím stabilizovaných bodů v prostoru osady Mariánská u Jáchymova. Poloha bodů je naznačena na obrázku</Text>
                <Image source={require('../Images/TaskInfo/Task1.png')} style={{ width: '100%', height: undefined, aspectRatio: 665/443, marginVertical: 10 }} />
                <Text>Během vypracování technické zprávy mějte na paměti, že technická zpráva se vypracovává pro zadavatele, stejně jako v reálné zakázce. Informace, které jsou potřeba pro vypracování technické zprávy a nejsou vám známy, si vymyslete.</Text>
                <Text>Další požadavky chápejte pouze jako požadavky vyučujících nikoliv zadavatele:</Text>
                <Text>  • Pro zaměření musí být použita trigonometrická nivelace s využitím trojpodstavcové
                    soupravy.</Text>
                <Text>  • Pro připojení pořadů na koncové body musí být použito jím dodané svislé měřítko
                    (odečítání výšky stroje na měřítku pod vodorovnou záměrou).</Text>
                <Text>  • Síť musí být připojena na právě jeden bod plošné nivelační sítě (PNS) (vyrovnání volné sítě).</Text>
                <Text>  •	V rámci sítě musí být určena i výška dalšího bodu PNS (pro kontrolu a pro zajištění neměnnosti výškového systému v případě zničení některého z bodů).</Text>
                <Text>  •	Výška žádného určovaného bodu nesmí záviset na jednou měřeném převýšení (na jednom
                    pořadu).</Text>
                <Text>  •	Každé převýšení musí být možno ověřit pomocí jiných měřených převýšení.</Text>
                <Text>  •	Výšky musí být určeny vyrovnáním. Minimální počet nadbytečných měření musí být 5.</Text>
                <Text>  •	Vyrovnání bude zjednodušeno, provede se průměrováním výšek vypočtených více způsoby.</Text>
                <Text>Požadavky na technickou zprávu (nad rámec obvyklého obsahu):</Text>
                <Text>  —	Přehledné zápisníky s vypočtenými převýšeními (kontrola tam a zpět).</Text>
                <Text>  —	Schematický zákres sítě a měřených převýšení.</Text>
                <Text>  —	Hodnocení přesnosti pomocí výškových uzávěrů.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Postup měření a zpracování</Text>
                <Text>Každá skupina změří vybraná převýšení tak, aby všechna měřená převýšení splňovala požadavky zadavatele a vyučujících. Během měření je třeba postupovat pečlivě pro dosažení maximální přesnosti.</Text>
                <Text>Před nástupem k úloze musí mít skupina rozmyšleno následující:</Text>
                <Text>  •	Na jaké body PNS bude síť připojena (<Text style={{ color: 'blue' }} onPress={() => Linking.openURL('http://dataz.cuzk.cz')}>DATAZ ČÚZK</Text>).</Text>
                <Text>  •	Jaké pořady budou měřeny.</Text>
                <Text>  •	Jaké pořady budou měřeny.</Text>
                <Text>V případě, že potřebujete k rozvaze další informace, neváhejte kontaktovat předem vyučujícího. Údaje o bodech PNS naleznete na stránkách: <Text style={{ color: 'blue' }} onPress={() => Linking.openURL('http://nivelace.cuzk.cz')}>Nivelace ČÚZK</Text>.</Text>
            </>
        ),
    3:
        (
            <>
                <Text style={{ fontWeight: 'bold', fontSize: 18, padding: 10 }}>Určení součtové konstanty</Text>
                <Text>Cílem úlohy je polní zjištění součtové konstanty pro kombinace dvou hranolů (Leica Standard a Leica Mini) a dvou UET (Leica 1700 nebo Leica TC307 a Topcon GPT 7501). Úlohu provádí skupina samostatně, vyučující kontroluje průběh a výsledek měření. Požadavky:</Text>
                <Text>  •	Během měření je třeba postupovat pečlivě pro dosažení maximální přesnosti.</Text>
                <Text>  •	Zvolená základna musí obsahovat pět bodů, nabízí se možnost vyrovnání, ale neprovede se.</Text>
                <Text>  • Je třeba dbát na to, aby byla nastavena správná fyzikální korekce a nulová konstanta hranolu.</Text>
                <Text>  •	Výsledná součtová konstanta bude průměrem z vypočtených konstant.</Text>
                <Text>  •	Obsahem technické zprávy je i zápisník měřených vzdáleností v přehledné formě a tabulka opravených úseků 12, 13, 14, 15 pro všechny tři přístroje.</Text>
            </>
        ),
    4:
        (
            <>
                <Text style={{ fontWeight: 'bold', fontSize: 18, padding: 10 }}>Velmi přesná nivelace</Text>
                <Text>Zadání úlohy <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Velmi přesná nivelace</Text> je takřka totožné se zadáním úlohy <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Trigonometrická nivelace</Text>. V tomto případě ale zadavatel požaduje zaměření velmi přesnou nivelací (VPN) s použitím digitálního nivelačního přístroje Wild NA3003 nebo Leica DNA03 a páru invarových latí.</Text>
                <Text>Cílem úlohy je i srovnání výsledků s výsledky získanými pomocí trigonometrické nivelace a porovnání obou metod z hlediska přesnosti a náročnosti.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Postup měření</Text>
                <Text>Během měření je třeba dodržet následující pravidla pro velmi přesnou nivelaci:</Text>
                <Text>  •	Nivelační latě se staví na hřeby.</Text>
                <Text>  •	Každá přestává je předem rozměřena (pomocí pásma) a hřeby jsou vytlučeny tak, aby byla dodržena shodná délka záměr vpřed a vzad.</Text>
                <Text>  •	Každý nivelační oddíl se skládá ze sudého počtu přestav.</Text>
                <Text>  •	Maximální délka záměr 40 m.</Text>
                <Text>  •	Minimální výška záměr nad terénem je 80 cm, pro kratší záměry je možno minimální výšku úměrně snížit až na 40 cm.</Text>
                <Text>  •	Latě jsou pečlivě urovnávány do svislé polohy pomocí krabicové libely.</Text>
                <Text>  •	Rozdíl měřeného převýšení pořadu tam a zpět nesmí překročit hodnotu δ[mm] = 1.5√R [km]. (Pro ověření lze použít kalkulačku v aplikaci シ)</Text>
                <Text>V průběhu měření si členové skupiny postupně vymění pracovní pozice tak, aby každý změřil alespoň jeden nivelační oddíl.</Text>
            </>
        ),
    5:
        (
            <>
                <Text style={{ fontWeight: 'bold', fontSize: 18, padding: 10 }}>Vyhledání a zaměření podzemních vedení</Text>
                <Text>Cílem úlohy je zjištění, zaměření a následné vynesení průběhu podzemních vedení do technické mapy.</Text>
                <Text>Zjištění bude provedeno:</Text>
                <Text>  •	Vizuálně (vodovodní řád, kanalizace).</Text>
                <Text>  •	Pomocí indukčního vyhledávače (el. vedení 220 V).</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Postup měření</Text>
                <Text>Každá skupina má k dispozici vyhledávač podzemního vedení a vytištěný polohopisný plán uliční sítě osady Mariánská. Skupina kvalifikovaně určí průběh podzemních i nadzemních vedení a vyznačí tato do náčrtu. Měření polohy spočívá v oměrných, není nutné polohopisné měření.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Zpracování</Text>
                <Text>Výsledkem zpracování je technická zpráva obsahující navíc:</Text>
                <Text>  •	Měřický náčrt v papírové podobě (jeden za měřickou četu).</Text>
                <Text>  •	Přehled nalezených sítí, popis napojení apod.</Text>
            </>
        ),
    6:
        (
            <>
                <Text style={{ fontWeight: 'bold', fontSize: 18, padding: 10 }}>Laserové scannování</Text>
                <Text>Cílem úlohy je naskenovat laserovým skenerem zadaný objekt v osadě Mariánská, skenování zpracovat do podoby 3D modelu a výstupy v podobě stavebních výkresů. Úloha je prováděna pod vedením pedagoga.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Postup měření</Text>
                <Text>Dle typu objektu vyberte dvě až tři vhodná stanoviska a pořiďte měření laserovým skenerem. Spojení skenů se předpokládá přes identické body, neprobíhá tedy žádné klasické měření.</Text>
            </>
        ),
    7:
        (
            <>
                <Text style={{ fontWeight: 'bold', fontSize: 18, padding: 10 }}>Zaměření a vykreslení fasády budovy</Text>
                <Text>Cílem úlohy je zaměření a následné vykreslení fasády budovy (zadané vedoucím úlohy). Body na fasádě budovy budou zaměřeny univerzálním elektronickým teodolitem s bezhranolovým odrazem. Souřadnice bodů se počítají v místním systému a nebudou se připojovat na státní síť. Dosažené výsledné souřadnice je nutné zkontrolovat pomocí kontrolních oměrných pásmem. Před vykreslením je nutné souřadnice bodů fasády transformovat do jiného souřadného systému tak, aby body byly vynášeny jako průmět do svislé roviny procházející rozumně volenými body na fasádě. Jako dva nutné body pro transformaci je ideální volit dva spodní rohy budovy.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Měřický a výpočetní postup</Text>
                <Text>Měřická skupina si musí vhodně umístit stativ s UET. Vzdálenost od budovy musí být zvolena s ohledem na dosah dálkoměru, dále s ohledem na výšku budovy a možnost zaměření vyšších částí budovy. Následuje zaměření fasády pomocí UET s bezhranolovým dálkoměrem. Při volbě měřených bodů je nutné zamyslet se nad stupněm generalizace zaměřovaných detailů, které budou sloužit pro vykreslení. Při měření je nutné si vést pomocný náčrt.</Text>
                <Text>K urychlení měření a dosažení správných výsledků je při měření vhodné použít následujících pravidel:</Text>
                <Text>  •	Při měření rohových bodů je potřeba vzdálenost měřit směrem "dovnitř" budovy a úhel následně zaznamenávat na měřený bod. V případě nedodržení pravidla může být změřena vzdálenost na objekt, umístěný až za rohovým prvkem.</Text>
                <Text>  •	Při měření geometrických obrazců (okna dveře, římsy) se předpokládá vodorovnost a pravidelnost obrazců. Například při měření okna stačí měřit pouze dva body v úhlopříčce a okno dokonstruovat. Pravidlo je nutné porušit při viditelné nepravidelnosti měřeného prvku.</Text>
                <Text>Změřená data jsou z UET přenesena do PC. Po provedení transformace souřadnic je potřeba fasádu vykreslit ve vhodném programu. Pro vykreslení je stanovena norma uvedená na <Text style={{ color: 'blue' }} onPress={() => Linking.openURL('https://geo.fsv.cvut.cz/gwiki/155VGP_Výuka_v_terénu_Geodetické_přístroje')}>webové stránce Výuky</Text>.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Technická zpráva</Text>
                <Text>Technickou zprávu stačí odevzdávat v elektronické podobě ve formátech ps, pdf, doc. Při odevzdání technické zprávy je potřeba odevzdat i pomocný náčrt. Technická zpráva by měla navíc obsahovat následující:</Text>
                <Text>  •	Seznamy souřadnic</Text>
                <Text>  •	Výkres fasády (kresba + popisové pole)</Text>
                <Text>  •	Jako přílohu připojte: výkres v *.dgn a seznam souřadnic *.txt</Text>
            </>
        ),
    8:
        (
            <>
                <Text style={{ fontWeight: 'bold', fontSize: 18, padding: 10 }}>Globální navigační satelitní systémy</Text>
                <Text>Cílem úlohy GNSS je pomocí metody RTK (Real Time Kinematic):</Text>
                <Text>  1.	Vytyčit podle stavebního výkresu v S-JTSK půdorys stavby. </Text>
                <Text>  2.	V S-JTSK zaměřit uliční čáru (mezi Kpt. Nálepky a Čimickou ulicí)</Text>
                <Text>  3.	Určit výšky bodů z úlohy Velmi přesná nivelace</Text>
                <Text>Pro výpočet lokálního transformačního klíče WGS-84 → S-JTSK je třeba nejdříve zaměřit identické body. Vytyčený půdorys je poté kontrolně zaměřen univerzálním elektronickým teodolitem a proveden odhad přesnosti metody GNSS.</Text>
                <Text>Nutno podotknout, že GNSS není nejvhodnější metodou pro vytyčování. Cílem této úlohy je však přiblížit možnosti (statika, RTK) a nutné podklady (transformace ETRS →S-JTSK) pro měření s GNSS přijímači.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Měřický a výpočetní postup</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 12, padding: 10 }}>Zaměření identických bodů</Text>
                <Text>Pro měřické práce se skupina rozdělí na třetiny. Každá tato měřická četa vyhledá v okolí tábora minimálně jeden bod o známých souřadnicích v S-JTSK a zaměří je rychlou statickou metodou v systému WGS-84 (minimální doba měřeni na bodě je 10 minut). Za celou skupinu body vybírejte tak, aby byly pokud možno rovnoměrně rozmístěny kolem tábora a aby na nich šlo měřit pomoci GPS (nezakryty výhled na oblohu).</Text>
                <Text>Souřadnice identických bodů v systému S-JTSK naleznete např. na stránkách: <Text style={{ color: 'blue' }} onPress={() => Linking.openURL('http://dataz.cuzk.cz')}>DATAZ ČÚZK</Text>. Při měření se vysílačkou vždy domluvte s ostatními četami tak, abyste měřili současně s minimálně jednou četou na jiném bodě a to po dobu minimálně 10 minut. Kromě základny vztažené k referenční stanici umístěné v táboře tak vznikne i základna mezi těmito body.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 12, padding: 10 }}>Zpracování statické metody</Text>
                <Text>Po návratu do tábora zpracujte za celou skupinu společně všechny možné základny pomoci programu Leica Geo Office. Jako pevný bod v systému ETRS (blízký WGS-84) použijte data stanic v síti CZEPOS http://czepos.cuzk.cz nebo jakýkoliv bod statní sítě se známými souřadnicemi v systému ETRS. Vytvořte dva textové soubory se souřadnicemi identických bodů (tyto soubory se následně nahraji do GPS kontrolerů). Vámi měřené identické body doplňte body z <Text style={{ color: 'blue' }} onPress={() => Linking.openURL('http://dataz.cuzk.cz')}>DATAZu</Text> na minimální počet 6.</Text>
                <Text>Formát textových souborů:</Text>
                <Text>  1.  sourKlicJTSK.txt (na každém řádku číslo bodu s předponou K a souřadnice v metrech odděleny čárkou, bez mezer):</Text>
                <Text>K1,souřadnice X, souřadnice Y, výška</Text>
                <Text>  2.  sourKlicWGS.txt (na každém řádku číslo bodu s předponou W a zeměpisné souřadnice ve formátu DD.MMSSSSSS – DD stupně, MM minuty, SS sekundy):</Text>
                <Text>W1,zeměpisná šířka,zeměpisná délka,elipsoidická výška</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 12, padding: 10 }}>Příprava vytyčovaných souřadnic půdorysu stavby</Text>
                <Text>Před vytyčováním je třeba ze stavebního výkresu ve formátu .dgn sejmout souřadnice vytyčovaných bodů v S-JTSK a nahrát je do paměti GNSS přijímače.</Text>
                <Text>Formát textového souboru s vytyčovanými souřadnicemi – vytyceniJTSK.txt (na každém řádku číslo bodu a souřadnice v metrech odděleny čárkou):</Text>
                <Text>1, souřadnice, souřadnice, výška</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 12, padding: 10 }}>Vytyčení metodou RTK</Text>
                <Text>Nejdříve je třeba do GPS kontrolerů nahrát tři výše zmíněné textové soubory. Pomoci prvních dvou provést (v Menu MER – Lokalizace) transformaci WGS→S-JTSK (od té doby se GPSka tváři, že měří v SJTSK).</Text>
                <Text>Dále se dle pokynů vyučujícího připojit na zvolenou referenční stanici (CZEPOS nebo vlastní v táboře) a dále provádět měření RTK.</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 12, padding: 10 }}>Kontrolní zaměření a odhad přesnosti vytyčení</Text>
                <Text>Transformace s vyrovnáním proveďte odhad přesnosti metody GNSS. Jako identické body do výpočtu vstupují souřadnice vytyčovaných bodů (1. systém - souřadnice ze stavebního výkresu, 2. systém - souřadnice v místním systému, vzniklém zaměřením univerzálním elektronickým teodolitem).</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>Technická zpráva</Text>
                <Text>Výsledkem je technická zpráva, kterou vypracuje a odevzdá každá skupina samostatně. Technická zpráva navíc obsahuje:</Text>
                <Text>  • protokol o zpracování základen a vyrovnání sítě WGS-84</Text>
                <Text>  • souřadnice identických bodů pro transformaci ETRS → S-JTSK</Text>
                <Text>  • seznam vytyčovaných bodů</Text>
                <Text>  • protokol o výpočtu Helmertovy transformace s vyrovnáním a odhad přesnosti metody GNSS</Text>
                <Text>  • výkres uliční čáry s podkladovou ortofotomapou</Text>
                <Text>  • tabulku porovnávající výšky změřené pomocí GNSS a VPN</Text>
            </>
        ),
};