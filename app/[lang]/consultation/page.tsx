// app/id/consultation/page.tsx
import { TaxConsultWizard } from '@/components/consultation/TaxConsultWizard';

export default function ConsultationPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-10 pt-6 md:pt-8">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <TaxConsultWizard lang="id" />
      </div>
    </main>
  );
}
