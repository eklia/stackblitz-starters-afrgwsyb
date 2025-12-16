// lib/i18n.ts
import { Lang } from './types';

type HeroTranslation = {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  titleEm: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  ratingMain: string;
  calculatorCta: string;
  calculatorHelper: string;
};

type StatsTranslation = {
  items: { value: string; label: string }[];
};

type WhyChooseTranslation = {
  heading: string;
  highlight: string;
  subtitle: string;
  cards: { title: string; body: string }[];
};

type ServiceItem = {
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  priceLabel: string;
  priceValue: string;
  ctaLabel: string;
  tagNumber: string;
  tagLabel: string;
};

type ServicesTranslation = {
  heading: string;
  highlight: string;
  subtitle: string;
  items: ServiceItem[];
};

type IndustriesTranslation = {
  heading: string;
  highlight: string;
  subtitle: string;
  items: string[];
};

type PartnersTranslation = {
  heading: string;
  subtitle: string;
  items: string[];
};

type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
};

type TestimonialsTranslation = {
  heading: string;
  highlight: string;
  subtitle: string;
  items: TestimonialItem[];
};

type FAQItem = {
  question: string;
  answer: string;
};

type FAQTranslation = {
  heading: string;
  highlight: string;
  subtitle: string;
  items: FAQItem[];
  moreQuestion: string;
  contactLink: string;
};

type CTASectionTranslation = {
  headingLine1: string;
  headingLine2: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
};

export type FooterTranslation = {
  brandName: string;
  tagline: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  servicesTitle: string;
  servicesIndividu: string;
  servicesCompany: string;
  servicesConsult: string;
  servicesPlanning: string;

  companyTitle: string;
  about: string;
  team: string;
  career: string;
  blog: string;

  helpTitle: string;
  faq: string;
  contactUs: string;
  guide: string;
  privacy: string;

  followUsLabel: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedIn: string;

  copyright: string;
};

export type Translations = {
  hero: HeroTranslation;
  stats: StatsTranslation;
  whyChoose: WhyChooseTranslation;
  services: ServicesTranslation;
  industries: IndustriesTranslation;
  partners: PartnersTranslation;
  testimonials: TestimonialsTranslation;
  faq: FAQTranslation;
  cta: CTASectionTranslation;
  footer: FooterTranslation;
};

const translations: Record<Lang, Translations> = {
  id: {
    hero: {
      badge: 'Terpercaya oleh 3500+ Klien',
      titleLine1: 'Kelola Pajak Anda',
      titleLine2: 'dengan Mudah dan',
      titleEm: 'Aman',
      subtitle:
        'Layanan konsultasi pajak profesional untuk individu dan perusahaan. Online dan offline, dengan proses transparan dan pembayaran aman melalui CeK Pajak.',
      primaryCta: 'Mulai Konsultasi',
      secondaryCta: 'Pelajari Layanan',
      ratingMain: '3500+ Klien Puas',
      calculatorCta: 'Coba Kalkulator Pajak',
      calculatorHelper: 'Gratis untuk kalkulator dasar PPh21 & fitur simulasi lainnya.',
    },
    stats: {
      items: [
        { value: '3500+', label: 'Klien Terpuaskan' },
        { value: '25k+', label: 'Konsultasi Selesai' },
        { value: '18,450+', label: 'Laporan Pajak Diproses' },
        { value: '98%', label: 'Tingkat Kepuasan' },
      ],
    },
    whyChoose: {
      heading: 'Mengapa Memilih',
      highlight: 'CekPajak?',
      subtitle:
        'Kami memberikan layanan pajak terbaik dengan standar profesional dan harga yang kompetitif.',
      cards: [
        {
          title: 'Harga Terjangkau',
          body: 'Paket layanan yang sesuai dengan budget dan kebutuhan Anda, tanpa biaya tersembunyi.',
        },
        {
          title: 'Transparan & Profesional',
          body: 'Harga jelas, alur kerja rapi, dan setiap langkah terdokumentasi dengan baik.',
        },
        {
          title: 'Keamanan Terjamin',
          body: 'Data Anda dilindungi dengan standar keamanan tinggi dan dijaga kerahasiaannya.',
        },
        {
          title: 'Online & Offline',
          body: 'Bisa konsultasi jarak jauh atau kirim mitra langsung ke lokasi Anda sesuai kebutuhan.',
        },
        {
          title: 'Proses Cepat',
          body: 'Upload dokumen, kami proses, Anda terima laporan. Sesederhana itu.',
        },
        {
          title: 'Selalu Update',
          body: 'Mengikuti regulasi perpajakan terbaru agar Anda tetap patuh tanpa repot.',
        },
      ],
    },
    services: {
      heading: 'Layanan',
      highlight: 'Kami',
      subtitle:
        'Solusi pajak lengkap untuk individu dan perusahaan dengan harga terjangkau.',
      items: [
        {
          badge: 'Individu',
          title: 'Solusi Pajak untuk Individu',
          description:
            'Layanan pajak pribadi yang mudah dan tepercaya untuk WNI, TKI, dan WNA di Indonesia.',
          bullets: [
            'SPT Tahunan Pribadi',
            'Analisa Kesesuaian Pajak',
            'Konsultasi Pajak Personal',
            'Perencanaan Pajak Individu',
          ],
          priceLabel: 'Mulai dari',
          priceValue: 'Rp 150.000',
          ctaLabel: 'Pelajari Lebih Lanjut',
          tagNumber: '1',
          tagLabel: 'Individu',
        },
        {
          badge: 'Perusahaan',
          title: 'Layanan Pajak Perusahaan',
          description:
            'Solusi lengkap untuk UMKM hingga perusahaan besar dengan harga yang kompetitif.',
          bullets: [
            'SPT Bulanan & Tahunan',
            'Laporan Keuangan',
            'Tax Planning Strategis',
            'Pendampingan Pemeriksaan',
          ],
          priceLabel: 'Harga',
          priceValue: 'Paket Custom',
          ctaLabel: 'Pelajari Lebih Lanjut',
          tagNumber: '2',
          tagLabel: 'Perusahaan',
        },
        {
          badge: 'Konsultasi',
          title: 'Konsultasi Pajak Profesional',
          description:
            'Dapatkan jawaban dari konsultan pajak berpengalaman untuk keputusan yang tepat.',
          bullets: [
            'Konsultasi 1-on-1',
            'Review Dokumen Pajak',
            'Second Opinion Kasus Pajak',
            'Paket Berlangganan',
          ],
          priceLabel: 'Mulai dari',
          priceValue: 'Rp 300.000/sesi',
          ctaLabel: 'Pelajari Lebih Lanjut',
          tagNumber: '3',
          tagLabel: 'Konsultasi',
        },
      ],
    },
    industries: {
      heading: 'Melayani Berbagai',
      highlight: 'Industri',
      subtitle:
        'Kami memiliki pengalaman menangani pajak untuk berbagai sektor bisnis.',
      items: [
        'E-Commerce',
        'Manufaktur',
        'Perdagangan',
        'Jasa Profesional',
        'Teknologi',
        'F&B',
        'Ekspor-Impor',
        'Properti',
        'Kesehatan',
        'Pendidikan',
        'Konstruksi',
        'Retail',
      ],
    },
    partners: {
      heading: 'Dipercaya Oleh',
      subtitle: 'Kami bermitra dengan berbagai institusi dan bisnis ternama.',
      items: [
        'Partner 1',
        'Partner 2',
        'Partner 3',
        'Partner 4',
        'Partner 5',
        'Partner 6',
      ],
    },
    testimonials: {
      heading: 'Kata',
      highlight: 'Mereka',
      subtitle:
        'Dengarkan pengalaman klien kami yang telah merasakan manfaat layanan CekPajak.',
      items: [
        {
          quote:
            'CekPajak sangat membantu startup kami mengelola pajak dengan mudah. Tim yang profesional dan responsif!',
          name: 'Andi Prasetyo',
          role: 'Founder, TechStart Indonesia',
        },
        {
          quote:
            'Sebagai freelancer, saya sangat terbantu dengan layanan pajak individu dari CekPajak. Prosesnya cepat dan harga terjangkau.',
          name: 'Siti Nurhaliza',
          role: 'Freelance Designer',
        },
        {
          quote:
            'Sudah 2 tahun menggunakan CekPajak untuk perusahaan saya. Sangat puas dengan pelayanan dan hasilnya.',
          name: 'Budi Santoso',
          role: 'Owner, Santoso Trading',
        },
      ],
    },
    faq: {
      heading: 'Pertanyaan',
      highlight: 'Umum',
      subtitle: 'Temukan jawaban untuk pertanyaan yang sering diajukan.',
      items: [
        {
          question: 'Apa itu CekPajak?',
          answer:
            'CekPajak adalah platform yang menghubungkan Anda dengan konsultan pajak profesional, baik untuk konsultasi online maupun kunjungan langsung.',
        },
        {
          question: 'Bagaimana cara menggunakan layanan CekPajak?',
          answer:
            'Anda dapat mengisi form permintaan di website, memilih jenis layanan yang dibutuhkan, dan tim kami akan menghubungi Anda untuk langkah selanjutnya.',
        },
        {
          question: 'Apakah data saya aman?',
          answer:
            'Kami menerapkan standar keamanan yang tinggi dan menjaga kerahasiaan data Anda sesuai kebijakan privasi dan peraturan yang berlaku.',
        },
        {
          question: 'Apakah layanan sepenuhnya online?',
          answer:
            'Sebagian besar proses dapat dilakukan secara online. Namun, untuk kebutuhan tertentu, kami juga dapat mengirim mitra ke lokasi Anda.',
        },
        {
          question: 'Berapa lama proses penyelesaian?',
          answer:
            'Waktu penyelesaian tergantung jenis layanan dan kompleksitas kasus, namun rata-rata 2–5 hari kerja setelah dokumen lengkap.',
        },
      ],
      moreQuestion: 'Masih ada pertanyaan?',
      contactLink: 'Hubungi Tim Kami',
    },
    cta: {
      headingLine1: 'Siap Kelola Pajak dengan',
      headingLine2: 'Lebih Baik?',
      subtitle:
        'Bergabunglah dengan ribuan klien yang telah mempercayakan urusan pajak mereka kepada CekPajak.',
      primaryCta: 'Mulai Sekarang',
      secondaryCta: 'Hubungi Kami',
    },
    footer: {
      brandName: 'CekPajak',
      tagline:
        'Platform konsultasi pajak online terpercaya untuk individu dan perusahaan di Indonesia.',
      contact: {
        email: 'info@cekpajak.co.id',
        phone: '+62 821 1234 5678',
        address: 'Jakarta, Indonesia',
      },
      servicesTitle: 'Layanan',
      servicesIndividu: 'Pajak Individu',
      servicesCompany: 'Pajak Perusahaan',
      servicesConsult: 'Konsultasi',
      servicesPlanning: 'Tax Planning',

      companyTitle: 'Perusahaan',
      about: 'Tentang Kami',
      team: 'Tim',
      career: 'Karier',
      blog: 'Blog',

      helpTitle: 'Bantuan',
      faq: 'FAQ',
      contactUs: 'Hubungi Kami',
      guide: 'Panduan',
      privacy: 'Kebijakan Privasi',

      followUsLabel: 'Ikuti kami:',
      socialFacebook: 'F',
      socialTwitter: 'T',
      socialInstagram: 'I',
      socialLinkedIn: 'in',

      copyright: '© 2025 CekPajak. Semua hak dilindungi.',
    },
  },

  // ================= ENGLISH =================
  en: {
    hero: {
      badge: 'Trusted by 3500+ Clients',
      titleLine1: 'Manage Your Taxes',
      titleLine2: 'Easily and',
      titleEm: 'Safely',
      subtitle:
        'Professional tax consulting services for individuals and businesses. Online and on-site, with transparent processes and secure payments through CeK Pajak.',
      primaryCta: 'Start Consultation',
      secondaryCta: 'Explore Services',
      ratingMain: '3500+ Happy Clients',
      calculatorCta: 'Try Tax Calculators',
      calculatorHelper: 'Free basic PPh21 calculator and other simulation tools.',
    },
    stats: {
      items: [
        { value: '3500+', label: 'Satisfied Clients' },
        { value: '25k+', label: 'Consultations Completed' },
        { value: '18,450+', label: 'Tax Reports Processed' },
        { value: '98%', label: 'Satisfaction Rate' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose',
      highlight: 'CekPajak?',
      subtitle:
        'We provide high-standard tax services with professional quality and competitive pricing.',
      cards: [
        {
          title: 'Affordable Pricing',
          body: 'Service packages tailored to your budget and needs, with no hidden fees.',
        },
        {
          title: 'Transparent & Professional',
          body: 'Clear pricing, structured workflows, and proper documentation at every step.',
        },
        {
          title: 'Secure & Confidential',
          body: 'Your data is protected with strong security practices and kept confidential.',
        },
        {
          title: 'Online & On-Site',
          body: 'Consult remotely or request an expert to visit your location when needed.',
        },
        {
          title: 'Fast Process',
          body: 'Upload your documents, we handle the rest, you receive the results.',
        },
        {
          title: 'Always Updated',
          body: 'We follow the latest tax regulations so you stay compliant without the hassle.',
        },
      ],
    },
    services: {
      heading: 'Our',
      highlight: 'Services',
      subtitle:
        'Comprehensive tax solutions for individuals and businesses at accessible pricing.',
      items: [
        {
          badge: 'Individual',
          title: 'Tax Solutions for Individuals',
          description:
            'Simple and reliable personal tax services for residents and non-residents in Indonesia.',
          bullets: [
            'Annual Personal Tax Returns',
            'Tax Compliance Review',
            'Personal Tax Consultation',
            'Individual Tax Planning',
          ],
          priceLabel: 'Starting from',
          priceValue: 'IDR 150,000',
          ctaLabel: 'Learn More',
          tagNumber: '1',
          tagLabel: 'Individual',
        },
        {
          badge: 'Business',
          title: 'Corporate Tax Services',
          description:
            'End-to-end solutions for SMEs up to large enterprises at competitive pricing.',
          bullets: [
            'Monthly & Annual Corporate Returns',
            'Financial Reports',
            'Strategic Tax Planning',
            'Audit & Investigation Support',
          ],
          priceLabel: 'Pricing',
          priceValue: 'Custom Packages',
          ctaLabel: 'Learn More',
          tagNumber: '2',
          tagLabel: 'Business',
        },
        {
          badge: 'Consultation',
          title: 'Professional Tax Consultation',
          description:
            'Get answers from experienced tax consultants to support better decisions.',
          bullets: [
            '1-on-1 Consultation',
            'Document Review',
            'Second Opinion on Tax Cases',
            'Subscription Packages',
          ],
          priceLabel: 'Starting from',
          priceValue: 'IDR 300,000 / session',
          ctaLabel: 'Learn More',
          tagNumber: '3',
          tagLabel: 'Consultation',
        },
      ],
    },
    industries: {
      heading: 'Serving Multiple',
      highlight: 'Industries',
      subtitle:
        'We have experience handling tax matters across various business sectors.',
      items: [
        'E-Commerce',
        'Manufacturing',
        'Trading',
        'Professional Services',
        'Technology',
        'F&B',
        'Export-Import',
        'Property',
        'Healthcare',
        'Education',
        'Construction',
        'Retail',
      ],
    },
    partners: {
      heading: 'Trusted By',
      subtitle: 'We partner with reputable institutions and businesses.',
      items: [
        'Partner 1',
        'Partner 2',
        'Partner 3',
        'Partner 4',
        'Partner 5',
        'Partner 6',
      ],
    },
    testimonials: {
      heading: 'What Our',
      highlight: 'Clients Say',
      subtitle:
        'Hear from clients who have experienced the benefits of working with CekPajak.',
      items: [
        {
          quote:
            'CekPajak has made it much easier for our startup to manage taxes. The team is professional and responsive.',
          name: 'Andi Prasetyo',
          role: 'Founder, TechStart Indonesia',
        },
        {
          quote:
            'As a freelancer, I really appreciate how CekPajak handles my personal tax matters quickly and affordably.',
          name: 'Siti Nurhaliza',
          role: 'Freelance Designer',
        },
        {
          quote:
            "We've been using CekPajak for two years for our company. Very satisfied with their service and results.",
          name: 'Budi Santoso',
          role: 'Owner, Santoso Trading',
        },
      ],
    },
    faq: {
      heading: 'Frequently Asked',
      highlight: 'Questions',
      subtitle: 'Find answers to the questions we receive most often.',
      items: [
        {
          question: 'What is CekPajak?',
          answer:
            'CekPajak is a platform that connects you with professional tax consultants, for both online consultations and on-site visits.',
        },
        {
          question: 'How do I use CekPajak services?',
          answer:
            'You can submit a request form on the website, choose the service you need, and our team will contact you for the next steps.',
        },
        {
          question: 'Is my data secure?',
          answer:
            'We apply strict security standards and keep your data confidential in line with our privacy policy and applicable regulations.',
        },
        {
          question: 'Is the service fully online?',
          answer:
            'Most processes can be handled online. For specific needs, we can also send our partners to your location.',
        },
        {
          question: 'How long does the process take?',
          answer:
            'The processing time depends on the service type and case complexity, but on average 2–5 business days after all documents are complete.',
        },
      ],
      moreQuestion: 'Still have questions?',
      contactLink: 'Contact Our Team',
    },
    cta: {
      headingLine1: 'Ready to Manage Your Taxes',
      headingLine2: 'Better?',
      subtitle:
        'Join thousands of clients who already trust CekPajak with their tax matters.',
      primaryCta: 'Get Started',
      secondaryCta: 'Contact Us',
    },
    footer: {
      brandName: 'CekPajak',
      tagline:
        'Trusted tax consultation platform for individuals and businesses in Indonesia.',
      contact: {
        email: 'info@cekpajak.co.id',
        phone: '+62 821 1234 5678',
        address: 'Jakarta, Indonesia',
      },
      servicesTitle: 'Services',
      servicesIndividu: 'Individual Tax',
      servicesCompany: 'Corporate Tax',
      servicesConsult: 'Consultation',
      servicesPlanning: 'Tax Planning',

      companyTitle: 'Company',
      about: 'About Us',
      team: 'Team',
      career: 'Careers',
      blog: 'Blog',

      helpTitle: 'Support',
      faq: 'FAQ',
      contactUs: 'Contact Us',
      guide: 'Guides',
      privacy: 'Privacy Policy',

      followUsLabel: 'Follow us:',
      socialFacebook: 'F',
      socialTwitter: 'T',
      socialInstagram: 'I',
      socialLinkedIn: 'in',

      copyright: '© 2025 CekPajak. All rights reserved.',
    },
  },
};

export function getTranslations(lang: Lang): Translations {
  return translations[lang] ?? translations.id;
}
