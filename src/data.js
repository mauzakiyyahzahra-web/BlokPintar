export const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = (a, n) => shuffle(a).slice(0, n);
export const pick1 = (a) => a[Math.floor(Math.random() * a.length)];

function numWrong(ans, spread, n) {
  const s = new Set(); let guard = 0;
  while (s.size < n && guard++ < 200) { const v = ans + rnd(-spread, spread); if (v !== ans && v >= 0) s.add(v); }
  let k = 1; while (s.size < n) { s.add(ans + spread + k++); }
  return [...s].map(String);
}

// deck: ambil soal tetap tanpa berulang
function deck(list) {
  let d = [];
  return () => { if (!d.length) d = shuffle(list); const [q, a, ...w] = d.pop(); return { q, a, wrong: shuffle(w) }; };
}

/* ====== Konten ====== */
export const PROVINSI = [
  ['Aceh', 'Banda Aceh'], ['Sumatera Utara', 'Medan'], ['Sumatera Barat', 'Padang'], ['Riau', 'Pekanbaru'],
  ['Kepulauan Riau', 'Tanjungpinang'], ['Sumatera Selatan', 'Palembang'], ['Bangka Belitung', 'Pangkalpinang'],
  ['Lampung', 'Bandar Lampung'], ['Banten', 'Serang'], ['Jawa Barat', 'Bandung'], ['Jawa Tengah', 'Semarang'],
  ['Jawa Timur', 'Surabaya'], ['Bali', 'Denpasar'], ['Nusa Tenggara Barat', 'Mataram'], ['Nusa Tenggara Timur', 'Kupang'],
  ['Kalimantan Barat', 'Pontianak'], ['Kalimantan Tengah', 'Palangka Raya'], ['Kalimantan Selatan', 'Banjarbaru'],
  ['Kalimantan Timur', 'Samarinda'], ['Kalimantan Utara', 'Tanjung Selor'], ['Sulawesi Utara', 'Manado'],
  ['Sulawesi Tengah', 'Palu'], ['Sulawesi Barat', 'Mamuju'], ['Sulawesi Selatan', 'Makassar'], ['Sulawesi Tenggara', 'Kendari'],
  ['Maluku', 'Ambon'], ['Maluku Utara', 'Sofifi'], ['Papua', 'Jayapura'], ['Papua Barat', 'Manokwari'],
  ['Papua Selatan', 'Merauke'], ['Papua Tengah', 'Nabire'], ['Papua Barat Daya', 'Sorong'],
];

export const INGGRIS = [
  ['kucing', 'cat'], ['anjing', 'dog'], ['burung', 'bird'], ['ikan', 'fish'], ['apel', 'apple'], ['buku', 'book'],
  ['rumah', 'house'], ['sekolah', 'school'], ['matahari', 'sun'], ['bulan', 'moon'], ['air', 'water'], ['merah', 'red'],
  ['biru', 'blue'], ['hijau', 'green'], ['besar', 'big'], ['kecil', 'small'], ['senang', 'happy'], ['sedih', 'sad'],
  ['makan', 'eat'], ['minum', 'drink'], ['tidur', 'sleep'], ['lari', 'run'], ['guru', 'teacher'], ['murid', 'student'],
  ['meja', 'table'], ['kursi', 'chair'], ['pintu', 'door'], ['jendela', 'window'], ['pohon', 'tree'], ['bunga', 'flower'],
];

export const HIJAIYAH = [
  ['ا', 'Alif'], ['ب', 'Ba'], ['ت', 'Ta'], ['ث', 'Tsa'], ['ج', 'Jim'], ['ح', 'Ha'], ['خ', 'Kho'], ['د', 'Dal'],
  ['ذ', 'Dzal'], ['ر', 'Ro'], ['ز', 'Zai'], ['س', 'Sin'], ['ش', 'Syin'], ['ص', 'Shod'], ['ض', 'Dhod'], ['ط', 'Tho'],
  ['ظ', 'Zho'], ['ع', '\'Ain'], ['غ', 'Ghoin'], ['ف', 'Fa'], ['ق', 'Qof'], ['ك', 'Kaf'], ['ل', 'Lam'], ['م', 'Mim'],
  ['ن', 'Nun'], ['و', 'Wau'], ['ي', 'Ya'],
];

const SAINS = [
  ['Planet terbesar di tata surya?', 'Jupiter', 'Saturnus', 'Bumi', 'Mars'],
  ['Hewan pemakan tumbuhan disebut?', 'Herbivora', 'Karnivora', 'Omnivora', 'Insektivora'],
  ['Tumbuhan membuat makanan lewat?', 'Fotosintesis', 'Respirasi', 'Evaporasi', 'Erosi'],
  ['Air membeku pada suhu?', '0°C', '100°C', '25°C', '50°C'],
  ['Air mendidih pada suhu?', '100°C', '50°C', '0°C', '20°C'],
  ['Organ untuk bernapas?', 'Paru-paru', 'Jantung', 'Hati', 'Ginjal'],
  ['Organ pemompa darah?', 'Jantung', 'Paru-paru', 'Lambung', 'Usus'],
  ['Pusat tata surya kita?', 'Matahari', 'Bulan', 'Bumi', 'Mars'],
  ['Gas yang kita hirup untuk bernapas?', 'Oksigen', 'Karbon dioksida', 'Helium', 'Asap'],
  ['Es berubah jadi air disebut?', 'Mencair', 'Membeku', 'Menguap', 'Mengembun'],
  ['Hewan yang bernapas dengan insang?', 'Ikan', 'Kucing', 'Burung', 'Ayam'],
  ['Satelit alami Bumi?', 'Bulan', 'Matahari', 'Mars', 'Venus'],
  ['Kupu-kupu berasal dari?', 'Ulat', 'Cacing', 'Semut', 'Lebah'],
  ['Magnet menarik benda dari?', 'Besi', 'Kayu', 'Plastik', 'Kertas'],
  ['Planet terdekat dengan Matahari?', 'Merkurius', 'Venus', 'Bumi', 'Neptunus'],
  ['Bagian tumbuhan yang menyerap air?', 'Akar', 'Daun', 'Bunga', 'Buah'],
];

const ISLAM = [
  ['Rukun Islam ada berapa?', '5', '6', '4', '7'],
  ['Rukun Iman ada berapa?', '6', '5', '4', '7'],
  ['Rukun Islam yang pertama?', 'Syahadat', 'Shalat', 'Zakat', 'Puasa'],
  ['Rukun Islam yang kedua?', 'Shalat', 'Syahadat', 'Haji', 'Zakat'],
  ['Rukun Islam yang ketiga?', 'Zakat', 'Puasa', 'Haji', 'Shalat'],
  ['Rukun Islam yang kelima?', 'Haji', 'Zakat', 'Puasa', 'Shalat'],
  ['Rukun Iman yang pertama?', 'Iman kepada Allah', 'Iman kepada Malaikat', 'Iman kepada Rasul', 'Iman kepada Kitab'],
  ['Rukun Iman yang keempat?', 'Iman kepada Rasul', 'Iman kepada Kitab', 'Iman kepada Hari Akhir', 'Iman kepada Malaikat'],
  ['Rukun Iman yang keenam?', 'Qada dan Qadar', 'Hari Akhir', 'Kitab Allah', 'Malaikat'],
  ['Shalat wajib sehari semalam ada?', '5 waktu', '3 waktu', '4 waktu', '6 waktu'],
  ['Shalat Subuh berapa rakaat?', '2', '3', '4', '1'],
  ['Shalat Maghrib berapa rakaat?', '3', '2', '4', '5'],
  ['Kitab suci umat Islam?', 'Al-Qur\'an', 'Taurat', 'Zabur', 'Injil'],
  ['Malaikat penyampai wahyu?', 'Jibril', 'Mikail', 'Israfil', 'Malik'],
  ['Malaikat pembagi rezeki?', 'Mikail', 'Jibril', 'Ridwan', 'Raqib'],
  ['Jumlah surat dalam Al-Qur\'an?', '114', '30', '99', '120'],
  ['Jumlah juz dalam Al-Qur\'an?', '30', '114', '40', '20'],
  ['Surat pertama dalam Al-Qur\'an?', 'Al-Fatihah', 'Al-Baqarah', 'An-Nas', 'Al-Ikhlas'],
  ['Surat terakhir dalam Al-Qur\'an?', 'An-Nas', 'Al-Falaq', 'Al-Fatihah', 'Al-Kautsar'],
  ['Puasa wajib dilakukan di bulan?', 'Ramadhan', 'Syawal', 'Rajab', 'Muharram'],
];

const NABI = [
  ['Nabi yang pertama?', 'Nabi Adam', 'Nabi Nuh', 'Nabi Idris', 'Nabi Ibrahim'],
  ['Nabi dan Rasul terakhir?', 'Nabi Muhammad ﷺ', 'Nabi Isa', 'Nabi Musa', 'Nabi Yahya'],
  ['Nabi yang membuat kapal besar?', 'Nabi Nuh', 'Nabi Hud', 'Nabi Saleh', 'Nabi Luth'],
  ['Nabi yang dibakar tetapi tidak terbakar?', 'Nabi Ibrahim', 'Nabi Ismail', 'Nabi Ishaq', 'Nabi Yaqub'],
  ['Nabi yang ditelan ikan besar?', 'Nabi Yunus', 'Nabi Ayyub', 'Nabi Zakaria', 'Nabi Ilyas'],
  ['Nabi yang bisa berbicara dengan hewan?', 'Nabi Sulaiman', 'Nabi Dawud', 'Nabi Harun', 'Nabi Syuaib'],
  ['Nabi yang tongkatnya membelah laut?', 'Nabi Musa', 'Nabi Harun', 'Nabi Isa', 'Nabi Yusuf'],
  ['Nabi yang terkenal sangat tampan?', 'Nabi Yusuf', 'Nabi Yaqub', 'Nabi Ishaq', 'Nabi Idris'],
  ['Nabi yang sangat sabar saat sakit?', 'Nabi Ayyub', 'Nabi Yunus', 'Nabi Ilyasa', 'Nabi Zulkifli'],
  ['Kitab Zabur diturunkan kepada?', 'Nabi Dawud', 'Nabi Musa', 'Nabi Isa', 'Nabi Sulaiman'],
  ['Kitab Taurat diturunkan kepada?', 'Nabi Musa', 'Nabi Dawud', 'Nabi Isa', 'Nabi Ibrahim'],
  ['Kitab Injil diturunkan kepada?', 'Nabi Isa', 'Nabi Musa', 'Nabi Yahya', 'Nabi Zakaria'],
  ['Nabi dan Rasul yang wajib diketahui ada?', '25', '20', '30', '10'],
  ['Ayah dari Nabi Ismail?', 'Nabi Ibrahim', 'Nabi Ishaq', 'Nabi Nuh', 'Nabi Adam'],
  ['Nabi yang bisa melunakkan besi?', 'Nabi Dawud', 'Nabi Sulaiman', 'Nabi Musa', 'Nabi Hud'],
  ['Nabi Muhammad ﷺ lahir di kota?', 'Makkah', 'Madinah', 'Thaif', 'Yerusalem'],
  ['Rasul Ulul Azmi ada berapa?', '5', '3', '7', '10'],
];

const W = (c) => `<span class="sw" style="background:${c}"></span>`;
const WARNA = [
  [`${W('#e53935')} Merah + ${W('#fdd835')} Kuning = ?`, 'Oranye', 'Hijau', 'Ungu', 'Cokelat'],
  [`${W('#e53935')} Merah + ${W('#1e88e5')} Biru = ?`, 'Ungu', 'Hijau', 'Oranye', 'Abu-abu'],
  [`${W('#1e88e5')} Biru + ${W('#fdd835')} Kuning = ?`, 'Hijau', 'Ungu', 'Oranye', 'Merah muda'],
  [`${W('#e53935')} Merah + ${W('#ffffff')} Putih = ?`, 'Merah muda', 'Oranye', 'Ungu', 'Cokelat'],
  [`${W('#111111')} Hitam + ${W('#ffffff')} Putih = ?`, 'Abu-abu', 'Biru', 'Cokelat', 'Krem'],
  [`${W('#1e88e5')} Biru + ${W('#ffffff')} Putih = ?`, 'Biru muda', 'Hijau', 'Ungu', 'Abu-abu'],
  ['Manakah yang termasuk warna primer?', 'Merah', 'Hijau', 'Ungu', 'Oranye'],
  ['Warna pelangi ada berapa?', '7', '5', '6', '9'],
  ['Warna paling atas pada pelangi?', 'Merah', 'Ungu', 'Biru', 'Hijau'],
  ['Daun yang sehat biasanya berwarna?', 'Hijau', 'Ungu', 'Biru', 'Hitam'],
];

const TUBUH = [
  ['👁️ Mata dalam bahasa Inggris?', 'Eye', 'Ear', 'Nose', 'Hand'],
  ['👃 Hidung dalam bahasa Inggris?', 'Nose', 'Neck', 'Knee', 'Mouth'],
  ['👂 Telinga dalam bahasa Inggris?', 'Ear', 'Eye', 'Arm', 'Hair'],
  ['👄 Mulut dalam bahasa Inggris?', 'Mouth', 'Moon', 'Mouse', 'Foot'],
  ['✋ Tangan dalam bahasa Inggris?', 'Hand', 'Head', 'Leg', 'Heart'],
  ['🦶 Kaki (telapak) dalam bahasa Inggris?', 'Foot', 'Food', 'Finger', 'Face'],
  ['🦵 Tungkai kaki dalam bahasa Inggris?', 'Leg', 'Lip', 'Arm', 'Back'],
  ['💪 Lengan dalam bahasa Inggris?', 'Arm', 'Ear', 'Elbow', 'Ankle'],
  ['🦷 Gigi dalam bahasa Inggris?', 'Tooth', 'Tongue', 'Toe', 'Thumb'],
  ['👅 Lidah dalam bahasa Inggris?', 'Tongue', 'Tooth', 'Throat', 'Teeth'],
  ['🧠 Otak dalam bahasa Inggris?', 'Brain', 'Bone', 'Blood', 'Back'],
  ['❤️ Jantung dalam bahasa Inggris?', 'Heart', 'Head', 'Hair', 'Hip'],
  ['💇 Rambut dalam bahasa Inggris?', 'Hair', 'Hand', 'Head', 'Heel'],
  ['🙂 Wajah dalam bahasa Inggris?', 'Face', 'Foot', 'Finger', 'Fist'],
];

/* ====== SVG helper ====== */
export function clockSVG(h, m) {
  const ha = ((h % 12) + m / 60) * 30 * Math.PI / 180, ma = m * 6 * Math.PI / 180;
  let nums = '';
  for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; nums += `<text x="${100 + 72 * Math.sin(a)}" y="${100 - 72 * Math.cos(a) + 7}" text-anchor="middle" font-size="20" font-weight="800" fill="#333">${i}</text>`; }
  return `<svg viewBox="0 0 200 200" width="170" height="170"><circle cx="100" cy="100" r="93" fill="#fff" stroke="#2d3561" stroke-width="7"/>${nums}
  <line x1="100" y1="100" x2="${100 + 45 * Math.sin(ha)}" y2="${100 - 45 * Math.cos(ha)}" stroke="#2d3561" stroke-width="9" stroke-linecap="round"/>
  <line x1="100" y1="100" x2="${100 + 70 * Math.sin(ma)}" y2="${100 - 70 * Math.cos(ma)}" stroke="#ff5a5f" stroke-width="5" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="7" fill="#2d3561"/></svg>`;
}
export function pieSVG(k, n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2 - Math.PI / 2, a1 = (i + 1) / n * Math.PI * 2 - Math.PI / 2;
    const x0 = 100 + 85 * Math.cos(a0), y0 = 100 + 85 * Math.sin(a0), x1 = 100 + 85 * Math.cos(a1), y1 = 100 + 85 * Math.sin(a1);
    s += `<path d="M100 100 L${x0} ${y0} A85 85 0 ${1 / n > .5 ? 1 : 0} 1 ${x1} ${y1} Z" fill="${i < k ? '#ffb020' : '#fff4dc'}" stroke="#8a4b00" stroke-width="4"/>`;
  }
  return `<svg viewBox="0 0 200 200" width="170" height="170">${s}</svg>`;
}

/* ====== Generator soal: {q, a, wrong[], big?, svg?} ====== */
export const QGEN = {
  add() {
    const plus = Math.random() < .6; let a = rnd(5, 50), b = rnd(2, 30);
    if (!plus && b > a) [a, b] = [b, a];
    const r = plus ? a + b : a - b;
    return { q: `${a} ${plus ? '+' : '−'} ${b} = ?`, a: String(r), wrong: numWrong(r, 6, 3) };
  },
  mult() {
    const a = rnd(2, 10), b = rnd(2, 10), r = a * b;
    const c = new Set([r + a, r - a, r + b, r - b, r + 1, r - 1].filter(v => v > 0 && v !== r));
    return { q: `${a} × ${b} = ?`, a: String(r), wrong: shuffle([...c]).slice(0, 3).map(String) };
  },
  capital() {
    const p = pick1(PROVINSI);
    return { q: `Ibu kota ${p[0]}?`, a: p[1], wrong: pick(PROVINSI.filter(x => x !== p), 3).map(x => x[1]) };
  },
  english() {
    const p = pick1(INGGRIS); const others = pick(INGGRIS.filter(x => x !== p), 3);
    if (Math.random() < .6) return { q: `Bahasa Inggris dari "${p[0]}"?`, a: p[1], wrong: others.map(x => x[1]) };
    return { q: `Arti kata "${p[1]}"?`, a: p[0], wrong: others.map(x => x[0]) };
  },
  hijaiyah() {
    const p = pick1(HIJAIYAH); const others = pick(HIJAIYAH.filter(x => x !== p), 3);
    if (Math.random() < .6) return { q: 'Huruf apakah ini?', big: p[0], a: p[1], wrong: others.map(x => x[1]) };
    return { q: `Manakah huruf "${p[1]}"?`, a: p[0], wrong: others.map(x => x[0]), arabOpt: true };
  },
  sains: deck(SAINS),
  islam: deck(ISLAM),
  nabi: deck(NABI),
  warna: deck(WARNA),
  tubuh: deck(TUBUH),
  jam() {
    const t = () => [rnd(1, 12), pick1([0, 15, 30, 45])];
    const f = ([h, m]) => `${h}:${String(m).padStart(2, '0')}`;
    const [h, m] = t(); const ans = f([h, m]); const s = new Set();
    s.add(f([h % 12 + 1, m]));
    while (s.size < 3) { const v = f(t()); if (v !== ans) s.add(v); }
    s.delete(ans); while (s.size < 3) { const v = f(t()); if (v !== ans) s.add(v); }
    return { q: 'Jam berapa ini?', svg: clockSVG(h, m), a: ans, wrong: [...s] };
  },
  pecahan() {
    const n = pick1([2, 3, 4, 5, 6, 8]), k = rnd(1, n - 1); const ans = `${k}/${n}`;
    const s = new Set([`${n - k}/${n}`, `${k}/${n + 2}`, `${Math.min(k + 1, n)}/${n}`, `${k}/${n - 1 || 3}`, `1/${n + 1}`]);
    s.delete(ans);
    return { q: 'Bagian yang diwarnai oranye berapa?', svg: pieSVG(k, n), a: ans, wrong: shuffle([...s]).slice(0, 3) };
  },
};

/* ====== Kumpulkan (3D) ====== */
const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
function numberItems(test, lo, hi, nGood, nBad) {
  const good = shuffle([...Array(hi - lo + 1)].map((_, i) => i + lo).filter(test)).slice(0, nGood);
  const bad = shuffle([...Array(hi - lo + 1)].map((_, i) => i + lo).filter(n => !test(n))).slice(0, nBad);
  return [...good.map(n => ({ label: String(n), ok: true })), ...bad.map(n => ({ label: String(n), ok: false }))];
}
const MAMALIA = ['🐄 Sapi', '🐘 Gajah', '🐒 Monyet', '🐱 Kucing', '🐶 Anjing', '🐋 Paus', '🦁 Singa', '🐇 Kelinci', '🐎 Kuda', '🦇 Kelelawar', '🐐 Kambing'];
const BUKAN = ['🐔 Ayam', '🐟 Ikan', '🐍 Ular', '🐸 Katak', '🦋 Kupu-kupu', '🐢 Kura-kura', '🐊 Buaya', '🐝 Lebah', '🦆 Bebek', '🐧 Penguin', '🦎 Kadal'];
export const COLLECT = {
  genap: { ins: 'Kumpulkan semua BILANGAN GENAP!', items: () => numberItems(n => n % 2 === 0, 1, 60, 8, 10) },
  prima: { ins: 'Kumpulkan semua BILANGAN PRIMA!', items: () => numberItems(isPrime, 2, 50, 8, 10) },
  vokal: {
    ins: 'Kumpulkan semua HURUF VOKAL!', items: () => [
      ...'AIUEOAIU'.split('').map(l => ({ label: l, ok: true })),
      ...pick('BCDFGHJKLMNPRSTWYZ'.split(''), 10).map(l => ({ label: l, ok: false }))]
  },
  mamalia: {
    ins: 'Kumpulkan hewan MAMALIA (menyusui)!', items: () => [
      ...pick(MAMALIA, 8).map(l => ({ label: l, ok: true })), ...pick(BUKAN, 10).map(l => ({ label: l, ok: false }))]
  },
};

/* ====== Memori, urutan, susun kata, ketik ====== */
export const MEMORY = {
  hewan: [['🐱', 'Cat'], ['🐶', 'Dog'], ['🐦', 'Bird'], ['🐟', 'Fish'], ['🐄', 'Cow'], ['🐴', 'Horse'], ['🐔', 'Chicken'], ['🐘', 'Elephant'], ['🐍', 'Snake'], ['🐒', 'Monkey']],
  angka: [['١', '1'], ['٢', '2'], ['٣', '3'], ['٤', '4'], ['٥', '5'], ['٦', '6'], ['٧', '7'], ['٨', '8'], ['٩', '9'], ['١٠', '10']],
};
export const SEQ = {
  planet: { ins: 'Klik planet dari yang TERDEKAT ke Matahari', items: () => ['Merkurius', 'Venus', 'Bumi', 'Mars', 'Jupiter', 'Saturnus', 'Uranus', 'Neptunus'] },
  bilangan: { ins: 'Klik bilangan dari yang TERKECIL', items: () => { const s = new Set(); while (s.size < 8) s.add(rnd(1, 99)); return [...s].sort((a, b) => a - b).map(String); } },
  hijriah: { ins: 'Klik nama bulan Hijriah sesuai URUTAN', items: () => ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah'] },
};
export const SCRAMBLE = [
  ['MATAHARI', 'Bintang pusat tata surya'], ['PELANGI', 'Muncul setelah hujan, berwarna-warni'], ['KOMPUTER', 'Alat untuk mengetik dan bermain game'],
  ['SEKOLAH', 'Tempat belajar bersama guru'], ['BINTANG', 'Bersinar di langit malam'], ['GUNUNG', 'Tanah yang sangat tinggi'],
  ['SAMUDRA', 'Lautan yang sangat luas'], ['MASJID', 'Tempat ibadah umat Islam'], ['PESAWAT', 'Kendaraan yang terbang'],
  ['KUPU', 'Serangga bersayap indah (_ _ _ _ - kupu)'], ['HUJAN', 'Air yang turun dari awan'], ['PENSIL', 'Alat tulis dari kayu dan grafit'],
  ['JERAPAH', 'Hewan berleher panjang'], ['SEPEDA', 'Kendaraan roda dua dikayuh'],
];
export const TYPING = ['buku', 'pensil', 'belajar', 'sekolah', 'teman', 'jujur', 'sabar', 'rajin', 'ilmu', 'guru', 'pintar', 'masjid', 'shalat', 'quran', 'hafalan', 'sehat', 'bersih', 'disiplin', 'tolong', 'terima kasih', 'maaf', 'semangat', 'kelas', 'papan', 'meja', 'kursi', 'pelangi', 'matahari', 'bumi', 'bulan', 'bintang', 'hujan', 'angin', 'sungai', 'gunung', 'laut', 'pohon', 'bunga', 'kebun', 'sawah'];

export const ROBOT = [
  ['......', '......', 'R...G.', '......', '......', '......'],
  ['R.#...', '..#.G.', '..#...', '......', '......', '......'],
  ['......', '.####.', '.#G...', '.####.', 'R.....', '......'],
  ['G#....', '.#.##.', '.#..#.', '.##.#.', '....#R', '......'],
  ['R.#...', '#.#.#.', '..#.#.', '.##.#.', '....#G', '###...'],
];

/* ====== Daftar game ====== */
export const GAMES = [
  { id: 'obby-tambah', name: 'Obby Tambah Kurang', emoji: '➕', type: 'obby', gen: 'add', color: '#ff5a5f', cat: 'Matematika' },
  { id: 'obby-kali', name: 'Obby Perkalian', emoji: '✖️', type: 'obby', gen: 'mult', color: '#ff8a00', cat: 'Matematika' },
  { id: 'obby-ibukota', name: 'Obby Ibu Kota', emoji: '🏙️', type: 'obby', gen: 'capital', color: '#2bb673', cat: 'IPS' },
  { id: 'obby-inggris', name: 'Obby English', emoji: '🔤', type: 'obby', gen: 'english', color: '#3d7eff', cat: 'Bahasa' },
  { id: 'obby-hijaiyah', name: 'Obby Hijaiyah', emoji: '🕌', type: 'obby', gen: 'hijaiyah', color: '#00a19a', cat: 'Agama' },
  { id: 'obby-sains', name: 'Obby Sains', emoji: '🔬', type: 'obby', gen: 'sains', color: '#8e5cff', cat: 'IPA' },
  { id: 'kumpul-genap', name: 'Buru Bilangan Genap', emoji: '🔢', type: 'collect', set: 'genap', color: '#ffb400', cat: 'Matematika' },
  { id: 'kumpul-prima', name: 'Buru Bilangan Prima', emoji: '💎', type: 'collect', set: 'prima', color: '#e84393', cat: 'Matematika' },
  { id: 'kumpul-vokal', name: 'Buru Huruf Vokal', emoji: '🅰️', type: 'collect', set: 'vokal', color: '#00b4d8', cat: 'Bahasa' },
  { id: 'kumpul-mamalia', name: 'Buru Hewan Mamalia', emoji: '🐘', type: 'collect', set: 'mamalia', color: '#6ab04c', cat: 'IPA' },
  { id: 'kuis-islam', name: 'Kuis Rukun Islam & Iman', emoji: '📖', type: 'quiz', gen: 'islam', color: '#16a085', cat: 'Agama' },
  { id: 'kuis-nabi', name: 'Kuis Kisah Nabi', emoji: '🌙', type: 'quiz', gen: 'nabi', color: '#2c7a7b', cat: 'Agama' },
  { id: 'kuis-jam', name: 'Baca Jam', emoji: '⏰', type: 'quiz', gen: 'jam', color: '#d35400', cat: 'Matematika' },
  { id: 'kuis-pecahan', name: 'Pizza Pecahan', emoji: '🍕', type: 'quiz', gen: 'pecahan', color: '#f39c12', cat: 'Matematika' },
  { id: 'kuis-warna', name: 'Campur Warna', emoji: '🎨', type: 'quiz', gen: 'warna', color: '#c0392b', cat: 'Seni' },
  { id: 'kuis-tubuh', name: 'Body Parts', emoji: '🧍', type: 'quiz', gen: 'tubuh', color: '#e17055', cat: 'Bahasa' },
  { id: 'memori-hewan', name: 'Memori Animals', emoji: '🃏', type: 'memory', set: 'hewan', color: '#6c5ce7', cat: 'Bahasa' },
  { id: 'memori-angka', name: 'Memori Angka Arab', emoji: '🔣', type: 'memory', set: 'angka', color: '#0984e3', cat: 'Agama' },
  { id: 'urut-planet', name: 'Urutkan Planet', emoji: '🪐', type: 'sequence', set: 'planet', color: '#341f97', cat: 'IPA' },
  { id: 'urut-bilangan', name: 'Urutkan Bilangan', emoji: '📶', type: 'sequence', set: 'bilangan', color: '#10ac84', cat: 'Matematika' },
  { id: 'urut-hijriah', name: 'Urutan Bulan Hijriah', emoji: '🗓️', type: 'sequence', set: 'hijriah', color: '#576574', cat: 'Agama' },
  { id: 'susun-kata', name: 'Susun Kata', emoji: '🧩', type: 'scramble', color: '#ee5253', cat: 'Bahasa' },
  { id: 'robot-koding', name: 'Robot Koding', emoji: '🤖', type: 'robot', color: '#222f3e', cat: 'Koding' },
  { id: 'tangkap-hitung', name: 'Tangkap Jawaban', emoji: '🧺', type: 'catch', color: '#ff9f43', cat: 'Matematika' },
  { id: 'ketik-cepat', name: 'Ketik Cepat', emoji: '⌨️', type: 'typing', color: '#5f27cd', cat: 'Bahasa' },
];
