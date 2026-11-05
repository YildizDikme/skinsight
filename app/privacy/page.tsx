import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Notice · Aydınlatma Metni — Skinsight",
  description: "How Skinsight processes the photo you upload for skin analysis.",
};

// Replace these with your own details before you publish the site.
const OWNER = "Your name or company";
const CONTACT = "you@example.com";
const YOUCAM_PRIVACY = "https://www.makeupar.com/perfectbeauty/youcam/privacy-policy-api";

type Section = { title: string; body: React.ReactNode };

const TR: Section[] = [
  {
    title: "Veri sorumlusu",
    body: (
      <>
        {OWNER} · <Mail />
      </>
    ),
  },
  {
    title: "Bu site nedir?",
    body: "YouCam AI Skin Analysis API'sini tanıtmak için hazırlanmış, ücretsiz bir demo uygulamadır. Ürün satışı yapılmaz, hesap açılmaz, çerez kullanılmaz.",
  },
  {
    title: "Hangi veriler işlenir?",
    body: "Yalnızca analiz için yüklediğiniz yüz fotoğrafı ve bu fotoğrafa ait cilt analizi sonuçları. Ad, e-posta veya başka bir kişisel bilgi istenmez.",
  },
  {
    title: "Amaç ve hukuki sebep",
    body: "Fotoğrafınız yalnızca talep ettiğiniz cilt analizini yapmak ve sonucu size göstermek amacıyla, analiz öncesinde verdiğiniz açık rızaya dayanılarak işlenir (6698 sayılı KVKK md. 5, 6 ve 9).",
  },
  {
    title: "Yurt dışına aktarım",
    body: (
      <>
        Analiz için fotoğrafınız Perfect Corp.&apos;a (YouCam) ait, ABD&apos;de bulunan sunuculara
        gönderilir. Site, ABD merkezli Vercel altyapısında barındırılır ve fotoğraf bu altyapı
        üzerinden iletilir. Bu aktarım açık rızanıza dayanır. YouCam&apos;in veri işleme koşulları
        için: <ExternalLink href={YOUCAM_PRIVACY}>YouCam API Gizlilik Politikası</ExternalLink>.
      </>
    ),
  },
  {
    title: "Saklama süresi",
    body: "Bu sitenin bir veritabanı yoktur; fotoğrafınız yalnızca analiz isteği sırasında işlenip YouCam'e iletilir. YouCam, kendi gizlilik politikasına göre verileri genel olarak her oturumdan sonra 30 gün saklar.",
  },
  {
    title: "Tıbbi değildir",
    body: "Sonuçlar kozmetik amaçlı bir cilt analizidir; tıbbi teşhis, tedavi veya tıbbi tavsiye niteliği taşımaz.",
  },
  {
    title: "Haklarınız",
    body: (
      <>
        KVKK md. 11 kapsamında verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme,
        düzeltme, silme ve itiraz etme haklarına sahipsiniz. Açık rızanızı dilediğiniz zaman geri
        alabilirsiniz. Başvurularınız için: <Mail />
      </>
    ),
  },
];

const EN: Section[] = [
  {
    title: "Data controller",
    body: (
      <>
        {OWNER} · <Mail />
      </>
    ),
  },
  {
    title: "What is this site?",
    body: "A free demo built to showcase the YouCam AI Skin Analysis API. Nothing is sold, no accounts are created and no cookies are used.",
  },
  {
    title: "What data is processed?",
    body: "Only the face photo you upload for analysis and the skin analysis results for that photo. No name, email or other personal information is requested.",
  },
  {
    title: "Purpose and legal basis",
    body: "Your photo is processed only to run the skin analysis you request and show you the result, based on the explicit consent you give before analyzing.",
  },
  {
    title: "International transfer",
    body: (
      <>
        To run the analysis, your photo is sent to servers operated by Perfect Corp. (YouCam) in
        the USA. The site is hosted on Vercel infrastructure in the USA, and the photo passes
        through it. This transfer is based on your explicit consent. See YouCam&apos;s terms:{" "}
        <ExternalLink href={YOUCAM_PRIVACY}>YouCam API Privacy Policy</ExternalLink>.
      </>
    ),
  },
  {
    title: "Retention",
    body: "This site has no database; your photo is only processed while your analysis request runs and forwarded to YouCam. Under its own privacy policy, YouCam generally retains data for 30 days after each session.",
  },
  {
    title: "Not medical",
    body: "Results are a cosmetic skin analysis and are not a medical diagnosis, treatment or medical advice.",
  },
  {
    title: "Your rights",
    body: (
      <>
        You can ask whether your data is processed, request information, correction or deletion,
        and object to processing. You can withdraw your consent at any time. Contact: <Mail />
      </>
    ),
  },
];

function Mail() {
  return (
    <a href={`mailto:${CONTACT}`} className="text-ink underline decoration-ink/30 underline-offset-2">
      {CONTACT}
    </a>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-ink underline decoration-ink/30 underline-offset-2"
    >
      {children}
    </a>
  );
}

function Notice({ lang, heading, sections }: { lang: string; heading: string; sections: Section[] }) {
  return (
    <section lang={lang} className="rounded-[2rem] bg-ink/[0.035] p-1.5 ring-1 ring-ink/[0.06]">
      <div className="rounded-[calc(2rem-0.375rem)] bg-paper px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] md:px-10 md:py-10">
        <h2 className="font-serif text-[34px] leading-none">{heading}</h2>
        <dl className="mt-8 space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="grid gap-1.5 md:grid-cols-[200px_1fr] md:gap-8">
              <dt className="text-[12px] uppercase tracking-[0.16em] text-ink-faint md:pt-1">{s.title}</dt>
              <dd className="text-[15px] leading-relaxed text-ink-soft">{s.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-24 pt-12 md:px-8 md:pt-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-paper/70 px-4 py-2 text-[13px] text-ink-soft ring-1 ring-ink/[0.07] transition-colors hover:text-ink"
      >
        ← Skinsight
      </Link>
      <h1 className="mt-10 font-serif text-[clamp(2.75rem,7vw,5rem)] leading-[0.92] tracking-[-0.02em]">
        Aydınlatma Metni
        <br />
        <span className="italic text-accent">Privacy Notice</span>
      </h1>
      <p className="mt-5 text-[13px] text-ink-faint">Son güncelleme / Last updated: 2 Kasım 2026 · November 2, 2026</p>

      <div className="mt-12 space-y-6">
        <Notice lang="tr" heading="Türkçe" sections={TR} />
        <Notice lang="en" heading="English" sections={EN} />
      </div>
    </main>
  );
}
