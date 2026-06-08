import { Suspense } from "react";
import Header from "@/components/Header";
import LeadForm from "@/components/LeadForm";

export default function FormaPage() {
  return (
    <div className="bg-gradient-to-br from-lampam-navy to-lampam-blue min-h-screen">
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Yuklanmoqda...</div>}>
        <LeadForm />
      </Suspense>
    </div>
  );
}
