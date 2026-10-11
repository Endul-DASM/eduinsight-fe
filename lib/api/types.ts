// Shapes the backend is expected to return. Keep these in sync with the API contract.

export type UserRole = "guru" | "siswa" | "admin";

export type CurrentUser = {
  id: string;
  // The username until a full name is filled in (BR-11).
  name: string;
  username: string;
  email: string;
  role: UserRole;
  initials: string;
};

export type TeacherSummary = {
  id: string;
  name: string;
  email: string;
};

// The backend accepts only SMP and SMA for now; SD is sent so grades 1–6 work once it does.
export type SchoolLevel = "SD" | "SMP" | "SMA";

export type SchoolClass = {
  id: string;
  name: string;
  level: SchoolLevel;
  academicYear: string;
};

// One subject taught in one class, e.g. Matematika for X IPA 1: the teacher's workspace.
export type Subject = {
  id: string;
  slug: string;
  name: string;
  kkmDefault: number;
  class: SchoolClass;
  teachers: TeacherSummary[];
  // Code students use to join the subject. Not provided by the backend yet.
  joinCode?: string | null;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  user: CurrentUser;
};

// POST /auth/register/{guru|siswa} (SRS FR-X-006). The role comes from the endpoint, never from the body.
export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

// POST /auth/google when the Google email has no account yet: the user still has to pick a username (SRS 6.1.1).
export type GoogleSignupRequired = {
  status: "needs_username";
  signupToken: string;
  email: string;
  suggestedUsername?: string;
};

export type GoogleExchangeResponse = LoginResponse | GoogleSignupRequired;

// Curriculum (GET /subjects/:id/curriculum), only the levels the assessment wizard needs.

export type IndicatorRef = {
  id: string;
  code: string | null;
  description: string;
  competencyId: string;
};

export type CompetencyRef = {
  id: string;
  code: string | null;
  description: string;
};

type CurriculumTreeNode = { id: string; code: string | null; description: string; position: number };

export type CurriculumTree = {
  subjectId: string;
  cps: (CurriculumTreeNode & {
    learningObjectives: (CurriculumTreeNode & {
      chapters: (CurriculumTreeNode & {
        subchapters: (CurriculumTreeNode & {
          competencies: (CurriculumTreeNode & { indicators: CurriculumTreeNode[] })[];
        })[];
      })[];
    })[];
  })[];
};

// Bank Soal (GET /subjects/:id/questions).

export type QuestionType = "pg" | "uraian";
export type BloomLevel = "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
export type CognitiveLevel = "LOTS" | "MOTS" | "HOTS";
export type QuestionStatus = "draft" | "pending_review" | "approved" | "rejected";

export type Question = {
  id: string;
  type: QuestionType;
  stem: string;
  options: { key: string; text: string; misconceptionTag: string | null }[] | null;
  answerKey: string;
  bloomLevel: BloomLevel | null;
  cognitiveLevel: CognitiveLevel | null;
  difficulty: "mudah" | "sedang" | "sulit" | null;
  origin: "manual" | "upload" | "ocr" | "ai";
  status: QuestionStatus;
  indicators: IndicatorRef[];
};

export type QuestionPage = {
  items: Question[];
  total: number;
};

// Assessment (PRD 5.4.1–5.4.2).

export type AssessmentType = "pre_test" | "post_test" | "ulangan_harian" | "uts" | "uas" | "remedial";
export type AssessmentMode = "daring" | "luring";
// Derived by the backend from the schedule (SRS 7.2).
export type AssessmentStatus = "draft" | "scheduled" | "ongoing" | "closed";

export type Assessment = {
  id: string;
  subjectId: string;
  title: string;
  type: AssessmentType;
  status: AssessmentStatus;
  kkm: number;
  // Null means the KKM is used (BR-02).
  remedialThreshold: number | null;
  opensAt: string | null;
  closesAt: string | null;
  durationMinutes: number | null;
  maxAttempts: number;
  mode: AssessmentMode;
  publishedAt: string | null;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
};

// Ringkasan otomatis (FR-G-044). Question numbers are positions in the assessment, starting at 1.
export type AssessmentSummary = {
  totalQuestions: number;
  byType: Record<QuestionType, number>;
  estimatedMinutes: number;
  cognitiveLevels: Record<CognitiveLevel | "unset", number>;
  bloomLevels: Record<BloomLevel, number>;
  blueprint: {
    competency: CompetencyRef;
    // False for a competency reached only through a question's indicator.
    selected: boolean;
    questionCount: number;
    indicators: { indicator: IndicatorRef; questionNumbers: number[] }[];
  }[];
  untaggedQuestionNumbers: number[];
  unreviewedQuestionNumbers: number[];
};

export type AssessmentDetail = Assessment & {
  competencies: CompetencyRef[];
  questions: Question[];
  summary: AssessmentSummary;
};
