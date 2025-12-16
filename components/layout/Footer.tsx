// components/layout/Footer.tsx
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils';

type FooterTranslations = {
  brandName?: string;
  tagline?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  servicesTitle?: string;
  servicesIndividu?: string;
  servicesCompany?: string;
  servicesConsult?: string;
  servicesPlanning?: string;

  companyTitle?: string;
  about?: string;
  team?: string;
  career?: string;
  blog?: string;

  helpTitle?: string;
  faq?: string;
  contactUs?: string;
  guide?: string;
  privacy?: string;

  followUsLabel?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialLinkedIn?: string;

  copyright?: string; // kalau mau custom full kalimat
};

type Props = {
  t?: FooterTranslations;
};

export function Footer({ t }: Props) {
  const year = new Date().getFullYear();

  const brandName = t?.brandName ?? 'CekPajak';
  const brandTagline =
    t?.tagline ??
    'Trusted online tax consultation platform for individuals and businesses in Indonesia.';

  const contact = {
    email: t?.contact?.email ?? 'info@cekpajak.co.id',
    phone: t?.contact?.phone ?? '+62 821 1234 5678',
    address: t?.contact?.address ?? 'Jakarta, Indonesia',
  };

  const columns: Array<{
    title: string;
    links: { label: string; href: string }[];
  }> = [
    {
      title: t?.servicesTitle ?? 'Services',
      links: [
        {
          label: t?.servicesIndividu ?? 'Individual Tax',
          href: '#layanan',
        },
        {
          label: t?.servicesCompany ?? 'Corporate Tax',
          href: '#layanan',
        },
        {
          label: t?.servicesConsult ?? 'Consultation',
          href: '/request',
        },
        {
          label: t?.servicesPlanning ?? 'Tax Planning',
          href: '#layanan',
        },
      ],
    },
    {
      title: t?.companyTitle ?? 'Company',
      links: [
        { label: t?.about ?? 'About Us', href: '#tentang' },
        { label: t?.team ?? 'Team', href: '#' },
        { label: t?.career ?? 'Careers', href: '#' },
        { label: t?.blog ?? 'Blog', href: '#' },
      ],
    },
    {
      title: t?.helpTitle ?? 'Support',
      links: [
        { label: t?.faq ?? 'FAQ', href: '#faq' },
        { label: t?.contactUs ?? 'Contact Us', href: '/request' },
        { label: t?.guide ?? 'Guides', href: '#' },
        { label: t?.privacy ?? 'Privacy Policy', href: '#' },
      ],
    },
  ];

  const followUsLabel = t?.followUsLabel ?? 'Follow us:';

  const copyrightText =
    t?.copyright ?? `© ${year} ${brandName}. All rights reserved.`;

  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="border-t border-emerald-500/20 bg-gradient-to-t from-slate-950 via-slate-950 to-slate-900">
        <Container className="py-10 md:py-12">
          {/* Top: brand + columns */}
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            {/* Brand + kontak */}
            <div className="max-w-md">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-500/40">
                  CP
                </div>
                <span className="text-base font-semibold text-white">
                  {brandName}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-400">{brandTagline}</p>

              <div className="mt-4 space-y-1.5 text-sm text-slate-300">
                <div>
                  <span className="font-medium text-slate-200">Email: </span>
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-emerald-400"
                  >
                    {contact.email}
                  </a>
                </div>
                <div>
                  <span className="font-medium text-slate-200">Tel: </span>
                  <a
                    href={`tel:${contact.phone}`}
                    className="hover:text-emerald-400"
                  >
                    {contact.phone}
                  </a>
                </div>
                <div>
                  <span className="font-medium text-slate-200">Address: </span>
                  <span>{contact.address}</span>
                </div>
              </div>
            </div>

            {/* Link columns */}
            <div className="grid flex-1 gap-6 sm:grid-cols-3">
              {columns.map((col, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-semibold text-white">
                    {col.title}
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {link.href.startsWith('http') ? (
                          <a
                            href={link.href}
                            className="text-slate-400 hover:text-emerald-400"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-slate-400 hover:text-emerald-400"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-start gap-4 border-t border-slate-800 pt-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>{copyrightText}</p>

            <div className="flex items-center gap-3">
              <span className="text-slate-500">{followUsLabel}</span>
              <SocialDot label={t?.socialFacebook ?? 'F'} />
              <SocialDot label={t?.socialTwitter ?? 'T'} />
              <SocialDot label={t?.socialInstagram ?? 'I'} />
              <SocialDot label={t?.socialLinkedIn ?? 'in'} />
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}

type SocialDotProps = {
  label: string;
  href?: string;
};

function SocialDot({ label, href }: SocialDotProps) {
  const base = (
    <span
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-200',
        'hover:bg-emerald-600 hover:text-emerald-50 transition'
      )}
    >
      {label}
    </span>
  );

  if (!href) return base;

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {base}
    </a>
  );
}
