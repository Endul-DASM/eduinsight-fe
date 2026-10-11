import { notFound } from "next/navigation";
import { AssessmentListPage } from "@/components/assessment/assessment-list-page";
import { AssessmentPage, assessmentTabOf } from "@/components/assessment/assessment-page";
import { MethodPicker } from "@/components/assessment/method-picker";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { isAssessmentStatus, isAssessmentType } from "@/lib/assessment-form";
import { getAssessmentCards } from "@/lib/assessment-list";
import { firstName } from "@/lib/display-name";

// /{slug}/assessment: Buat Asesmen, ?tab=daftar (with ?type= and ?status=) and ?tab=hasil.
export default async function AssessmentRoute({ params, searchParams }: PageProps<"/[subject]/assessment">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  // The layout already loaded the subject; getSubject is cached per request.
  const [user, subject] = await Promise.all([getCurrentUser(), getSubject(slug)]);
  if (!subject) notFound();

  const tab = assessmentTabOf(query.tab);
  const type = isAssessmentType(query.type) ? query.type : undefined;
  const status = isAssessmentStatus(query.status) ? query.status : undefined;

  return (
    <AssessmentPage slug={slug} tab={tab} teacherName={firstName(user.name)}>
      {tab === "buat" && <MethodPicker slug={slug} />}
      {tab === "daftar" && (
        <AssessmentListPage
          cards={await getAssessmentCards(subject, { type, status })}
          filtered={Boolean(type || status)}
          slug={slug}
        />
      )}
      {tab === "hasil" && (
        <section className={cn(sectionClassName, "items-center py-12 text-center")}>
          <p className="text-xl font-semibold text-[#1b1b1d]">Hasil Asesmen segera tersedia</p>
          <p className="max-w-[520px] text-sm leading-normal text-[#45474c]">
            Di sini nanti Anda bisa melihat performa kelas, siswa, per TP, dan per soal dari asesmen yang sudah
            dikerjakan.
          </p>
        </section>
      )}
    </AssessmentPage>
  );
}
