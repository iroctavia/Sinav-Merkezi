import { useState, useEffect, useRef } from "react";

const INITIAL_USERS = [
  { id: 1, ad: "Ayşe Öğretmen", email: "ogretmen@okul.com", sifre: "1234", rol: "ogretmen", aktif: true },
  { id: 2, ad: "Ali Yılmaz", email: "ali@okul.com", sifre: "1234", rol: "ogrenci", aktif: true },
  { id: 3, ad: "Admin", email: "admin@okul.com", sifre: "1234", rol: "admin", aktif: true },
  { id: 4, ad: "Zeynep Kaya", email: "zeynep@okul.com", sifre: "1234", rol: "ogrenci", aktif: true },
  { id: 5, ad: "Mehmet Demir", email: "mehmet@okul.com", sifre: "1234", rol: "ogrenci", aktif: true },
  { id: 6, ad: "Elif Şahin", email: "elif@okul.com", sifre: "1234", rol: "ogrenci", aktif: true },
  { id: 7, ad: "Can Arslan", email: "can@okul.com", sifre: "1234", rol: "ogrenci", aktif: true },
  { id: 8, ad: "Selin Çelik", email: "selin@okul.com", sifre: "1234", rol: "ogrenci", aktif: true },
];

const INITIAL_SORULAR = [
  { id: 1, metin: "Türkiye'nin başkenti neresidir?", tip: "test", puan: 10, secenekler: ["İstanbul", "Ankara", "İzmir", "Bursa"], dogruCevap: 1 },
  { id: 2, metin: "2 + 2 = ?", tip: "test", puan: 10, secenekler: ["3", "4", "5", "6"], dogruCevap: 1 },
  { id: 3, metin: "Suyun kimyasal formülü nedir?", tip: "test", puan: 10, secenekler: ["CO2", "H2O", "NaCl", "O2"], dogruCevap: 1 },
  { id: 4, metin: "En büyük gezegen hangisidir?", tip: "test", puan: 10, secenekler: ["Satürn", "Neptün", "Jüpiter", "Mars"], dogruCevap: 2 },
  { id: 5, metin: "DNA'nın açılımı nedir?", tip: "test", puan: 10, secenekler: ["Deoxyribonucleic Acid", "Ribonucleic Acid", "Deoxyribose Acid", "Nucleic Deoxyacid"], dogruCevap: 0 },
  { id: 6, metin: "Fotosentez nedir? Kısaca açıklayınız.", tip: "klasik", puan: 20, secenekler: [], dogruCevap: null },
  { id: 7, metin: "Atatürk hangi yılda doğmuştur ve hangi şehirde büyümüştür?", tip: "klasik", puan: 15, secenekler: [], dogruCevap: null },
];

const INITIAL_SINAVLAR = [
  { id: 1, baslik: "Genel Kültür Sınavı", tip: "test", sure: 30, baslangicTarihi: "2026-05-15", gecmeNotu: 60, durum: "yayinda", olusturanId: 1, sorular: [1, 2, 3, 4, 5] },
  { id: 2, baslik: "Örnek Klasik Sınav", tip: "klasik", sure: 45, baslangicTarihi: "2026-05-20", gecmeNotu: 50, durum: "yayinda", olusturanId: 1, sorular: [6, 7] },
];

let _idCounter = Date.now();
function uniqueId() {
  _idCounter += 1;
  return _idCounter;
}

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      if (!s) return init;
      const parsed = JSON.parse(s);
      if (key.startsWith("kullanicilar") && (!Array.isArray(parsed) || parsed.length === 0)) return init;
      return parsed;
    } catch {
      return init;
    }
  });
  const set = (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) { console.warn("localStorage yazma hatası:", e); }
  };
  return [val, set];
}

function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "background:#1e40af;color:#bfdbfe",
    green: "background:#166534;color:#bbf7d0",
    yellow: "background:#713f12;color:#fef08a",
    red: "background:#7f1d1d;color:#fecaca",
    gray: "background:#374151;color:#d1d5db",
    teal: "background:#134e4a;color:#99f6e4",
    orange: "background:#7c2d12;color:#fed7aa",
    purple: "background:#581c87;color:#e9d5ff",
  };
  return (
    <span style={{ ...Object.fromEntries((colors[color] || colors.blue).split(";").map(s => s.split(":"))), padding: "2px 10px", borderRadius: 999, fontSize: 12, fontFamily: "inherit" }}>
      {children}
    </span>
  );
}

const S = {
  app: { width: "100%", height: "100%", background: "#0f172a", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" },
  card: { background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" },
  input: { width: "100%", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  btn: (v = "primary") => ({
    primary: { background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    secondary: { background: "#1e293b", color: "#94a3b8", border: "1.5px solid #334155", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    success: { background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    danger: { background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    ghost: { background: "transparent", color: "#94a3b8", border: "none", padding: "8px 14px", cursor: "pointer", borderRadius: 8, fontSize: 14, fontFamily: "inherit" },
    warning: { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    purple: { background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  }[v]),
  label: { fontSize: 13, color: "#94a3b8", marginBottom: 6, display: "block", fontWeight: 500 },
  error: { color: "#f87171", fontSize: 13, marginTop: 4 },
  h1: { fontSize: 28, fontWeight: 800, color: "#f1f5f9", margin: 0 },
  h2: { fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: 0 },
  h3: { fontSize: 17, fontWeight: 700, color: "#f1f5f9", margin: 0 },
};

// ─── ŞİFREMİ UNUTTUM ─────────────────────────────────────────────────────────
function SifremiUnuttumModal({ onKapat, kullanicilar }) {
  const [adim, setAdim] = useState(1);
  const [email, setEmail] = useState("");
  const [hata, setHata] = useState("");
  const [bulunanKul, setBulunanKul] = useState(null);

  const handleMailGonder = () => {
    if (!email) { setHata("E-posta adresi zorunludur."); return; }
    const kul = kullanicilar.find(u => u.email === email);
    if (!kul) { setHata("Bu e-posta adresiyle kayıtlı bir hesap bulunamadı."); return; }
    setBulunanKul(kul);
    setAdim(2);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
      <div style={{ ...S.card, maxWidth: 440, width: "100%", border: "1px solid #3b82f6" }}>
        {adim === 1 ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={S.h3}>🔑 Şifremi Unuttum</h3>
              <button style={S.btn("ghost")} onClick={onKapat}>✕</button>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20 }}>Kayıtlı e-posta adresinizi girin.</p>
            {hata && <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 14 }}>{hata}</div>}
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>E-posta Adresi</label>
              <input style={S.input} type="email" placeholder="ornek@email.com" value={email} onChange={e => { setEmail(e.target.value); setHata(""); }} onKeyDown={e => e.key === "Enter" && handleMailGonder()} autoFocus />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn("primary"), flex: 1 }} onClick={handleMailGonder}>📧 Sıfırlama Maili Gönder</button>
              <button style={S.btn("secondary")} onClick={onKapat}>İptal</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
            <h3 style={{ ...S.h3, color: "#10b981", marginBottom: 10 }}>Mail Gönderildi!</h3>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 6 }}>
              <strong style={{ color: "#f1f5f9" }}>{bulunanKul?.email}</strong> adresine bağlantı gönderildi.
            </p>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>(Demo şifre: <strong style={{ color: "#fbbf24" }}>{bulunanKul?.sifre}</strong>)</p>
            <button style={{ ...S.btn("primary"), width: "100%" }} onClick={onKapat}>Tamam, Giriş Yap</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROL SEÇİM ────────────────────────────────────────────────────────────────
function RolSecimEkrani({ onSelect, onVeriSifirla }) {
  return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%" }}>
      <div style={{ textAlign: "center", maxWidth: 520, width: "100%", padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <h1 style={{ ...S.h1, fontSize: 32, marginBottom: 8 }}>SINAV MERKEZİ</h1>
          <p style={{ color: "#64748b", fontSize: 15 }}>Çevrimiçi Değerlendirme Portalı</p>
        </div>
        <div style={{ ...S.card, marginBottom: 16 }}>
          <p style={{ color: "#94a3b8", marginBottom: 20, fontWeight: 600 }}>Giriş Seçeneğinizi Belirleyin</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { rol: "ogretmen", emoji: "👨‍🏫", baslik: "Öğretmen", aciklama: "Sınav oluştur ve yönet" },
              { rol: "ogrenci", emoji: "👨‍🎓", baslik: "Öğrenci", aciklama: "Sınavlara katıl" },
              { rol: "admin", emoji: "⚙️", baslik: "Admin", aciklama: "Sistemi yönet" },
            ].map(({ rol, emoji, baslik, aciklama }) => (
              <div key={rol} onClick={() => onSelect(rol)}
                style={{ background: "#0f172a", border: "1.5px solid #334155", borderRadius: 14, padding: "20px 12px", cursor: "pointer", textAlign: "center" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "#f1f5f9" }}>{baslik}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginBottom: 14 }}>{aciklama}</div>
                <button style={{ ...S.btn("primary"), padding: "7px 14px", fontSize: 13, width: "100%" }}>GİRİŞ YAP</button>
              </div>
            ))}
          </div>
        </div>
        <p style={{ color: "#475569", fontSize: 13, marginBottom: 8 }}>Demo: ogretmen@okul.com / ogrenci@okul.com / admin@okul.com • şifre: 1234</p>
        <button onClick={onVeriSifirla} style={{ background: "transparent", border: "1px solid #334155", color: "#64748b", borderRadius: 8, padding: "6px 16px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
          🔄 Oturum Verisini Sıfırla
        </button>
      </div>
    </div>
  );
}

// ─── GİRİŞ ────────────────────────────────────────────────────────────────────
function GirisEkrani({ rolSecim, kullanicilar, onGiris, onGeri }) {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bos, setBos] = useState({});
  const [sifreModalAcik, setSifreModalAcik] = useState(false);

  const rolLabel = { ogretmen: "Öğretmen", ogrenci: "Öğrenci", admin: "Admin" }[rolSecim];
  const rolEmoji = { ogretmen: "👨‍🏫", ogrenci: "👨‍🎓", admin: "⚙️" }[rolSecim];

  const handleGiris = () => {
    const boslar = {};
    if (!email) boslar.email = true;
    if (!sifre) boslar.sifre = true;
    if (Object.keys(boslar).length) { setBos(boslar); return; }
    const kullanici = kullanicilar.find(u => u.email.trim() === email.trim() && u.sifre.trim() === sifre.trim() && u.rol === rolSecim);
    if (!kullanici) { setHata("Hatalı kullanıcı adı veya şifre."); return; }
    if (!kullanici.aktif) { setHata("Hesabınız devre dışı bırakılmıştır."); return; }
    onGiris(kullanici);
  };

  return (
    <>
      {sifreModalAcik && <SifremiUnuttumModal kullanicilar={kullanicilar} onKapat={() => setSifreModalAcik(false)} />}
      <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%" }}>
        <div style={{ maxWidth: 420, width: "100%", padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{rolEmoji}</div>
            <h2 style={{ ...S.h2, marginBottom: 4 }}>Tekrar Hoş Geldiniz!</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>{rolLabel} olarak giriş yapın</p>
          </div>
          <div style={S.card}>
            {hata && <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 14 }}>{hata}</div>}
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>E-posta</label>
              <input style={{ ...S.input, borderColor: bos.email ? "#ef4444" : "#334155" }} placeholder="ornek@email.com" value={email} onChange={e => { setEmail(e.target.value); setBos(b => ({ ...b, email: false })); setHata(""); }} />
              {bos.email && <p style={S.error}>Bu alan zorunludur</p>}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={S.label}>Şifre</label>
              <input style={{ ...S.input, borderColor: bos.sifre ? "#ef4444" : "#334155" }} type="password" placeholder="••••••••" value={sifre}
                onChange={e => { setSifre(e.target.value); setBos(b => ({ ...b, sifre: false })); setHata(""); }}
                onKeyDown={e => e.key === "Enter" && handleGiris()} />
              {bos.sifre && <p style={S.error}>Bu alan zorunludur</p>}
            </div>
            <div style={{ textAlign: "right", marginBottom: 18 }}>
              <button style={{ background: "transparent", border: "none", color: "#3b82f6", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }} onClick={() => setSifreModalAcik(true)}>
                Şifremi Unuttum?
              </button>
            </div>
            <button style={{ ...S.btn("primary"), width: "100%", padding: "13px", marginBottom: 12 }} onClick={handleGiris}>GİRİŞ YAP</button>
            <button style={{ ...S.btn("ghost"), width: "100%", fontSize: 13 }} onClick={onGeri}>← Geri Dön</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
function Layout({ kullanici, aktifSayfa, onNavigate, onCikis, children }) {
  const navItems = {
    ogretmen: [
      { id: "panel", emoji: "🏠", label: "Ana Sayfa" },
      { id: "sinavlar", emoji: "📝", label: "Sınavlarım" },
      { id: "soru-bankasi", emoji: "📚", label: "Soru Bankası" },
      { id: "ogrenciler", emoji: "👨‍🎓", label: "Öğrenciler" },
      { id: "sonuclar", emoji: "📊", label: "Sonuçlar" },
    ],
    ogrenci: [
      { id: "panel", emoji: "🏠", label: "Ana Sayfa" },
      { id: "sinavlar", emoji: "📝", label: "Sınavlarım" },
      { id: "sonuclar", emoji: "📊", label: "Sonuçlarım" },
    ],
    admin: [
      { id: "panel", emoji: "🏠", label: "Ana Sayfa" },
      { id: "kullanicilar", emoji: "👥", label: "Kullanıcılar" },
      { id: "sinavlar", emoji: "📝", label: "Sınavlar" },
      { id: "soru-bankasi", emoji: "📚", label: "Soru Bankası" },
      { id: "sonuclar", emoji: "📊", label: "Sonuçlar" },
      { id: "raporlar", emoji: "📈", label: "Raporlar" },
    ],
  }[kullanici.rol] || [];

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#0f172a", overflow: "hidden" }}>
      <div style={{ width: 240, minWidth: 240, background: "#1e293b", borderRight: "1px solid #334155", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #334155" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>🎓 SINAV</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>MERKEZİ</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => onNavigate(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: aktifSayfa === item.id ? "#1d4ed8" : "transparent", color: aktifSayfa === item.id ? "#fff" : "#94a3b8", fontWeight: aktifSayfa === item.id ? 600 : 400 }}
              onMouseEnter={e => { if (aktifSayfa !== item.id) e.currentTarget.style.background = "#0f172a"; }}
              onMouseLeave={e => { if (aktifSayfa !== item.id) e.currentTarget.style.background = "transparent"; }}>
              <span>{item.emoji}</span><span style={{ fontSize: 14 }}>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{kullanici.ad[0]}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{kullanici.ad}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{kullanici.rol}</div>
            </div>
          </div>
          <button style={{ ...S.btn("ghost"), width: "100%", color: "#ef4444", fontSize: 13 }} onClick={onCikis}>🚪 Çıkış Yap</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 28, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
        {children}
      </div>
    </div>
  );
}

// ─── PDF SORU ÇIKARMA MODALİ ──────────────────────────────────────────────────
function PdfSoruModal({ onKapat, onSoruEkle }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [pdfMetni, setPdfMetni] = useState("");
  const [cikarilanSorular, setCikarilanSorular] = useState([]);
  const [seciliSorular, setSeciliSorular] = useState(new Set());
  const [adim, setAdim] = useState(1);
  const [hata, setHata] = useState("");
  const [soruTipi, setSoruTipi] = useState("test");
  const dosyaRef = useRef();

  const parseSorular = (metin, tip) => {
    const satirlar = metin.split("\n").map(s => s.trim()).filter(Boolean);
    const sorular = [];
    let mevcutSoru = null;
    let secenekler = [];

    for (let i = 0; i < satirlar.length; i++) {
      const satir = satirlar[i];
      const soruMatch = satir.match(/^(\d+)[.)]\s+(.+)/);
      const sikMatch = satir.match(/^([A-Da-d])[.)]\s+(.+)/);

      if (soruMatch) {
        if (mevcutSoru) {
          if (tip === "test" && secenekler.length > 0) {
            sorular.push({ id: uniqueId(), metin: mevcutSoru, secenekler: secenekler.slice(0, 4), dogruCevap: 0, puan: 10, tip: "test" });
          } else if (tip === "klasik") {
            sorular.push({ id: uniqueId(), metin: mevcutSoru, secenekler: [], dogruCevap: null, puan: 10, tip: "klasik" });
          }
        }
        mevcutSoru = soruMatch[2];
        secenekler = [];
      } else if (sikMatch && mevcutSoru) {
        secenekler.push(sikMatch[2]);
      }
    }
    if (mevcutSoru) {
      if (tip === "test" && secenekler.length > 0) {
        sorular.push({ id: uniqueId(), metin: mevcutSoru, secenekler: secenekler.slice(0, 4), dogruCevap: 0, puan: 10, tip: "test" });
      } else if (tip === "klasik") {
        sorular.push({ id: uniqueId(), metin: mevcutSoru, secenekler: [], dogruCevap: null, puan: 10, tip: "klasik" });
      }
    }
    return sorular;
  };

  const handleDosyaSec = async (e) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    setYukleniyor(true);
    setHata("");
    try {
      if (dosya.type === "application/pdf") {
        const arrayBuffer = await dosya.arrayBuffer();
        const pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) { setHata("PDF kütüphanesi yüklenemedi. TXT dosyası veya metin yapıştırın."); setYukleniyor(false); return; }
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let tamMetin = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const sayfa = await pdf.getPage(i);
          const icerik = await sayfa.getTextContent();
          tamMetin += icerik.items.map(item => item.str).join(" ") + "\n";
        }
        setPdfMetni(tamMetin);
        const bulunan = parseSorular(tamMetin, soruTipi);
        setCikarilanSorular(bulunan);
        setSeciliSorular(new Set());
        setAdim(2);
      } else if (dosya.type === "text/plain") {
        const metin = await dosya.text();
        setPdfMetni(metin);
        const bulunan = parseSorular(metin, soruTipi);
        setCikarilanSorular(bulunan);
        setSeciliSorular(new Set());
        setAdim(2);
      } else {
        setHata("Lütfen PDF veya TXT dosyası yükleyin.");
      }
    } catch (err) {
      setHata("Dosya okunurken hata oluştu: " + err.message);
    }
    setYukleniyor(false);
  };

  const handleMetindenCikar = () => {
    if (!pdfMetni.trim()) { setHata("Lütfen bir metin girin."); return; }
    const bulunan = parseSorular(pdfMetni, soruTipi);
    if (bulunan.length === 0) { setHata("Sorular çıkarılamadı. Format: '1. Soru metni / A) Şık ...'"); return; }
    setCikarilanSorular(bulunan);
    setSeciliSorular(new Set());
    setAdim(2);
  };

  const handleToggle = (id) => {
    setSeciliSorular(prev => { const yeni = new Set(prev); if (yeni.has(id)) yeni.delete(id); else yeni.add(id); return yeni; });
  };

  const handleDogruCevapDegistir = (soruId, yeniCevap) => {
    setCikarilanSorular(prev => prev.map(s => s.id === soruId ? { ...s, dogruCevap: yeniCevap } : s));
  };

  const tumunuSec = () => setSeciliSorular(new Set(cikarilanSorular.map(s => s.id)));

  const handleEkle = () => {
    const secilenler = cikarilanSorular.filter(s => seciliSorular.has(s.id));
    onSoruEkle(secilenler.map(s => ({ metin: s.metin, secenekler: s.secenekler, dogruCevap: s.dogruCevap, puan: s.puan, tip: s.tip })));
    onKapat();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
      <div style={{ ...S.card, maxWidth: 720, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid #3b82f6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={S.h3}>📄 PDF / Dosyadan Soru İçe Aktar</h3>
          <button style={S.btn("ghost")} onClick={onKapat}>✕</button>
        </div>
        {adim === 1 && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Aktarılacak Soru Tipi</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ id: "test", label: "Test (Çoktan Seçmeli)" }, { id: "klasik", label: "Klasik (Açık Uçlu)" }].map(t => (
                  <div key={t.id} onClick={() => setSoruTipi(t.id)}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `2px solid ${soruTipi === t.id ? "#3b82f6" : "#334155"}`, background: soruTipi === t.id ? "#1e3a5f" : "#0f172a", cursor: "pointer", textAlign: "center", fontSize: 14, fontWeight: 500, color: soruTipi === t.id ? "#93c5fd" : "#94a3b8" }}>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#0f172a", border: "2px dashed #334155", borderRadius: 12, padding: 32, textAlign: "center", marginBottom: 20, cursor: "pointer" }}
              onClick={() => dosyaRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const inp = dosyaRef.current; const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; handleDosyaSec({ target: inp }); } }}>
              <input ref={dosyaRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={handleDosyaSec} />
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>PDF veya TXT dosyası sürükleyin</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>veya tıklayarak seçin</div>
              {yukleniyor && <div style={{ color: "#3b82f6", marginTop: 12, fontSize: 14 }}>⏳ Dosya işleniyor...</div>}
            </div>
            <div style={{ position: "relative", marginBottom: 16, textAlign: "center" }}>
              <div style={{ height: 1, background: "#334155", position: "absolute", top: "50%", left: 0, right: 0 }} />
              <span style={{ position: "relative", background: "#1e293b", padding: "0 12px", color: "#64748b", fontSize: 13 }}>veya metni yapıştırın</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Soru Metni</label>
              <textarea style={{ ...S.input, minHeight: 140, resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
                placeholder={"1. Soru metni?\nA) Şık\nB) Şık\nC) Şık\nD) Şık\n\n2. Başka soru?"}
                value={pdfMetni} onChange={e => { setPdfMetni(e.target.value); setHata(""); }} />
            </div>
            {hata && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12, background: "#450a0a", padding: "10px 14px", borderRadius: 8 }}>{hata}</div>}
            <button style={{ ...S.btn("primary"), width: "100%" }} onClick={handleMetindenCikar}>🔍 Soruları Çıkar</button>
          </div>
        )}
        {adim === 2 && (
          <>
            <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: 14 }}>{cikarilanSorular.length} soru bulundu • <span style={{ color: "#3b82f6", fontWeight: 600 }}>{seciliSorular.size} seçildi</span></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.btn("ghost"), fontSize: 12 }} onClick={tumunuSec}>Tümünü Seç</button>
                <button style={{ ...S.btn("ghost"), fontSize: 12 }} onClick={() => setSeciliSorular(new Set())}>Temizle</button>
                <button style={{ ...S.btn("secondary"), fontSize: 12 }} onClick={() => { setAdim(1); setCikarilanSorular([]); setSeciliSorular(new Set()); }}>← Geri</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
              {cikarilanSorular.map((s, i) => {
                const secili = seciliSorular.has(s.id);
                return (
                  <div key={s.id} style={{ padding: "16px", borderRadius: 10, marginBottom: 10, border: `2px solid ${secili ? "#3b82f6" : "#334155"}`, background: secili ? "#1e3a5f20" : "#0f172a" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: s.tip === "test" ? 12 : 0 }}>
                      <div onClick={() => handleToggle(s.id)} style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, marginTop: 1, border: `2px solid ${secili ? "#3b82f6" : "#475569"}`, background: secili ? "#3b82f6" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        {secili && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", flex: 1 }}>
                        {i + 1}. {s.metin}
                        <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px", borderRadius: 999, background: s.tip === "test" ? "#1e3a5f" : "#2d1f63", color: s.tip === "test" ? "#93c5fd" : "#c4b5fd" }}>{s.tip === "test" ? "TEST" : "KLASİK"}</span>
                      </div>
                    </div>
                    {s.tip === "test" && (
                      <div style={{ paddingLeft: 34 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>✅ Doğru cevabı seçin:</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {s.secenekler.map((sec, j) => (
                            <label key={j} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 10px", borderRadius: 8, background: s.dogruCevap === j ? "#166534" : "transparent", border: `1px solid ${s.dogruCevap === j ? "#16a34a" : "#334155"}` }}>
                              <input type="radio" name={`dogru_${s.id}`} checked={s.dogruCevap === j} onChange={() => handleDogruCevapDegistir(s.id, j)} style={{ accentColor: "#10b981", flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: s.dogruCevap === j ? "#86efac" : "#94a3b8", fontWeight: s.dogruCevap === j ? 600 : 400 }}>
                                {["A", "B", "C", "D"][j]}) {sec}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {s.tip === "klasik" && (
                      <div style={{ paddingLeft: 34, color: "#64748b", fontSize: 12, marginTop: 6 }}>📝 Öğrenci yazılı cevap verecek</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn("success"), flex: 1, opacity: seciliSorular.size === 0 ? 0.5 : 1 }} disabled={seciliSorular.size === 0} onClick={handleEkle}>
                ✅ {seciliSorular.size} Soruyu Bankaya Ekle
              </button>
              <button style={S.btn("secondary")} onClick={onKapat}>İptal</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ÖĞRETMEN PANELİ ──────────────────────────────────────────────────────────
function OgretmenPanel({ kullanici, sinavlar, sonuclar, kullanicilar, onNavigate }) {
  const benim = sinavlar.filter(s => s.olusturanId === kullanici.id);
  const ogrenciler = kullanicilar.filter(u => u.rol === "ogrenci");
  const stats = [
    { label: "Toplam Sınav", val: benim.length, emoji: "📝", color: "#3b82f6" },
    { label: "Aktif Sınav", val: benim.filter(s => s.durum === "yayinda").length, emoji: "✅", color: "#10b981" },
    { label: "Kayıtlı Öğrenci", val: ogrenciler.length, emoji: "👨‍🎓", color: "#8b5cf6" },
    { label: "Tamamlanan", val: sonuclar.length, emoji: "🏆", color: "#f59e0b" },
  ];
  const tipLabel = { test: "Test", klasik: "Klasik", karma: "Karma" };
  const tipBadge = { test: "blue", klasik: "purple", karma: "orange" };
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={S.h1}>Hoş Geldiniz, {kullanici.ad.split(" ")[0]}! 👋</h1>
        <p style={{ color: "#64748b", marginTop: 6 }}>Öğretmen Paneli</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, background: s.color + "20", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.emoji}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={S.h3}>Son Sınavlar</h3>
            <button style={S.btn("primary")} onClick={() => onNavigate("sinav-olustur")}>+ Yeni Sınav</button>
          </div>
          {benim.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "32px 0" }}>Henüz sınav oluşturmadınız.</p>
          ) : benim.slice(0, 4).map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #334155" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.baslik}</div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                  {s.sorular.length} soru • {s.sure} dk • {s.baslangicTarihi}
                  <Badge color={tipBadge[s.tip] || "gray"}>{tipLabel[s.tip] || s.tip}</Badge>
                </div>
              </div>
              <Badge color={s.durum === "yayinda" ? "green" : s.durum === "taslak" ? "gray" : "blue"}>
                {s.durum === "yayinda" ? "Yayında" : s.durum === "taslak" ? "Taslak" : "Bitti"}
              </Badge>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ ...S.h3, marginBottom: 18 }}>Hızlı İşlemler</h3>
          {[
            { label: "Yeni Sınav Oluştur", emoji: "➕", page: "sinav-olustur" },
            { label: "Soru Bankası", emoji: "📚", page: "soru-bankasi" },
            { label: "Öğrenciler", emoji: "👨‍🎓", page: "ogrenciler" },
            { label: "Sonuçları Gör", emoji: "📊", page: "sonuclar" },
          ].map(i => (
            <div key={i.label} onClick={() => onNavigate(i.page)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#0f172a", borderRadius: 10, marginBottom: 10, cursor: "pointer", border: "1px solid #334155" }}>
              <span style={{ fontSize: 20 }}>{i.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{i.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ÖĞRETMEN ÖĞRENCİLER ─────────────────────────────────────────────────────
function OgretmenOgrenciler({ kullanicilar, sonuclar, sinavlar }) {
  const ogrenciler = kullanicilar.filter(u => u.rol === "ogrenci");
  const [secilenOgrenci, setSecilenOgrenci] = useState(null);
  const [aramaMetni, setAramaMetni] = useState("");
  const filtrelenmis = ogrenciler.filter(o => o.ad.toLowerCase().includes(aramaMetni.toLowerCase()) || o.email.toLowerCase().includes(aramaMetni.toLowerCase()));
  const ogrenciSonuclari = secilenOgrenci ? sonuclar.filter(s => s.kullaniciId === secilenOgrenci.id) : [];
  const ortPuan = ogrenciSonuclari.length ? Math.round(ogrenciSonuclari.reduce((a, b) => a + b.puan, 0) / ogrenciSonuclari.length) : null;
  const gecenler = ogrenciSonuclari.filter(r => { const sinav = sinavlar.find(s => s.id === r.sinavId); return sinav && r.puan >= sinav.gecmeNotu; }).length;
  const avatarColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
  const getColor = (id) => avatarColors[id % avatarColors.length];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={S.h1}>👨‍🎓 Öğrencilerim</h1>
        <p style={{ color: "#64748b", marginTop: 6, fontSize: 14 }}>Tüm öğrencileri görüntüleyin ve sonuçlarını takip edin</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: secilenOgrenci ? "1fr 1fr" : "1fr", gap: 20 }}>
        <div style={S.card}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={S.h3}>Öğrenci Listesi ({filtrelenmis.length})</h3>
            </div>
            <input style={S.input} placeholder="🔍 İsim veya e-posta ara..." value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
          </div>
          {filtrelenmis.map(ogrenci => {
            const oSonuclar = sonuclar.filter(s => s.kullaniciId === ogrenci.id);
            const oOrt = oSonuclar.length ? Math.round(oSonuclar.reduce((a, b) => a + b.puan, 0) / oSonuclar.length) : null;
            const secili = secilenOgrenci?.id === ogrenci.id;
            return (
              <div key={ogrenci.id} onClick={() => setSecilenOgrenci(secili ? null : ogrenci)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, marginBottom: 8, cursor: "pointer", border: `2px solid ${secili ? "#3b82f6" : "#334155"}`, background: secili ? "#1e3a5f30" : "#0f172a" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${getColor(ogrenci.id)}, ${getColor(ogrenci.id)}aa)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0, color: "#fff" }}>{ogrenci.ad[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", marginBottom: 2 }}>{ogrenci.ad}</div>
                  <div style={{ color: "#64748b", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ogrenci.email}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {oSonuclar.length > 0 ? (<><div style={{ fontWeight: 700, fontSize: 15, color: oOrt >= 60 ? "#10b981" : "#f59e0b" }}>{oOrt}%</div><div style={{ color: "#64748b", fontSize: 11 }}>{oSonuclar.length} sınav</div></>) : (<div style={{ color: "#475569", fontSize: 12 }}>Henüz yok</div>)}
                </div>
              </div>
            );
          })}
        </div>
        {secilenOgrenci && (
          <div>
            <div style={{ ...S.card, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${getColor(secilenOgrenci.id)}, ${getColor(secilenOgrenci.id)}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "#fff", flexShrink: 0 }}>{secilenOgrenci.ad[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#f1f5f9" }}>{secilenOgrenci.ad}</div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{secilenOgrenci.email}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[{ label: "Sınav", val: ogrenciSonuclari.length, color: "#3b82f6", emoji: "📝" }, { label: "Ort. Puan", val: ortPuan !== null ? `${ortPuan}%` : "—", color: "#10b981", emoji: "🎯" }, { label: "Geçilen", val: `${gecenler}/${ogrenciSonuclari.length}`, color: "#10b981", emoji: "✅" }].map(item => (
                  <div key={item.label} style={{ background: "#0f172a", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{item.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: item.color }}>{item.val}</div>
                    <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.card}>
              <h3 style={{ ...S.h3, marginBottom: 16 }}>📊 Sınav Sonuçları</h3>
              {ogrenciSonuclari.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: "28px 0" }}>Henüz sınava girmemiş.</p>
              ) : ogrenciSonuclari.map((r, i) => {
                const sinav = sinavlar.find(s => s.id === r.sinavId);
                const gec = sinav ? r.puan >= sinav.gecmeNotu : false;
                return (
                  <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid #1e293b" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{sinav?.baslik || "—"}</div>
                      <Badge color={gec ? "green" : "red"}>{gec ? "Geçti" : "Kaldı"}</Badge>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{r.tarih}</div>
                      <span style={{ fontWeight: 800, fontSize: 18, color: gec ? "#10b981" : "#ef4444" }}>{r.puan}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SINAV OLUŞTUR ────────────────────────────────────────────────────────────
function SinavOlustur({ kullanici, sorularDB, onKaydet, onIptal, onSoruEkle }) {
  const [adim, setAdim] = useState(1);
  const [form, setForm] = useState({ baslik: "", tarih: "", sure: 30, gecmeNotu: 60, tip: "" });
  const [seciliSorular, setSeciliSorular] = useState([]);
  const [yeniSoru, setYeniSoru] = useState({ metin: "", secenekler: ["", "", "", ""], dogruCevap: 0, puan: 10, tip: "test" });
  const [hata, setHata] = useState({});
  const [tipHata, setTipHata] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [pdfModalAcik, setPdfModalAcik] = useState(false);
  const [soruFiltre, setSoruFiltre] = useState("hepsi");

  const validate1 = () => { const h = {}; if (!form.baslik.trim()) h.baslik = true; if (!form.tarih) h.tarih = true; setHata(h); return Object.keys(h).length === 0; };
  const handleAdim1Devam = () => { if (validate1()) setAdim(2); };
  const handleAdim2Devam = () => { if (!form.tip) { setTipHata(true); return; } setTipHata(false); setAdim(3); };

  const kaydet = (taslak = false) => {
    if (seciliSorular.length === 0) { alert("En az 1 soru seçmelisiniz."); return; }
    onKaydet({ ...form, durum: taslak ? "taslak" : "yayinda", sorular: seciliSorular, olusturanId: kullanici.id });
    setBasarili(true);
  };

  // Sınav tipine göre bankadan gösterilecek sorular
  const getGosterilenSorular = () => {
    if (form.tip === "test") return sorularDB.filter(s => s.tip === "test");
    if (form.tip === "klasik") return sorularDB.filter(s => s.tip === "klasik");
    if (form.tip === "karma") {
      if (soruFiltre === "test") return sorularDB.filter(s => s.tip === "test");
      if (soruFiltre === "klasik") return sorularDB.filter(s => s.tip === "klasik");
      return sorularDB;
    }
    return sorularDB;
  };

  if (basarili) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ ...S.card, textAlign: "center", maxWidth: 480, width: "100%" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ ...S.h2, color: "#10b981", marginBottom: 8 }}>BAŞARILI!</h2>
        <p style={{ color: "#94a3b8", marginBottom: 24 }}>Sınav: <strong style={{ color: "#f1f5f9" }}>{form.baslik}</strong></p>
        <button style={{ ...S.btn("primary"), marginRight: 12 }} onClick={() => onIptal("sinavlar")}>Sınav Listesine Dön</button>
        <button style={S.btn("secondary")} onClick={() => onIptal("panel")}>Ana Sayfaya Dön</button>
      </div>
    </div>
  );

  const adimlar = ["Genel Bilgiler", "Sınav Tipi", "Soru Ekleme"];
  const gosterilenSorular = getGosterilenSorular();

  return (
    <div>
      {pdfModalAcik && <PdfSoruModal onKapat={() => setPdfModalAcik(false)} onSoruEkle={onSoruEkle} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={S.h1}>Yeni Sınav Oluştur</h1>
        <button style={S.btn("ghost")} onClick={() => onIptal("panel")}>✕ İptal</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        {adimlar.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: adim > i + 1 ? "#10b981" : adim === i + 1 ? "#3b82f6" : "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {adim > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 13, color: adim === i + 1 ? "#f1f5f9" : "#64748b", fontWeight: adim === i + 1 ? 600 : 400 }}>{a}</span>
            </div>
            {i < adimlar.length - 1 && <div style={{ flex: 1, height: 2, background: adim > i + 1 ? "#10b981" : "#334155", margin: "0 12px" }} />}
          </div>
        ))}
      </div>

      {adim === 1 && (
        <div style={S.card}>
          <h3 style={{ ...S.h3, marginBottom: 20 }}>Sınav Bilgileri</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={S.label}>Sınav Başlığı *</label>
              <input style={{ ...S.input, borderColor: hata.baslik ? "#ef4444" : "#334155" }} value={form.baslik} onChange={e => { setForm(f => ({ ...f, baslik: e.target.value })); setHata(h => ({ ...h, baslik: false })); }} placeholder="Genel Kültür Sınavı" />
              {hata.baslik && <p style={S.error}>Zorunlu alan</p>}
            </div>
            <div>
              <label style={S.label}>Sınav Tarihi *</label>
              <input style={{ ...S.input, borderColor: hata.tarih ? "#ef4444" : "#334155" }} type="date" value={form.tarih} onChange={e => { setForm(f => ({ ...f, tarih: e.target.value })); setHata(h => ({ ...h, tarih: false })); }} />
              {hata.tarih && <p style={S.error}>Zorunlu alan</p>}
            </div>
            <div>
              <label style={S.label}>Süre (dakika)</label>
              <input style={S.input} type="number" value={form.sure} onChange={e => setForm(f => ({ ...f, sure: +e.target.value }))} min={5} />
            </div>
            <div>
              <label style={S.label}>Geçme Notu (%)</label>
              <input style={S.input} type="number" value={form.gecmeNotu} onChange={e => setForm(f => ({ ...f, gecmeNotu: +e.target.value }))} min={0} max={100} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <button style={S.btn("primary")} onClick={handleAdim1Devam}>Devam →</button>
          </div>
        </div>
      )}

      {adim === 2 && (
        <div style={S.card}>
          <h3 style={{ ...S.h3, marginBottom: 20 }}>Sınav Tipini Seçin</h3>
          {tipHata && <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 14 }}>Lütfen bir sınav tipi seçin.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { id: "test", emoji: "☑️", baslik: "TEST SINAVI", aciklama: "Çoktan seçmeli, otomatik değerlendirme" },
              { id: "klasik", emoji: "✍️", baslik: "KLASİK SINAV", aciklama: "Açık uçlu yazılı sorular, öğrenci metin cevabı girer" },
              { id: "karma", emoji: "🔀", baslik: "KARMA SINAV", aciklama: "Test ve klasik soruları bir arada" },
            ].map(t => (
              <div key={t.id} onClick={() => { setForm(f => ({ ...f, tip: t.id })); setTipHata(false); }}
                style={{ border: `2px solid ${form.tip === t.id ? "#3b82f6" : "#334155"}`, borderRadius: 14, padding: "24px 16px", textAlign: "center", cursor: "pointer", background: form.tip === t.id ? "#1e3a5f" : "#0f172a" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{t.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: "#f1f5f9" }}>{t.baslik}</div>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>{t.aciklama}</p>
                <button style={{ ...S.btn(form.tip === t.id ? "primary" : "secondary"), padding: "7px 16px", fontSize: 13 }}>{form.tip === t.id ? "✓ Seçildi" : "Bu Tipi Seç"}</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button style={S.btn("secondary")} onClick={() => setAdim(1)}>← Geri</button>
            <button style={S.btn("primary")} onClick={handleAdim2Devam}>Devam →</button>
          </div>
        </div>
      )}

      {adim === 3 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={S.h3}>📚 Soru Bankası</h3>
                <button style={{ ...S.btn("warning"), padding: "7px 12px", fontSize: 12 }} onClick={() => setPdfModalAcik(true)}>📄 PDF'den Aktar</button>
              </div>
              {form.tip === "karma" && (
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {[{ id: "hepsi", label: "Tümü" }, { id: "test", label: "☑️ Test" }, { id: "klasik", label: "✍️ Klasik" }].map(f => (
                    <button key={f.id} style={{ ...S.btn(soruFiltre === f.id ? "primary" : "secondary"), padding: "5px 12px", fontSize: 12 }} onClick={() => setSoruFiltre(f.id)}>{f.label}</button>
                  ))}
                </div>
              )}
              {gosterilenSorular.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>
                  {form.tip === "klasik" ? "Bankada klasik soru yok. Sağdan ekleyin." : form.tip === "karma" ? "Bu filtreye uygun soru yok." : "Soru bankası boş."}
                </p>
              ) : gosterilenSorular.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #334155" }}>
                  <input type="checkbox" checked={seciliSorular.includes(s.id)}
                    onChange={e => setSeciliSorular(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))}
                    style={{ accentColor: "#3b82f6", width: 16, height: 16, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{s.metin}</div>
                    <div style={{ color: "#64748b", fontSize: 12, marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
                      {s.puan} puan
                      <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 999, background: s.tip === "test" ? "#1e3a5f" : "#2d1f63", color: s.tip === "test" ? "#93c5fd" : "#c4b5fd" }}>
                        {s.tip === "test" ? "TEST" : "KLASİK"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 12, color: "#3b82f6", fontSize: 13, fontWeight: 600 }}>{seciliSorular.length} soru seçildi</div>
            </div>

            <div style={S.card}>
              <h3 style={{ ...S.h3, marginBottom: 16 }}>➕ Yeni Soru Ekle</h3>
              {/* Soru tipi seçimi — karma sınavda seçilebilir */}
              {(form.tip === "karma" || form.tip === "klasik" || form.tip === "test") && (
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Soru Tipi</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(form.tip === "karma" ? ["test", "klasik"] : [form.tip]).map(t => (
                      <div key={t} onClick={() => setYeniSoru(s => ({ ...s, tip: t, secenekler: t === "klasik" ? [] : ["", "", "", ""] }))}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${yeniSoru.tip === t ? "#3b82f6" : "#334155"}`, background: yeniSoru.tip === t ? "#1e3a5f" : "#0f172a", cursor: "pointer", textAlign: "center", fontSize: 13, color: yeniSoru.tip === t ? "#93c5fd" : "#94a3b8" }}>
                        {t === "test" ? "☑️ Test" : "✍️ Klasik"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <label style={S.label}>Soru Metni</label>
                <textarea style={{ ...S.input, minHeight: 72, resize: "vertical" }} value={yeniSoru.metin}
                  onChange={e => setYeniSoru(s => ({ ...s, metin: e.target.value }))} placeholder="Soruyu yazın..." />
              </div>

              {/* Test sorusu şıkları */}
              {yeniSoru.tip === "test" && (
                <>
                  <label style={S.label}>Şıklar (doğru şıkkı işaretleyin)</label>
                  {["", "", "", ""].map((_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <input type="radio" checked={yeniSoru.dogruCevap === i} onChange={() => setYeniSoru(s => ({ ...s, dogruCevap: i }))} style={{ accentColor: "#10b981" }} />
                      <input style={{ ...S.input, flex: 1 }} value={yeniSoru.secenekler[i] || ""}
                        onChange={e => setYeniSoru(s => { const arr = [...(s.secenekler.length === 4 ? s.secenekler : ["", "", "", ""])]; arr[i] = e.target.value; return { ...s, secenekler: arr }; })}
                        placeholder={`Şık ${["A", "B", "C", "D"][i]}`} />
                    </div>
                  ))}
                </>
              )}

              {/* Klasik soru bilgisi */}
              {yeniSoru.tip === "klasik" && (
                <div style={{ background: "#0f172a", border: "1px dashed #4f46e5", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  <div style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>✍️ Klasik Soru</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>Öğrenci bu soruya yazılı olarak cevap verecek. Şık eklemenize gerek yok.</div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Puan</label>
                <input style={S.input} type="number" value={yeniSoru.puan} onChange={e => setYeniSoru(s => ({ ...s, puan: +e.target.value }))} min={1} />
              </div>
              <button style={{ ...S.btn("success"), width: "100%" }} onClick={() => {
                if (yeniSoru.metin.trim()) {
                  onSoruEkle({ metin: yeniSoru.metin, secenekler: yeniSoru.tip === "klasik" ? [] : yeniSoru.secenekler, dogruCevap: yeniSoru.tip === "klasik" ? null : yeniSoru.dogruCevap, puan: yeniSoru.puan, tip: yeniSoru.tip });
                  setYeniSoru(s => ({ ...s, metin: "", secenekler: ["", "", "", ""], dogruCevap: 0 }));
                }
              }}>Bankaya Ekle</button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <button style={S.btn("secondary")} onClick={() => setAdim(2)}>← Geri</button>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={S.btn("secondary")} onClick={() => kaydet(true)}>💾 Taslak Kaydet</button>
              <button style={S.btn("success")} onClick={() => kaydet(false)}>🚀 Sınavı Yayınla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SINAV LİSTESİ (ÖĞRETMEN) ─────────────────────────────────────────────────
function SinavListesiOgretmen({ kullanici, sinavlar, onYeniSinav, onSil }) {
  const benim = sinavlar.filter(s => s.olusturanId === kullanici.id);
  const tipLabel = { test: "Test", klasik: "Klasik", karma: "Karma" };
  const tipBadge = { test: "blue", klasik: "purple", karma: "orange" };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={S.h1}>Sınavlarım</h1>
        <button style={S.btn("primary")} onClick={onYeniSinav}>+ Yeni Sınav Oluştur</button>
      </div>
      {benim.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p style={{ color: "#64748b" }}>Henüz sınav oluşturmadınız.</p>
          <button style={{ ...S.btn("primary"), marginTop: 16 }} onClick={onYeniSinav}>İlk Sınavı Oluştur</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {benim.map(s => (
            <div key={s.id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <h3 style={{ ...S.h3, fontSize: 16, flex: 1, paddingRight: 8 }}>{s.baslik}</h3>
                <Badge color={s.durum === "yayinda" ? "green" : s.durum === "taslak" ? "gray" : "blue"}>
                  {s.durum === "yayinda" ? "Yayında" : s.durum === "taslak" ? "Taslak" : "Bitti"}
                </Badge>
              </div>
              <div style={{ marginBottom: 10 }}>
                <Badge color={tipBadge[s.tip] || "gray"}>{tipLabel[s.tip] || s.tip}</Badge>
              </div>
              <div style={{ color: "#64748b", fontSize: 13 }}>
                <div style={{ marginBottom: 4 }}>📅 {s.baslangicTarihi}</div>
                <div style={{ marginBottom: 4 }}>⏱ {s.sure} dakika</div>
                <div style={{ marginBottom: 4 }}>❓ {s.sorular.length} soru</div>
                <div>🎯 Geçme notu: %{s.gecmeNotu}</div>
              </div>
              <div style={{ marginTop: 16 }}>
                <button style={{ ...S.btn("danger"), padding: "7px 14px", fontSize: 13, width: "100%" }} onClick={() => onSil(s.id)}>🗑 Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SORU BANKASI ─────────────────────────────────────────────────────────────
function SoruBankasi({ sorular, onEkle, onSil }) {
  const [yeni, setYeni] = useState({ metin: "", secenekler: ["", "", "", ""], dogruCevap: 0, puan: 10, tip: "test" });
  const [aramaMetni, setAramaMetni] = useState("");
  const [tipFiltre, setTipFiltre] = useState("hepsi");
  const [pdfModalAcik, setPdfModalAcik] = useState(false);

  const filtrelenmis = sorular.filter(s => {
    const aramaUygun = s.metin.toLowerCase().includes(aramaMetni.toLowerCase());
    const tipUygun = tipFiltre === "hepsi" || s.tip === tipFiltre;
    return aramaUygun && tipUygun;
  });

  return (
    <div>
      {pdfModalAcik && <PdfSoruModal onKapat={() => setPdfModalAcik(false)} onSoruEkle={onEkle} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={S.h1}>📚 Soru Bankası</h1>
        <button style={{ ...S.btn("warning"), padding: "9px 16px", fontSize: 14 }} onClick={() => setPdfModalAcik(true)}>📄 PDF'den İçe Aktar</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={S.h3}>Mevcut Sorular ({filtrelenmis.length})</h3>
          </div>
          <input style={{ ...S.input, marginBottom: 12 }} placeholder="🔍 Soru ara..." value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[{ id: "hepsi", label: "Tümü" }, { id: "test", label: "☑️ Test" }, { id: "klasik", label: "✍️ Klasik" }].map(f => (
              <button key={f.id} style={{ ...S.btn(tipFiltre === f.id ? "primary" : "secondary"), padding: "5px 14px", fontSize: 12 }} onClick={() => setTipFiltre(f.id)}>{f.label}</button>
            ))}
          </div>
          {filtrelenmis.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>Soru bulunamadı.</p>
          ) : filtrelenmis.map((s, i) => (
            <div key={s.id} style={{ padding: "14px 0", borderBottom: "1px solid #334155" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontWeight: 500, fontSize: 14, flex: 1, paddingRight: 12 }}>
                  {i + 1}. {s.metin}
                  <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px", borderRadius: 999, background: s.tip === "test" ? "#1e3a5f" : "#2d1f63", color: s.tip === "test" ? "#93c5fd" : "#c4b5fd" }}>
                    {s.tip === "test" ? "TEST" : "KLASİK"}
                  </span>
                </div>
                <button onClick={() => { if (window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) onSil(s.id); }}
                  style={{ background: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>🗑 Sil</button>
              </div>
              {s.tip === "test" ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {s.secenekler.map((sec, j) => (
                    <span key={j} style={{ fontSize: 12, padding: "2px 10px", borderRadius: 6, background: s.dogruCevap === j ? "#166534" : "#0f172a", color: s.dogruCevap === j ? "#86efac" : "#94a3b8", border: `1px solid ${s.dogruCevap === j ? "#16a34a" : "#334155"}` }}>
                      {["A", "B", "C", "D"][j]}) {sec}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#64748b", fontSize: 12, fontStyle: "italic" }}>📝 Yazılı cevap — {s.puan} puan</div>
              )}
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ ...S.h3, marginBottom: 16 }}>Yeni Soru Ekle</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Soru Tipi</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ id: "test", label: "☑️ Test" }, { id: "klasik", label: "✍️ Klasik" }].map(t => (
                <div key={t.id} onClick={() => setYeni(s => ({ ...s, tip: t.id, secenekler: t.id === "klasik" ? [] : ["", "", "", ""], dogruCevap: t.id === "klasik" ? null : 0 }))}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${yeni.tip === t.id ? "#3b82f6" : "#334155"}`, background: yeni.tip === t.id ? "#1e3a5f" : "#0f172a", cursor: "pointer", textAlign: "center", fontSize: 14, color: yeni.tip === t.id ? "#93c5fd" : "#94a3b8" }}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Soru Metni</label>
            <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" }} value={yeni.metin} onChange={e => setYeni(s => ({ ...s, metin: e.target.value }))} placeholder="Soruyu yazın..." />
          </div>
          {yeni.tip === "test" ? (
            <>
              <label style={S.label}>Şıklar (doğru şıkkı seçin)</label>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <input type="radio" name="dogru" checked={yeni.dogruCevap === i} onChange={() => setYeni(s => ({ ...s, dogruCevap: i }))} style={{ accentColor: "#10b981" }} />
                  <span style={{ color: "#64748b", fontSize: 13, width: 20 }}>{["A", "B", "C", "D"][i]})</span>
                  <input style={S.input} value={yeni.secenekler[i] || ""} onChange={e => setYeni(s => { const a = [...(s.secenekler.length === 4 ? s.secenekler : ["", "", "", ""])]; a[i] = e.target.value; return { ...s, secenekler: a }; })} placeholder={`Şık ${["A", "B", "C", "D"][i]}`} />
                </div>
              ))}
            </>
          ) : (
            <div style={{ background: "#0f172a", border: "1px dashed #4f46e5", borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>✍️ Klasik Soru</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>Öğrenci bu soruya metin kutusuna yazarak cevap verecek.</div>
            </div>
          )}
          <div style={{ marginTop: 12, marginBottom: 16 }}>
            <label style={S.label}>Puan</label>
            <input style={S.input} type="number" value={yeni.puan} onChange={e => setYeni(s => ({ ...s, puan: +e.target.value }))} min={1} />
          </div>
          <button style={{ ...S.btn("success"), width: "100%" }} onClick={() => {
            if (yeni.metin.trim()) {
              onEkle(yeni);
              setYeni(s => ({ ...s, metin: "", secenekler: ["", "", "", ""], dogruCevap: s.tip === "klasik" ? null : 0 }));
            }
          }}>➕ Soruyu Ekle</button>
        </div>
      </div>
    </div>
  );
}

// ─── ÖĞRENCİ PANELİ ───────────────────────────────────────────────────────────
function OgrenciPanel({ kullanici, sinavlar, sonuclar, onNavigate }) {
  const benimSonuclarim = sonuclar.filter(s => s.kullaniciId === kullanici.id);
  const aktifler = sinavlar.filter(s => s.durum === "yayinda");
  const tipLabel = { test: "Test", klasik: "Klasik", karma: "Karma" };
  const tipBadge = { test: "blue", klasik: "purple", karma: "orange" };
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={S.h1}>Hoş Geldiniz, {kullanici.ad.split(" ")[0]}! 👋</h1>
        <p style={{ color: "#64748b", marginTop: 6 }}>Öğrenci Paneli</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Aktif Sınav", val: aktifler.length, emoji: "📝", color: "#3b82f6" },
          { label: "Girdiğim Sınav", val: benimSonuclarim.length, emoji: "✅", color: "#10b981" },
          { label: "Ort. Puan", val: benimSonuclarim.length ? Math.round(benimSonuclarim.reduce((a, b) => a + b.puan, 0) / benimSonuclarim.length) + "%" : "-", emoji: "🏆", color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, background: s.color + "20", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.emoji}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <h3 style={{ ...S.h3, marginBottom: 18 }}>Mevcut Sınavlar</h3>
        {aktifler.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>Şu an aktif sınav bulunmuyor.</p>
        ) : aktifler.map(s => {
          const girildi = benimSonuclarim.find(r => r.sinavId === s.id);
          return (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #334155" }}>
              <div>
                <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  {s.baslik}
                  <Badge color={tipBadge[s.tip] || "gray"}>{tipLabel[s.tip] || s.tip}</Badge>
                </div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>📅 {s.baslangicTarihi} &nbsp;|&nbsp; ⏱ {s.sure} dk &nbsp;|&nbsp; ❓ {s.sorular.length} soru</div>
              </div>
              {girildi ? (
                <Badge color="green">Tamamlandı • {girildi.puan}%</Badge>
              ) : (
                <button style={{ ...S.btn("primary"), padding: "8px 18px" }} onClick={() => onNavigate("sinav-al", s.id)}>Sınava Gir →</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SINAV AL (TEST + KLASİK + KARMA) ────────────────────────────────────────
function SinavAl({ sinav, sorularDB, kullanici, onBitir }) {
  const sorular = sinav.sorular.map(id => sorularDB.find(s => s.id === id)).filter(Boolean);
  const [cevaplar, setCevaplar] = useState({});    // test soruları için: {soruId: secilenIndex}
  const [yaziliCevaplar, setYaziliCevaplar] = useState({});  // klasik sorular için: {soruId: metin}
  const [aktifSoru, setAktifSoru] = useState(0);
  const [kalan, setKalan] = useState(sinav.sure * 60);
  const [bitti, setBitti] = useState(false);
  const [sonuc, setSonuc] = useState(null);
  const cevaplarRef = useRef(cevaplar);
  const yaziliRef = useRef(yaziliCevaplar);
  cevaplarRef.current = cevaplar;
  yaziliRef.current = yaziliCevaplar;
  const intervalRef = useRef(null);

  const hesapla = (cevaplarData, yaziliData) => {
    const c = cevaplarData || cevaplarRef.current;
    const y = yaziliData || yaziliRef.current;

    let toplamPuan = 0;
    let maxPuan = 0;
    let dogru = 0;
    let yanlis = 0;
    let yazilidoldurulmus = 0;

    sorular.forEach(s => {
      maxPuan += s.puan || 10;
      if (s.tip === "test" || !s.tip) {
        if (c[s.id] === s.dogruCevap) { dogru++; toplamPuan += s.puan || 10; }
        else { yanlis++; }
      } else if (s.tip === "klasik") {
        // Klasik sorular tam puan verilir (öğretmen değerlendirmesi simülasyonu)
        if (y[s.id] && y[s.id].trim().length > 0) {
          yazilidoldurulmus++;
          toplamPuan += s.puan || 10; // demo: cevap girildiyse tam puan
        }
      }
    });

    const puan = maxPuan > 0 ? Math.round((toplamPuan / maxPuan) * 100) : 0;
    const testSorulari = sorular.filter(s => s.tip === "test" || !s.tip);
    const klasikSorulari = sorular.filter(s => s.tip === "klasik");

    const sonucObj = {
      kullaniciId: kullanici.id,
      sinavId: sinav.id,
      puan,
      dogru,
      yanlis,
      yaziliDoldurulmus: yazilidoldurulmus,
      testSoruSayisi: testSorulari.length,
      klasikSoruSayisi: klasikSorulari.length,
      tarih: new Date().toLocaleDateString("tr-TR"),
    };
    setSonuc(sonucObj);
    setBitti(true);
    clearInterval(intervalRef.current);
    onBitir(sonucObj);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setKalan(k => {
        if (k <= 1) { clearInterval(intervalRef.current); hesapla(); return 0; }
        return k - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Kaç soru cevaplanmış
  const cevaplananSayisi = sorular.filter(s => {
    if (s.tip === "test" || !s.tip) return cevaplar[s.id] !== undefined;
    if (s.tip === "klasik") return yaziliCevaplar[s.id] && yaziliCevaplar[s.id].trim().length > 0;
    return false;
  }).length;

  if (bitti && sonuc) {
    const gec = sonuc.puan >= sinav.gecmeNotu;
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div style={{ ...S.card, textAlign: "center", maxWidth: 560, width: "100%" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{gec ? "🎉" : "😔"}</div>
          <h2 style={{ ...S.h2, color: gec ? "#10b981" : "#ef4444", marginBottom: 8 }}>{gec ? "TEBRİKLER!" : "BAŞARISIZ"}</h2>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#f1f5f9", margin: "16px 0" }}>{sonuc.puan}%</div>

          {sinav.tip === "karma" || sinav.tip === "test" ? (
            <div style={{ display: "grid", gridTemplateColumns: sonuc.klasikSoruSayisi > 0 ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Doğru", val: sonuc.dogru, color: "#10b981" },
                { label: "Yanlış", val: sonuc.yanlis, color: "#ef4444" },
                { label: "Toplam", val: sorular.length, color: "#3b82f6" },
                ...(sonuc.klasikSoruSayisi > 0 ? [{ label: "Yazılı", val: `${sonuc.yaziliDoldurulmus}/${sonuc.klasikSoruSayisi}`, color: "#8b5cf6" }] : [])
              ].map(i => (
                <div key={i.label} style={{ background: "#0f172a", borderRadius: 10, padding: "14px 0" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: i.color }}>{i.val}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>{i.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Yazılı Soru", val: sonuc.klasikSoruSayisi, color: "#8b5cf6", emoji: "✍️" },
                { label: "Cevaplanan", val: `${sonuc.yaziliDoldurulmus}/${sonuc.klasikSoruSayisi}`, color: sonuc.yaziliDoldurulmus === sonuc.klasikSoruSayisi ? "#10b981" : "#f59e0b", emoji: "📝" },
              ].map(i => (
                <div key={i.label} style={{ background: "#0f172a", borderRadius: 10, padding: "14px 0" }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{i.emoji}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: i.color }}>{i.val}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>{i.label}</div>
                </div>
              ))}
            </div>
          )}

          {sinav.tip === "klasik" && (
            <div style={{ background: "#1e293b", border: "1px solid #4f46e5", borderRadius: 10, padding: 14, marginBottom: 16, textAlign: "left" }}>
              <div style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ℹ️ Klasik Sınav Notu</div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>
                Bu bir klasik sınavdır. Demo sistemde cevap girilmişse tam puan verilmektedir. Gerçek uygulamada öğretmen değerlendirmesi yapılır.
              </div>
            </div>
          )}

          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Geçme notu: %{sinav.gecmeNotu}</p>
          <button style={S.btn("primary")} onClick={() => onBitir(null)}>← Panele Dön</button>
        </div>
      </div>
    );
  }

  if (sorular.length === 0) return <div style={{ color: "#64748b", textAlign: "center", padding: 40 }}>Bu sınavın soruları bulunamadı.</div>;

  const soru = sorular[aktifSoru];
  const soruTipi = soru.tip || "test";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, background: "#1e293b", padding: "14px 20px", borderRadius: 14, border: "1px solid #334155" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{sinav.baslik}</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ color: kalan < 60 ? "#ef4444" : "#f59e0b", fontWeight: 700, fontSize: 18 }}>⏱ {fmt(kalan)}</div>
          <Badge color="blue">{cevaplananSayisi}/{sorular.length} Cevaplandı</Badge>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20 }}>
        <div style={S.card}>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            Soru {aktifSoru + 1} / {sorular.length}
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: soruTipi === "test" ? "#1e3a5f" : "#2d1f63", color: soruTipi === "test" ? "#93c5fd" : "#c4b5fd" }}>
              {soruTipi === "test" ? "☑️ TEST" : "✍️ KLASİK"}
            </span>
          </div>
          <div style={{ width: "100%", background: "#334155", borderRadius: 4, height: 4, marginBottom: 20 }}>
            <div style={{ width: `${((aktifSoru + 1) / sorular.length) * 100}%`, background: "#3b82f6", height: 4, borderRadius: 4 }} />
          </div>
          <h3 style={{ ...S.h3, fontSize: 18, marginBottom: 24, lineHeight: 1.5 }}>{soru.metin}</h3>

          {/* TEST SORUSU */}
          {soruTipi === "test" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {soru.secenekler.map((sec, i) => {
                const secildi = cevaplar[soru.id] === i;
                return (
                  <div key={i} onClick={() => setCevaplar(c => ({ ...c, [soru.id]: i }))}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, border: `2px solid ${secildi ? "#3b82f6" : "#334155"}`, background: secildi ? "#1e3a5f" : "#0f172a", cursor: "pointer" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${secildi ? "#3b82f6" : "#475569"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: secildi ? "#3b82f6" : "#64748b", flexShrink: 0 }}>
                      {["A", "B", "C", "D"][i]}
                    </div>
                    <span style={{ fontSize: 15, color: secildi ? "#f1f5f9" : "#cbd5e1" }}>{sec}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* KLASİK SORU — yazılı cevap alanı */}
          {soruTipi === "klasik" && (
            <div>
              <div style={{ background: "#0f172a", border: "1px solid #4f46e5", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                <div style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 500 }}>✍️ Bu soruyu yazılı olarak cevaplayın</div>
              </div>
              <textarea
                style={{
                  ...S.input,
                  minHeight: 160,
                  resize: "vertical",
                  fontSize: 15,
                  lineHeight: 1.6,
                  borderColor: yaziliCevaplar[soru.id] ? "#4f46e5" : "#334155",
                }}
                placeholder="Cevabınızı buraya yazın..."
                value={yaziliCevaplar[soru.id] || ""}
                onChange={e => setYaziliCevaplar(prev => ({ ...prev, [soru.id]: e.target.value }))}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                <span style={{ color: "#64748b", fontSize: 12 }}>
                  {(yaziliCevaplar[soru.id] || "").length} karakter
                </span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button style={{ ...S.btn("secondary"), opacity: aktifSoru === 0 ? 0.5 : 1 }} disabled={aktifSoru === 0} onClick={() => setAktifSoru(a => a - 1)}>← Önceki</button>
            {aktifSoru < sorular.length - 1 ? (
              <button style={S.btn("primary")} onClick={() => setAktifSoru(a => a + 1)}>Sonraki →</button>
            ) : (
              <button style={S.btn("success")} onClick={() => hesapla(cevaplar, yaziliCevaplar)}>✓ Sınavı Tamamla</button>
            )}
          </div>
        </div>

        {/* Soru navigasyon paneli */}
        <div style={S.card}>
          <h3 style={{ ...S.h3, fontSize: 14, marginBottom: 14 }}>Sorular</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
            {sorular.map((s, i) => {
              const sTip = s.tip || "test";
              const cevaplandi = sTip === "test" ? cevaplar[s.id] !== undefined : (yaziliCevaplar[s.id] && yaziliCevaplar[s.id].trim().length > 0);
              return (
                <div key={s.id} onClick={() => setAktifSoru(i)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: aktifSoru === i ? "#3b82f6" : cevaplandi ? (sTip === "klasik" ? "#4c1d95" : "#166534") : "#0f172a",
                    border: `1.5px solid ${aktifSoru === i ? "#3b82f6" : cevaplandi ? (sTip === "klasik" ? "#6d28d9" : "#16a34a") : "#334155"}`,
                    color: aktifSoru === i || cevaplandi ? "#fff" : "#94a3b8",
                  }}>
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "#64748b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><div style={{ width: 12, height: 12, background: "#166534", borderRadius: 3 }} /> Test cevaplandı</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><div style={{ width: 12, height: 12, background: "#4c1d95", borderRadius: 3 }} /> Klasik yazıldı</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><div style={{ width: 12, height: 12, background: "#3b82f6", borderRadius: 3 }} /> Aktif</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, background: "#0f172a", border: "1px solid #334155", borderRadius: 3 }} /> Boş</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SONUÇLAR ─────────────────────────────────────────────────────────────────
function Sonuclar({ kullanici, sonuclar, sinavlar, kullanicilar, onSonucSil }) {
  const filtreli = kullanici.rol === "ogrenci" ? sonuclar.filter(s => s.kullaniciId === kullanici.id) : sonuclar;
  const [filtre, setFiltre] = useState("hepsi");
  const filtreliSonuclar = filtre === "hepsi" ? filtreli : filtreli.filter(r => {
    const sinav = sinavlar.find(s => s.id === r.sinavId);
    return filtre === "gecti" ? r.puan >= (sinav?.gecmeNotu || 60) : r.puan < (sinav?.gecmeNotu || 60);
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={S.h1}>📊 {kullanici.rol === "ogrenci" ? "Sonuçlarım" : "Sınav Sonuçları"}</h1>
          {kullanici.rol !== "ogrenci" && <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Tüm öğrencilerin sınav sonuçları</p>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["hepsi", "gecti", "kaldi"].map(f => (
            <button key={f} style={{ ...S.btn(filtre === f ? "primary" : "secondary"), padding: "8px 16px", fontSize: 13 }} onClick={() => setFiltre(f)}>
              {f === "hepsi" ? "Tümü" : f === "gecti" ? "✓ Geçti" : "✗ Kaldı"}
            </button>
          ))}
        </div>
      </div>
      {kullanici.rol !== "ogrenci" && filtreliSonuclar.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Toplam", val: filtreli.length, emoji: "📋", color: "#3b82f6" },
            { label: "Geçen", val: filtreli.filter(r => { const s = sinavlar.find(x => x.id === r.sinavId); return s && r.puan >= s.gecmeNotu; }).length, emoji: "✅", color: "#10b981" },
            { label: "Kalan", val: filtreli.filter(r => { const s = sinavlar.find(x => x.id === r.sinavId); return s && r.puan < s.gecmeNotu; }).length, emoji: "❌", color: "#ef4444" },
            { label: "Ort. Puan", val: filtreli.length ? Math.round(filtreli.reduce((a, b) => a + b.puan, 0) / filtreli.length) + "%" : "—", emoji: "🎯", color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} style={{ ...S.card, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, background: s.color + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.emoji}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {filtreliSonuclar.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p style={{ color: "#64748b" }}>Henüz sonuç bulunmuyor.</p>
        </div>
      ) : (
        <div style={S.card}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #334155" }}>
                {["Sınav", "Tip", "Öğrenci", "Puan", "Durum", "Tarih", ...(kullanici.rol === "admin" ? ["İşlem"] : [])].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#64748b", fontSize: 13, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtreliSonuclar.map((r, i) => {
                const sinav = sinavlar.find(s => s.id === r.sinavId);
                const gec = sinav ? r.puan >= sinav.gecmeNotu : false;
                const kul = kullanicilar.find(u => u.id === r.kullaniciId);
                const tipBadge = { test: "blue", klasik: "purple", karma: "orange" };
                const tipLabel = { test: "Test", klasik: "Klasik", karma: "Karma" };
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 500 }}>{sinav?.baslik || "—"}</td>
                    <td style={{ padding: "12px 14px" }}><Badge color={tipBadge[sinav?.tip] || "gray"}>{tipLabel[sinav?.tip] || sinav?.tip || "—"}</Badge></td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0, color: "#fff" }}>{kul?.ad?.[0] || "?"}</div>
                        <span style={{ color: "#94a3b8", fontSize: 14 }}>{kul?.ad || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}><span style={{ fontWeight: 700, fontSize: 16, color: gec ? "#10b981" : "#ef4444" }}>{r.puan}%</span></td>
                    <td style={{ padding: "12px 14px" }}><Badge color={gec ? "green" : "red"}>{gec ? "Geçti" : "Kaldı"}</Badge></td>
                    <td style={{ padding: "12px 14px", color: "#64748b", fontSize: 13 }}>{r.tarih}</td>
                    {kullanici.rol === "admin" && (
                      <td style={{ padding: "12px 14px" }}>
                        <button onClick={() => onSonucSil && onSonucSil(i)} style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>🗑</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── ADMİN KOMPONENTLERİ ─────────────────────────────────────────────────────
function AdminKullanicilar({ kullanicilar, onRolDegistir, onAktifToggle, onEkle, onSil }) {
  const [yeniForm, setYeniForm] = useState({ ad: "", email: "", sifre: "", rol: "ogrenci" });
  const [panel, setPanel] = useState(false);

  const handleEkle = () => {
    if (!yeniForm.ad || !yeniForm.email || !yeniForm.sifre) { alert("Tüm alanları doldurun."); return; }
    onEkle({ ...yeniForm, aktif: true, id: uniqueId() });
    setYeniForm({ ad: "", email: "", sifre: "", rol: "ogrenci" });
    setPanel(false);
  };

  const rolRenk = { admin: "red", ogretmen: "blue", ogrenci: "green" };
  const rolLabel = { admin: "Admin", ogretmen: "Öğretmen", ogrenci: "Öğrenci" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={S.h1}>👥 Kullanıcı Yönetimi</h1>
        <button style={S.btn("primary")} onClick={() => setPanel(p => !p)}>{panel ? "✕ İptal" : "+ Yeni Kullanıcı"}</button>
      </div>
      {panel && (
        <div style={{ ...S.card, marginBottom: 20, border: "1px solid #3b82f6" }}>
          <h3 style={{ ...S.h3, marginBottom: 16 }}>Yeni Kullanıcı Ekle</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <div><label style={S.label}>Ad Soyad</label><input style={S.input} placeholder="Ahmet Yılmaz" value={yeniForm.ad} onChange={e => setYeniForm(f => ({ ...f, ad: e.target.value }))} /></div>
            <div><label style={S.label}>E-posta</label><input style={S.input} placeholder="email@okul.com" value={yeniForm.email} onChange={e => setYeniForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label style={S.label}>Şifre</label><input style={S.input} type="password" placeholder="••••••" value={yeniForm.sifre} onChange={e => setYeniForm(f => ({ ...f, sifre: e.target.value }))} /></div>
            <div><label style={S.label}>Rol</label><select style={{ ...S.input }} value={yeniForm.rol} onChange={e => setYeniForm(f => ({ ...f, rol: e.target.value }))}><option value="ogrenci">Öğrenci</option><option value="ogretmen">Öğretmen</option><option value="admin">Admin</option></select></div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button style={S.btn("success")} onClick={handleEkle}>✅ Kullanıcı Ekle</button>
            <button style={S.btn("secondary")} onClick={() => setPanel(false)}>İptal</button>
          </div>
        </div>
      )}
      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #334155" }}>
              {["Kullanıcı", "E-posta", "Rol", "Durum", "Yetki Değiştir", "İşlemler"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#64748b", fontSize: 13, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kullanicilar.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "14px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{u.ad[0]}</div>
                    <div><div style={{ fontWeight: 600 }}>{u.ad}</div><div style={{ fontSize: 11, color: u.aktif ? "#10b981" : "#ef4444" }}>{u.aktif ? "● Aktif" : "● Pasif"}</div></div>
                  </div>
                </td>
                <td style={{ padding: "14px 14px", color: "#94a3b8", fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: "14px 14px" }}><Badge color={rolRenk[u.rol]}>{rolLabel[u.rol]}</Badge></td>
                <td style={{ padding: "14px 14px" }}><button onClick={() => onAktifToggle(u.id)} style={{ background: u.aktif ? "#166534" : "#7f1d1d", color: u.aktif ? "#bbf7d0" : "#fecaca", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}>{u.aktif ? "✓ Aktif" : "✗ Pasif"}</button></td>
                <td style={{ padding: "14px 14px" }}><select value={u.rol} onChange={e => onRolDegistir(u.id, e.target.value)} style={{ background: "#0f172a", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 6, padding: "5px 10px", fontSize: 13, cursor: "pointer" }}><option value="ogrenci">Öğrenci</option><option value="ogretmen">Öğretmen</option><option value="admin">Admin</option></select></td>
                <td style={{ padding: "14px 14px" }}><button onClick={() => { if (window.confirm(`${u.ad} silinsin mi?`)) onSil(u.id); }} style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>🗑 Sil</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminSinavlar({ sinavlar, kullanicilar, onSil, onDurumDegistir }) {
  const tipLabel = { test: "Test", klasik: "Klasik", karma: "Karma" };
  const tipBadge = { test: "blue", klasik: "purple", karma: "orange" };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={S.h1}>📝 Sınav Yönetimi</h1>
        <div style={{ color: "#64748b", fontSize: 14 }}>Toplam: {sinavlar.length} sınav</div>
      </div>
      {sinavlar.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: "48px 24px" }}><p style={{ color: "#64748b" }}>Henüz sınav oluşturulmamış.</p></div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sinavlar.map(s => {
            const olusturan = kullanicilar.find(u => u.id === s.olusturanId);
            return (
              <div key={s.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h3 style={{ ...S.h3, fontSize: 16 }}>{s.baslik}</h3>
                    <Badge color={s.durum === "yayinda" ? "green" : s.durum === "taslak" ? "gray" : "blue"}>{s.durum === "yayinda" ? "Yayında" : s.durum === "taslak" ? "Taslak" : "Bitti"}</Badge>
                    <Badge color={tipBadge[s.tip] || "gray"}>{tipLabel[s.tip] || s.tip}</Badge>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, display: "flex", gap: 20 }}>
                    <span>👤 {olusturan?.ad || "?"}</span><span>📅 {s.baslangicTarihi}</span><span>⏱ {s.sure} dk</span><span>❓ {s.sorular.length} soru</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={s.durum} onChange={e => onDurumDegistir(s.id, e.target.value)} style={{ background: "#0f172a", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 6, padding: "6px 10px", fontSize: 13, cursor: "pointer" }}>
                    <option value="taslak">Taslak</option><option value="yayinda">Yayında</option><option value="bitti">Bitti</option>
                  </select>
                  <button onClick={() => { if (window.confirm("Sınavı sil?")) onSil(s.id); }} style={{ ...S.btn("danger"), padding: "7px 14px", fontSize: 13 }}>🗑 Sil</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminRaporlar({ sinavlar, sonuclar, kullanicilar }) {
  const toplamKul = kullanicilar.length;
  const ogretmenSayisi = kullanicilar.filter(u => u.rol === "ogretmen").length;
  const ogrenciSayisi = kullanicilar.filter(u => u.rol === "ogrenci").length;
  const toplamSinav = sinavlar.length;
  const yayindakiSinav = sinavlar.filter(s => s.durum === "yayinda").length;
  const toplamSonuc = sonuclar.length;
  const gecenler = sonuclar.filter(r => { const s = sinavlar.find(x => x.id === r.sinavId); return s && r.puan >= s.gecmeNotu; }).length;
  const ortPuan = sonuclar.length ? Math.round(sonuclar.reduce((a, b) => a + b.puan, 0) / sonuclar.length) : 0;
  return (
    <div>
      <h1 style={{ ...S.h1, marginBottom: 24 }}>📈 Sistem Raporları</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[{ label: "Toplam Kullanıcı", val: toplamKul, emoji: "👥", color: "#3b82f6" }, { label: "Toplam Sınav", val: toplamSinav, emoji: "📝", color: "#10b981" }, { label: "Toplam Sonuç", val: toplamSonuc, emoji: "📊", color: "#8b5cf6" }, { label: "Ortalama Puan", val: ortPuan + "%", emoji: "🏆", color: "#f59e0b" }].map(s => (
          <div key={s.label} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, background: s.color + "20", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.emoji}</div>
            <div><div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div><div style={{ fontSize: 13, color: "#64748b" }}>{s.label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ ...S.h3, marginBottom: 16 }}>👥 Kullanıcı Dağılımı</h3>
          {[{ label: "Öğretmen", val: ogretmenSayisi, total: toplamKul, color: "#3b82f6" }, { label: "Öğrenci", val: ogrenciSayisi, total: toplamKul, color: "#10b981" }, { label: "Admin", val: kullanicilar.filter(u => u.rol === "admin").length, total: toplamKul, color: "#ef4444" }].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 14, color: "#94a3b8" }}>{item.label}</span><span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.val}</span></div>
              <div style={{ background: "#0f172a", borderRadius: 4, height: 8 }}><div style={{ width: `${item.total > 0 ? (item.val / item.total) * 100 : 0}%`, background: item.color, height: 8, borderRadius: 4 }} /></div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ ...S.h3, marginBottom: 16 }}>📊 Sınav İstatistikleri</h3>
          {[
            { label: "Test Sınavları", val: sinavlar.filter(s => s.tip === "test").length, total: Math.max(toplamSinav, 1), color: "#3b82f6" },
            { label: "Klasik Sınavlar", val: sinavlar.filter(s => s.tip === "klasik").length, total: Math.max(toplamSinav, 1), color: "#8b5cf6" },
            { label: "Karma Sınavlar", val: sinavlar.filter(s => s.tip === "karma").length, total: Math.max(toplamSinav, 1), color: "#f59e0b" },
            { label: "Geçme Oranı", val: gecenler, total: Math.max(toplamSonuc, 1), color: "#10b981", label2: `${toplamSonuc > 0 ? Math.round((gecenler / toplamSonuc) * 100) : 0}%` }
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 14, color: "#94a3b8" }}>{item.label}</span><span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.label2 || item.val}</span></div>
              <div style={{ background: "#0f172a", borderRadius: 4, height: 8 }}><div style={{ width: `${item.total > 0 ? (item.val / item.total) * 100 : 0}%`, background: item.color, height: 8, borderRadius: 4 }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ kullanicilar, sinavlar, sonuclar, onNavigate }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}><h1 style={S.h1}>⚙️ Sistem Yönetimi</h1><p style={{ color: "#64748b", marginTop: 6 }}>Admin Kontrol Paneli</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {[{ label: "Toplam Kullanıcı", val: kullanicilar.length, emoji: "👥", color: "#3b82f6", page: "kullanicilar" }, { label: "Toplam Sınav", val: sinavlar.length, emoji: "📝", color: "#10b981", page: "sinavlar" }, { label: "Toplam Sonuç", val: sonuclar.length, emoji: "📊", color: "#8b5cf6", page: "sonuclar" }, { label: "Aktif Sınav", val: sinavlar.filter(s => s.durum === "yayinda").length, emoji: "✅", color: "#f59e0b", page: "sinavlar" }].map(s => (
          <div key={s.label} onClick={() => onNavigate(s.page)} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"} onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}>
            <div style={{ width: 48, height: 48, background: s.color + "20", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.emoji}</div>
            <div><div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div><div style={{ fontSize: 13, color: "#64748b" }}>{s.label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ ...S.h3, marginBottom: 16 }}>Hızlı Erişim</h3>
          {[{ label: "Kullanıcı Yönetimi", emoji: "👥", desc: "Kullanıcı ekle, sil, rol değiştir", page: "kullanicilar" }, { label: "Sınav Yönetimi", emoji: "📝", desc: "Tüm sınavları görüntüle ve yönet", page: "sinavlar" }, { label: "Soru Bankası", emoji: "📚", desc: "Soruları yönet ve düzenle", page: "soru-bankasi" }, { label: "Sonuçlar", emoji: "📊", desc: "Tüm sınav sonuçlarını gör", page: "sonuclar" }, { label: "Raporlar", emoji: "📈", desc: "Sistem istatistikleri", page: "raporlar" }].map(i => (
            <div key={i.label} onClick={() => onNavigate(i.page)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#0f172a", borderRadius: 10, marginBottom: 10, cursor: "pointer", border: "1px solid #334155" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"} onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}>
              <span style={{ fontSize: 22 }}>{i.emoji}</span><div><div style={{ fontSize: 14, fontWeight: 600 }}>{i.label}</div><div style={{ fontSize: 12, color: "#64748b" }}>{i.desc}</div></div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ ...S.h3, marginBottom: 16 }}>Son Kullanıcılar</h3>
          {kullanicilar.slice(0, 5).map(u => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #334155" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{u.ad[0]}</div>
                <div><div style={{ fontWeight: 600, fontSize: 13 }}>{u.ad}</div><div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge color={u.rol === "admin" ? "red" : u.rol === "ogretmen" ? "blue" : "green"}>{u.rol === "ogretmen" ? "Öğretmen" : u.rol === "ogrenci" ? "Öğrenci" : "Admin"}</Badge>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.aktif ? "#10b981" : "#ef4444" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function App() {
  const [ekran, setEkran] = useState("rol-secim");
  const [rolSecim, setRolSecim] = useState(null);
  const [kullanici, setKullanici] = useState(null);
  const [aktifSayfa, setAktifSayfa] = useState("panel");
  const [aktifSinavId, setAktifSinavId] = useState(null);

  const [sinavlar, setSinavlar] = useLocalStorage("sinavlar_v3", INITIAL_SINAVLAR);
  const [sorularDB, setSorularDB] = useLocalStorage("sorular_v3", INITIAL_SORULAR);
  const [sonuclar, setSonuclar] = useLocalStorage("sonuclar_v3", []);
  const [kullanicilar, setKullanicilar] = useLocalStorage("kullanicilar_v3", INITIAL_USERS);

  const handleVeriSifirla = () => {
    if (window.confirm("Tüm veri sıfırlanacak. Onaylıyor musunuz?")) {
      ["sinavlar_v3", "sorular_v3", "sonuclar_v3", "kullanicilar_v3"].forEach(k => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  const handleRolSec = (rol) => { setRolSecim(rol); setEkran("giris"); };
  const handleGiris = (kul) => { setKullanici(kul); setEkran("app"); setAktifSayfa("panel"); };
  const handleCikis = () => { setKullanici(null); setEkran("rol-secim"); setRolSecim(null); };
  const handleNavigate = (sayfa, id = null) => { setAktifSayfa(sayfa); if (id) setAktifSinavId(id); };
  const handleSinavKaydet = (yeni) => setSinavlar(prev => [...prev, { ...yeni, id: uniqueId() }]);
  const handleSinavSil = (id) => { if (window.confirm("Bu sınavı silmek istediğinize emin misiniz?")) setSinavlar(prev => prev.filter(s => s.id !== id)); };
  const handleSoruEkle = (yeni) => {
    const liste = Array.isArray(yeni) ? yeni : [yeni];
    setSorularDB(prev => [...prev, ...liste.map(s => ({ ...s, id: uniqueId(), tip: s.tip || "test" }))]);
  };
  const handleSoruSil = (id) => setSorularDB(prev => prev.filter(s => s.id !== id));
  const handleSinavBitir = (sonuc) => { if (sonuc) setSonuclar(prev => [...prev, sonuc]); setAktifSayfa("panel"); };
  const handleSonucSil = (idx) => { if (window.confirm("Bu sonucu silmek istediğinize emin misiniz?")) setSonuclar(prev => prev.filter((_, i) => i !== idx)); };
  const handleRolDegistir = (id, yeniRol) => setKullanicilar(prev => prev.map(u => u.id === id ? { ...u, rol: yeniRol } : u));
  const handleAktifToggle = (id) => setKullanicilar(prev => prev.map(u => u.id === id ? { ...u, aktif: !u.aktif } : u));
  const handleKullaniciEkle = (yeni) => setKullanicilar(prev => [...prev, yeni]);
  const handleKullaniciSil = (id) => setKullanicilar(prev => prev.filter(u => u.id !== id));
  const handleSinavDurumDegistir = (id, durum) => setSinavlar(prev => prev.map(s => s.id === id ? { ...s, durum } : s));

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "sinav-global";
    style.textContent = `html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; } * { box-sizing: border-box; }`;
    document.head.appendChild(style);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    document.head.appendChild(script);
    return () => { const el = document.getElementById("sinav-global"); if (el) el.remove(); };
  }, []);

  if (ekran === "rol-secim") return <RolSecimEkrani onSelect={handleRolSec} onVeriSifirla={handleVeriSifirla} />;
  if (ekran === "giris") return <GirisEkrani rolSecim={rolSecim} kullanicilar={kullanicilar} onGiris={handleGiris} onGeri={() => setEkran("rol-secim")} />;

  const renderSayfa = () => {
    if (aktifSayfa === "sinav-olustur" && kullanici.rol === "ogretmen") {
      return <SinavOlustur kullanici={kullanici} sorularDB={sorularDB} onKaydet={handleSinavKaydet} onIptal={handleNavigate} onSoruEkle={handleSoruEkle} />;
    }
    if (aktifSayfa === "sinav-al") {
      const sinav = sinavlar.find(s => s.id === aktifSinavId);
      if (!sinav) return null;
      return <SinavAl sinav={sinav} sorularDB={sorularDB} kullanici={kullanici} onBitir={handleSinavBitir} />;
    }
    if (kullanici.rol === "ogretmen") {
      if (aktifSayfa === "panel") return <OgretmenPanel kullanici={kullanici} sinavlar={sinavlar} sonuclar={sonuclar} kullanicilar={kullanicilar} onNavigate={handleNavigate} />;
      if (aktifSayfa === "sinavlar") return <SinavListesiOgretmen kullanici={kullanici} sinavlar={sinavlar} onYeniSinav={() => setAktifSayfa("sinav-olustur")} onSil={handleSinavSil} />;
      if (aktifSayfa === "soru-bankasi") return <SoruBankasi sorular={sorularDB} onEkle={handleSoruEkle} onSil={handleSoruSil} />;
      if (aktifSayfa === "ogrenciler") return <OgretmenOgrenciler kullanicilar={kullanicilar} sonuclar={sonuclar} sinavlar={sinavlar} />;
      if (aktifSayfa === "sonuclar") return <Sonuclar kullanici={kullanici} sonuclar={sonuclar} sinavlar={sinavlar} kullanicilar={kullanicilar} />;
    }
    if (kullanici.rol === "ogrenci") {
      if (aktifSayfa === "panel") return <OgrenciPanel kullanici={kullanici} sinavlar={sinavlar} sonuclar={sonuclar} onNavigate={handleNavigate} />;
      if (aktifSayfa === "sinavlar") return <OgrenciPanel kullanici={kullanici} sinavlar={sinavlar} sonuclar={sonuclar} onNavigate={handleNavigate} />;
      if (aktifSayfa === "sonuclar") return <Sonuclar kullanici={kullanici} sonuclar={sonuclar} sinavlar={sinavlar} kullanicilar={kullanicilar} />;
    }
    if (kullanici.rol === "admin") {
      if (aktifSayfa === "panel") return <AdminPanel kullanicilar={kullanicilar} sinavlar={sinavlar} sonuclar={sonuclar} onNavigate={handleNavigate} />;
      if (aktifSayfa === "kullanicilar") return <AdminKullanicilar kullanicilar={kullanicilar} onRolDegistir={handleRolDegistir} onAktifToggle={handleAktifToggle} onEkle={handleKullaniciEkle} onSil={handleKullaniciSil} />;
      if (aktifSayfa === "sinavlar") return <AdminSinavlar sinavlar={sinavlar} kullanicilar={kullanicilar} onSil={handleSinavSil} onDurumDegistir={handleSinavDurumDegistir} />;
      if (aktifSayfa === "soru-bankasi") return <SoruBankasi sorular={sorularDB} onEkle={handleSoruEkle} onSil={handleSoruSil} />;
      if (aktifSayfa === "sonuclar") return <Sonuclar kullanici={kullanici} sonuclar={sonuclar} sinavlar={sinavlar} kullanicilar={kullanicilar} onSonucSil={handleSonucSil} />;
      if (aktifSayfa === "raporlar") return <AdminRaporlar sinavlar={sinavlar} sonuclar={sonuclar} kullanicilar={kullanicilar} />;
    }
    return <div style={{ color: "#64748b", padding: 40, textAlign: "center" }}>Bu sayfa yapım aşamasında.</div>;
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", width: "100%", height: "100%" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Layout kullanici={kullanici} aktifSayfa={aktifSayfa} onNavigate={handleNavigate} onCikis={handleCikis}>
        {renderSayfa()}
      </Layout>
    </div>
  );
}