import MATH from './MATH_helper';
import {dydx_grid} from './dydx_grid';
import { dh_grid } from './dh_grid';

export function etrs2jtsk(B, L, H_ellips) {
  if (
    B <= 51.1 &&
    B >= 48.4 &&
    L <= 19.5 &&
    L >= 12 &&
    H_ellips <= 1700 &&
    H_ellips >= 0
  ) {
    const S_jtsk05 = transform_etrs_jtsk05(B, L, H_ellips);
    const diff = interpolate_dydx(S_jtsk05);
    const dh = interpolate_dh(B, L);

    return {
      Y: S_jtsk05.y - diff.dY,
      X: S_jtsk05.x - diff.dX,
      Hbpv: H_ellips - dh,
    };
  } else{
    return {
      Y: 0,
      X: 0,
      Hbpv: 0,
    };
  }
}

export function interpolate_dydx(point) {
  // konfiguracni konstanty
  const rozestupX = 2000;
  const rozestupY = 2000;
  //

  const xMin =
    Math.floor(point.x / 1000) * 1000 -
    (rozestupX / 2) * (Math.floor(point.x / 1000) % 2);
  const yMin =
    Math.floor(point.y / 1000) * 1000 -
    (rozestupY / 2) * (Math.floor(point.y / 1000) % 2);

  // NALEZENI SPRAVNEHYCH RADKU TEXTAKU
  const nXMin = (xMin - 930000) / 2000;
  const radek = nXMin * 241 + 1 + (yMin - 428000) / 2000;



  let vv = get_dydx_data([radek, radek + 1, radek + 241, radek + 242]);



  let nYUp = vv.LH.dY + ((vv.RH.dY - vv.LH.dY) / rozestupY) * (point.y - yMin);
  let nYDown =
    vv.LD.dY + ((vv.RD.dY - vv.LD.dY) / rozestupY) * (point.y - yMin);

  let nXUp = vv.LH.dX + ((vv.RH.dX - vv.LH.dX) / rozestupY) * (point.y - yMin);
  let nXDown =
    vv.LD.dX + ((vv.RD.dX - vv.LD.dX) / rozestupY) * (point.y - yMin);

  let dY = nYDown + ((nYUp - nYDown) / rozestupX) * (point.x - xMin);
  let dX = nXDown + ((nXUp - nXDown) / rozestupX) * (point.x - xMin);


  return { dY: dY, dX: dX };
}

export function get_dydx_data(radky) {
  const nazvy = ["LD", "RD", "LH", "RH"];

  let data = new Object();

  nazvy.forEach((nazev, index) => {

    let radek_idx = radky[index]-1;
    let dydx_line_data = dydx_grid[radek_idx];

    data[nazev] = {
      Line: radky[index].toString(),
      Y: dydx_line_data[0],
      X: dydx_line_data[1],
      dY: dydx_line_data[2],
      dX: dydx_line_data[3],
    };
  });

  return data;
}

export function interpolate_dh(B, L) {
  // konfiguracni konstanty
  const rozestupB = 0.016666666666666666666666666666666666666666666666666666666;
  const rozestupL = 0.025;
  //

  const bMin = Math.floor((B - (B % rozestupB)) * 100000) / 100000;
  const lMin = Math.floor((L - (L % rozestupL)) * 100000) / 100000;

  // NALEZENI SPRAVNEHYCH RADKU TEXTAKU
  const nBMin = Math.round((bMin - 48.3) / rozestupB);
  const radek = nBMin * 306 + 1 + (lMin - 11.7) / rozestupL;

  const vv = get_dh_data([radek, radek + 1, radek + 306, radek + 307]);

  const dHh = vv.LH.dH + ((vv.RH.dH - vv.LH.dH) / rozestupL) * (L - lMin);
  const dDh = vv.LD.dH + ((vv.RD.dH - vv.LD.dH) / rozestupL) * (L - lMin);
  const dH = dDh + ((dHh - dDh) / rozestupB) * (B - bMin);

  return dH;
}

export function get_dh_data(radky) {
  const nazvy = ["LD", "RD", "LH", "RH"];
  let data = new Object();
  nazvy.forEach((nazev, index) => {
    // pricteni +1 kvuli indexaci radku
    radek_idx = radky[index] - 1;
    dH_line_data = dh_grid[radek_idx];
    data[nazev] = {
      Line: radky[index].toString(),
      Lat: dH_line_data[0],
      Lon: dH_line_data[1],
      dH: dH_line_data[2],
    };
  });

  return data;
}

export function transform_etrs_jtsk05(B, L, H) {
  // Vstupni koeficienty transformace -->
  const a_GRS80 = 6378137;
  const e2_GRS80 = 0.006694380022901;

  const a_Bessel = 6377397.155;
  const e2_Bessel = 0.00667437223062;

  const k1 = 0.9999;
  const f0 = 49 + 30 / 60;
  const s0 = 78 + 30 / 60;
  const alfa = Math.sqrt(
    1 + (e2_Bessel * Math.pow(MATH.cosd(49.5), 4)) / (1 - e2_Bessel)
  );
  const Uq = 59 + 42 / 60 + 42.69689 / 3600;
  const U0 = MATH.asind(MATH.sind(f0) / alfa);
  const e = Math.sqrt(e2_Bessel);
  const gf0 =
    ((1 + e * MATH.sind(f0)) / (1 - e * MATH.sind(f0))) ** ((alfa * e) / 2);
  const k = MATH.tand(U0 / 2 + 45) * MATH.cotd(f0 / 2 + 45) ** alfa * gf0;
  const n = MATH.sind(s0);
  const N0 =
    (a_Bessel * Math.sqrt(1 - e2_Bessel)) /
    (1 - e2_Bessel * MATH.sind(f0) ** 2);
  const ro0 = k1 * N0 * MATH.cotd(s0);


  // parametry helmertovy prostorove transformace GRS80 -> Bessel
  const T = { x: -572.203, y: -85.328, z: -461.934 }; // posuny
  const Q = 1 - 3.5393 * 10 ** -6; // meritko

  const pom = 206264.806;
  const r1 = 5.24832714 / pom;
  const r2 = 1.52900087 / pom;
  const r3 = 4.97311727 / pom;

  // <---

  // prevod elipsoidickych sour. na pravouhle
  const N = a_GRS80 / Math.sqrt(1 - e2_GRS80 * MATH.sind(B) ** 2);
  const X = (N + H) * MATH.cosd(B) * MATH.cosd(L);
  const Y = (N + H) * MATH.cosd(B) * MATH.sind(L);
  const Z = (N * (1 - e2_GRS80) + H) * MATH.sind(B);

  const S_etrf = { x: X, y: Y, z: Z };

  // helmertova 7-prvkova transformace
  //S_jtsk05 = T + Q*R*S_etrf;
  const S_jtsk05 = {
    x: T.x + Q * (S_etrf.x + r1 * S_etrf.y - r2 * S_etrf.z),
    y: T.y + Q * (-r1 * S_etrf.x + S_etrf.y + r3 * S_etrf.z),
    z: T.z + Q * (r2 * S_etrf.x - r3 * S_etrf.y + S_etrf.z),
  };

  // prevod pravouhlych sour. na elipsoidicke
  const LL = MATH.atand(S_jtsk05.y / S_jtsk05.x);
  let BB_old = 0;
  let BB_new = MATH.atand(
    (S_jtsk05.z / Math.sqrt(S_jtsk05.x ** 2 + S_jtsk05.y ** 2)) *
      (1 / (1 - e2_Bessel))
  );

  while (Math.abs(BB_new - BB_old) > 1 * 10 ** -12) {
    BB_old = BB_new;
    NN = a_Bessel / Math.sqrt(1 - e2_Bessel * MATH.sind(BB_old) ** 2);
    HH = Math.sqrt(S_jtsk05.x ** 2 + S_jtsk05.y ** 2) / MATH.cosd(BB_old) - NN;
    BB_new = MATH.atand(
      (S_jtsk05.z / Math.sqrt(S_jtsk05.x ** 2 + S_jtsk05.y ** 2)) *
        (1 - (NN * e2_Bessel) / (NN + HH)) ** -1
    );
  }

  const BB = BB_new;

  // Zobrazeni elipsoidu na kouli B,L -> U,dV
  const gB =
    ((1 + e * MATH.sind(BB)) / (1 - e * MATH.sind(BB))) ** ((alfa * e) / 2);
  const U =
    2 * (MATH.atand(k * MATH.tand(BB / 2 + 45) ** alfa * gB ** -1) - 45);
  const dV = alfa * (42.5 - (LL + 17 + 40 / 60));

  // Transformace ze zemepisnych souradnic na kartograficke
  const S = MATH.asind(
    MATH.cosd(90 - Uq) * MATH.sind(U) +
      MATH.sind(90 - Uq) * MATH.cosd(U) * MATH.cosd(dV)
  );
  const D = MATH.asind((MATH.cosd(U) * MATH.sind(dV)) / MATH.cosd(S));

  // polarni souradnice na plasti kuzelu
  const Epsilon = n * D;
  const ro = ro0 * MATH.tand(s0 / 2 + 45) ** n * MATH.cotd(S / 2 + 45) ** n;

  // priblizne rovinne souradnice S-JTSK/05
  const y = ro * MATH.sind(Epsilon);
  const x = ro * MATH.cosd(Epsilon);

  // bikubicka dotransformace
  const bicubic = bicub_dotr(x, y);

  return { y: y - bicubic.deltaY, x: x - bicubic.deltaX };
}

export function bicub_dotr(x, y) {
  const A1 = 0.2946529277 * 10 ** -1;
  const A2 = 0.2515965696 * 10 ** -1;
  const A3 = 0.1193845912 * 10 ** -6;
  const A4 = -0.4668270147 * 10 ** -6;
  const A5 = 0.9233980362 * 10 ** -11;
  const A6 = 0.1523735715 * 10 ** -11;
  const A7 = 0.1696780024 * 10 ** -17;
  const A8 = 0.4408314235 * 10 ** -17;
  const A9 = -0.8331083518 * 10 ** -23;
  const A10 = -0.3689471323 * 10 ** -23;

  const Xred = x - 1089000;
  const Yred = y - 654000;

  const dX =
    A1 +
    A3 * Xred -
    A4 * Yred +
    A5 * (Xred ** 2 - Yred ** 2) -
    A6 * (2 * Xred * Yred) +
    A7 * (Xred * (Xred ** 2 - 3 * Yred ** 2)) -
    A8 * (Yred * (3 * Xred ** 2 - Yred ** 2)) +
    A9 * (4 * Yred * Xred * (Xred ** 2 - Yred ** 2)) +
    A10 * (Xred ** 2 + Yred ** 2 - 6 * Xred ** 2 * Yred ** 2);

  const dY =
    A2 +
    A4 * Xred +
    A3 * Yred +
    A6 * (Xred ** 2 - Yred ** 2) +
    A5 * (2 * Xred * Yred) +
    A8 * (Xred * (Xred ** 2 - 3 * Yred ** 2)) +
    A7 * (Yred * (3 * Xred ** 2 - Yred ** 2)) -
    A10 * (4 * Yred * Xred * (Xred ** 2 - Yred ** 2)) +
    A9 * (Xred ** 2 + Yred ** 2 - 6 * Xred ** 2 * Yred ** 2);

  return {
    deltaY: dY,
    deltaX: dX,
  };
}

export function jtsk2etrs(Y, X, H_bpv) {
  /*
  Transformation S-JTSK coordinates to sferic coordinates B, L, H ETRS89 (ETRF2000)

  **reverse transformation to etrs2jtsk**

  Args:
      Y (float): Y S-JTSK [m]
      X (float): X S-JTSK [m]
      H (float): height Bpv [m]

  Returns:
      {
      B: ETRS89 latitude [deg] (float)
      L: ETRS89 longitude [deg] (float)
      H: Elipsoidal height [m] (float)
      }
   */
  if (
    Y <= 945650 &&
    Y >= 373500 &&
    X <= 1201640 &&
    X >= 967980 &&
    H_bpv <= 1700 &&
    H_bpv >= 0
  ){
    const A_GRS80 = 6378137;
    const E2_GRS80 = 0.006694380022901;

    const A_BESSEL = 6377397.155;
    const E2_BESSEL = 0.00667437223062;
    const E_BESSEL = Math.sqrt(E2_BESSEL);

    const RHO = Math.PI / 180;

    const S_0 = 78.5 * RHO;
    const Fi_0 = 49.5 * RHO;
    const n = Math.sin(S_0);

    const N_0 =
      (A_BESSEL * Math.sqrt(1 - E2_BESSEL)) /
      (1 - E2_BESSEL * Math.sin(Fi_0) ** 2);

    const Ro0 = 0.9999 * N_0 * (1 / Math.tan(S_0));
    const a_ = (90 - (59 + 42 / 60 + 42.69689 / 3600)) * RHO;
    const alfa = Math.sqrt(
      1 + (E2_BESSEL * Math.cos(Fi_0) ** 4) / (1 - E2_BESSEL),
    );
    const U_0 = Math.asin(Math.sin(Fi_0) / alfa);
    const k_ =
      Math.tan(U_0 / 2 + Math.PI / 4) *
      (1 / Math.tan(Fi_0 / 2 + Math.PI / 4)) ** alfa *
      ((1 + E_BESSEL * Math.sin(Fi_0)) / (1 - E_BESSEL * Math.sin(Fi_0))) **
        ((alfa * E_BESSEL) / 2);

    // Re-introduction of S-JTSK05->S-JTSK corrections

    const corrections = interpolate_dydx({x: X, y: Y});
    const Y05 = Y + corrections.dY;
    const X05 = X + corrections.dX;

    // Re-introduction of bicubic dotransformation
    const bicubic = bicub_dotr(X05, Y05);

    const Y_ = Y05 + bicubic.deltaY;
    const X_ = X05 + bicubic.deltaX;

    // Conversion from plane to cone shell
    const Ro = Math.sqrt(X_ ** 2 + Y_ ** 2);
    const Epsilon = Math.atan(Y_ / X_);

    // Conversion from a cone shell to a sphere (cartographic coordinates) -> S,D

    const D = Epsilon / Math.sin(S_0);
    const S =
      2 *
      (Math.atan((Ro0 / Ro) ** (1 / n) * Math.tan(S_0 / 2 + Math.PI / 4)) -
        Math.PI / 4);

    // Cartographic coordinates -> geographical coordinates -> U,V

    const U = Math.asin(
      Math.cos(a_) * Math.sin(S) - Math.sin(a_) * Math.cos(S) * Math.cos(D),
    );
    const dV = Math.asin((Math.cos(S) * Math.sin(D)) / Math.cos(U));

    // Sphere to Besseluv elipsoid -> B_bessel, L_Bessel

    const L_bessel = (24 + 50 / 60) * RHO - dV / alfa;

    let B_0 = 0;
    let B_i = U;

    while (Math.abs(B_0 - B_i) > 1e-15) {
      B_0 = B_i;
      B_i =
        2 *
        (Math.atan(
          k_ ** (-1 / alfa) *
            Math.tan(U / 2 + Math.PI / 4) ** (1 / alfa) *
            ((1 + E_BESSEL * Math.sin(B_0)) / (1 - E_BESSEL * Math.sin(B_0))) **
              (E_BESSEL / 2),
        ) -
          Math.PI / 4);
    }

    const B_bessel = B_i;

    // Conversion to rectangular coordinates
    const HH = H_bpv + interpolate_dh(B_bessel / RHO, L_bessel / RHO);

    const NN = A_BESSEL / Math.sqrt(1 - E2_BESSEL * Math.sin(B_bessel) ** 2);

    const X_bessel = (NN + HH) * Math.cos(B_bessel) * Math.cos(L_bessel);
    const Y_bessel = (NN + HH) * Math.cos(B_bessel) * Math.sin(L_bessel);
    const Z_bessel = (NN * (1 - E2_BESSEL) + HH) * Math.sin(B_bessel);

    // Conversion to elipsoid GRS80 - helmertov transformation
    // parameters:
    const r_ = 206264.806;
    const pp1 = 572.213;
    const pp2 = 85.334;
    const pp3 = 461.94;
    const pp4 = 1 + 3.5378 * 1e-6;
    const pp5 = -5.24836073 / r_;
    const pp6 = -1.52899176 / r_;
    const pp7 = -4.97316164 / r_;

    const X_grs = pp1 + pp4 * (X_bessel + pp5 * Y_bessel - pp6 * Z_bessel);
    const Y_grs = pp2 + pp4 * (-pp5 * X_bessel + Y_bessel + pp7 * Z_bessel);
    const Z_grs = pp3 + pp4 * (pp6 * X_bessel - pp7 * Y_bessel + Z_bessel);

    // Conversion to geographical coordinates

    const grs_dist = Math.sqrt(X_grs ** 2 + Y_grs ** 2);
    let B_grs_0 = 1;
    let B_grs_i = Math.atan(
      (Z_grs / grs_dist) * (1 + E2_GRS80 / (1 - E2_GRS80)),
    );

    while (Math.abs(B_grs_0 - B_grs_i) > 1e-15) {
      B_grs_0 = B_grs_i;

      NN_i = A_GRS80 / Math.sqrt(1 - E2_GRS80 * Math.sin(B_grs_0) ** 2);
      HH_e = grs_dist / Math.cos(B_grs_0) - NN_i;
      B_grs_i = Math.atan(
        (Z_grs / grs_dist) * (1 - (NN_i * E2_GRS80) / (NN_i + HH_e)) ** -1,
      );
    }

    const B_etrs = B_grs_i / RHO;
    const L_etrs = Math.atan(Y_grs / X_grs) / RHO;
    const H_etrs = H_bpv + interpolate_dh(B_etrs, L_etrs);

    return {
      B: B_etrs,
      L: L_etrs,
      H: H_etrs,
    };
  } else {
    return {
      B: 0,
      L: 0,
      H: 0,
    };
  }
}

