export type Student = {
  id: string;
  fullName: string;
  initials: string;
  faculty: string;
  group: string;
  course: number;
  rating: number;
  facultyRank: number;
  groupRank: number;
  reviewsCount: number;
  badges: string[];
  weekly: number[];
  email?: string;
  photo?: string;
};

export type Review = {
  id: string;
  fromName: string;
  anonymous: boolean;
  toId: string;
  toName: string;
  criterion: string;
  stars: number;
  text: string;
  timeAgo: string;
};

export const CRITERIA = [
  "Bilim we ökdelik",
  "Aktiwlik we işjeňlik",
  "Iş hili we taslamalar",
  "Topar işi we aragatnaşyk",
  "Jogapkärçilik we düzgün-nyzam",
];

export const FACULTIES = [
  "Maglumat tehnologiýalary",
  "Halkara gatnaşyklary",
  "Ykdysadyýet",
  "Filologiýa",
];

export const STUDENTS: Student[] = [
  { id: "1", fullName: "Amanowa Mähri", initials: "AM", faculty: "Maglumat tehnologiýalary", group: "IKT-22", course: 3, rating: 4.92, facultyRank: 1, groupRank: 1, reviewsCount: 64, badges: ["Toparyň lideri", "Iň aktiw", "Taslama ussady"], weekly: [4.6, 4.7, 4.7, 4.8, 4.85, 4.9, 4.92] },
  { id: "2", fullName: "Berdiýew Arslan", initials: "BA", faculty: "Halkara gatnaşyklary", group: "HG-21", course: 4, rating: 4.85, facultyRank: 1, groupRank: 1, reviewsCount: 52, badges: ["Ynamdar dost", "+50 teswir"], weekly: [4.5, 4.55, 4.6, 4.7, 4.75, 4.8, 4.85] },
  { id: "3", fullName: "Saparmyrat Öwezow", initials: "SÖ", faculty: "Maglumat tehnologiýalary", group: "IKT-22", course: 3, rating: 4.72, facultyRank: 5, groupRank: 3, reviewsCount: 48, badges: ["Toparyň lideri", "Iň aktiw", "+50 teswir"], weekly: [4.3, 4.4, 4.5, 4.55, 4.6, 4.7, 4.72] },
  { id: "4", fullName: "Annaýewa Jeren", initials: "AJ", faculty: "Ykdysadyýet", group: "YK-23", course: 2, rating: 4.68, facultyRank: 2, groupRank: 1, reviewsCount: 41, badges: ["Taslama ussady"] , weekly: [4.4, 4.45, 4.5, 4.55, 4.6, 4.65, 4.68] },
  { id: "5", fullName: "Hojaýew Merdan", initials: "HM", faculty: "Maglumat tehnologiýalary", group: "IKT-22", course: 3, rating: 4.61, facultyRank: 8, groupRank: 4, reviewsCount: 36, badges: ["Ynamdar dost"], weekly: [4.3, 4.35, 4.4, 4.5, 4.55, 4.6, 4.61] },
  { id: "6", fullName: "Gurbanowa Aýlar", initials: "GA", faculty: "Filologiýa", group: "FL-21", course: 4, rating: 4.55, facultyRank: 1, groupRank: 1, reviewsCount: 33, badges: ["Iň aktiw"], weekly: [4.2, 4.3, 4.4, 4.45, 4.5, 4.55, 4.55] },
  { id: "7", fullName: "Döwletow Begenç", initials: "DB", faculty: "Maglumat tehnologiýalary", group: "IKT-22", course: 3, rating: 4.42, facultyRank: 11, groupRank: 6, reviewsCount: 28, badges: [], weekly: [4.1, 4.15, 4.2, 4.3, 4.35, 4.4, 4.42] },
  { id: "8", fullName: "Babaýewa Mährijemal", initials: "BM", faculty: "Ykdysadyýet", group: "YK-23", course: 2, rating: 4.38, facultyRank: 5, groupRank: 3, reviewsCount: 25, badges: ["Ynamdar dost"], weekly: [4.0, 4.1, 4.2, 4.25, 4.3, 4.35, 4.38] },
];

export const REVIEWS: Review[] = [
  { id: "r1", fromName: "Aman Berdiýew", anonymous: false, toId: "3", toName: "Saparmyrat Öwezow", criterion: "Topar işi we aragatnaşyk", stars: 5, text: "Topar taslamasynda örän jogapkärli çemeleşdi. Maglumatlary jemlemekde we analiz etmekde köp kömek etdi.", timeAgo: "2 sagat öň" },
  { id: "r2", fromName: "Anonim", anonymous: true, toId: "1", toName: "Amanowa Mähri", criterion: "Bilim we ökdelik", stars: 5, text: "Sapakda gaty aktiw gatnaşdy. Täze dörän meseleleri çözmekde özboluşly pikirlenmesi bar.", timeAgo: "6 sagat öň" },
  { id: "r3", fromName: "Jeren A.", anonymous: false, toId: "5", toName: "Hojaýew Merdan", criterion: "Jogapkärçilik we düzgün-nyzam", stars: 4, text: "Wagtynda gelýär we tabşyryklary doly ýerine ýetirýär. Käwagt has işjeň bolsa-da gowy bolardy.", timeAgo: "Düýn" },
  { id: "r4", fromName: "Anonim", anonymous: true, toId: "2", toName: "Berdiýew Arslan", criterion: "Iş hili we taslamalar", stars: 5, text: "Taslamasy hilli, prezentasiýasy aýdyň. Topardaşlarymyzyň iň gowy iş eden adamy.", timeAgo: "2 gün öň" },
  { id: "r5", fromName: "Merdan H.", anonymous: false, toId: "4", toName: "Annaýewa Jeren", criterion: "Aktiwlik we işjeňlik", stars: 5, text: "Toparyň ähli çärelerine işjeň gatnaşýar we başgalary hem ruhlandyrýar.", timeAgo: "3 gün öň" },
  { id: "r6", fromName: "Aýlar S.", anonymous: false, toId: "1", toName: "Amanowa Mähri", criterion: "Topar işi we aragatnaşyk", stars: 5, text: "Hemişe kömege taýýar, gepleşmekde aç-açan we hormatly.", timeAgo: "4 gün öň" },
];

export const SCHEDULE = [
  { day: "Duşenbe", time: "09:00–10:30", subject: "Algoritmler", room: "204", peers: ["1", "3", "5"] },
  { day: "Duşenbe", time: "11:00–12:30", subject: "Maglumatlar binýady", room: "311", peers: ["1", "5", "7"] },
  { day: "Sişenbe", time: "09:00–10:30", subject: "Web tehnologiýalar", room: "108", peers: ["3", "5", "7"] },
  { day: "Çarşenbe", time: "13:00–14:30", subject: "Iňlis dili", room: "401", peers: ["1", "3"] },
  { day: "Penşenbe", time: "10:30–12:00", subject: "Operasion ulgamlar", room: "215", peers: ["1", "3", "5", "7"] },
];

export const CURRENT_USER_ID = "3";

export type PointRule = {
  id: string;
  action: string;
  points: number;
  criterion: string;
  categoryId?: string;
};

export const POINT_RULES: PointRule[] = [
  { id: "p1", action: "Sapakda işjeň gatnaşmak", points: 5, criterion: "Aktiwlik we işjeňlik" },
  { id: "p2", action: "Topar taslamasyny tabşyrmak", points: 10, criterion: "Iş hili we taslamalar" },
  { id: "p3", action: "Olimpiada gatnaşmak", points: 15, criterion: "Bilim we ökdelik" },
  { id: "p4", action: "Topardaşyna kömek etmek", points: 4, criterion: "Topar işi we aragatnaşyk" },
  { id: "p5", action: "Wagtynda gelmek (aý boýy)", points: 3, criterion: "Jogapkärçilik we düzgün-nyzam" },
];

export const findStudent = (id: string) => STUDENTS.find((s) => s.id === id);

export const ALL_BADGES: { name: string; desc: string; color: string }[] = [
  { name: "Toparyň lideri", desc: "Toparyň iň ýokary 10 reýtingi", color: "amber" },
  { name: "Iň aktiw", desc: "30+ teswir 30 günde", color: "emerald" },
  { name: "Taslama ussady", desc: "Iş hili ortaça 4.8+", color: "sky" },
  { name: "Ynamdar dost", desc: "Topar işi ortaça 4.7+", color: "violet" },
  { name: "+50 teswir", desc: "50+ teswir gazandy", color: "rose" },
];