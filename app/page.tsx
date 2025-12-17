// app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // setiap akses "/" akan diarahkan ke "/id"
  redirect('/id');
}
