import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QuestionImporter } from "@/components/admin/QuestionImporter";
import { BrandName } from "@/components/ui/BrandName";

export default async function AdminPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email !== adminEmail) redirect("/");
  }

  return (
    <div className="max-w-3xl mx-auto mt-4 pb-20 md:pb-0 space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800 flex items-center gap-2">
            Admin <BrandName className="text-2xl" />
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gestionnaire de questions personnalisées
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
        <QuestionImporter />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <strong>Tip :</strong> Les questions importées apparaissent dans le catalogue{" "}
        <code className="bg-amber-100 px-1 rounded">/types</code> et dans le pool du quiz quotidien et
        du multijoueur. Utilisez des IDs uniques pour éviter les collisions avec la banque intégrée.
      </div>
    </div>
  );
}
