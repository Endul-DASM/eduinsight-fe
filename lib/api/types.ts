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
  // Edit Profile; null until filled in.
  province: string | null;
  // Null without a photo. Changes whenever the photo does, so it also busts the cached image.
  photoUpdatedAt: string | null;
};

export type TeacherSummary = {
  id: string;
  name: string;
  email: string;
};

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
  // Code students use to join the subject; null for students.
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
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

// Sign-up while email verification is on (FR-X-008): no session until the emailed link is opened.
export type VerificationSent = {
  status: "verification_sent";
  email: string;
};

// With EMAIL_VERIFICATION_REQUIRED=false the backend signs the new account in straight away.
export type RegisterResponse = VerificationSent | LoginResponse;

// POST /auth/password/reset and /auth/password/change (FR-X-004).
export type NewPasswordInput = {
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

// Curriculum v3.2 (GET /subjects/:id/curriculum, SRS FR-G-020 – 025): CPs on their own, and Babs that pick one or
// more CPs and hold the TPs. Every TP belongs to one Bab and one of that Bab's CPs. The TP is what gets assessed.

export type LearningObjectiveRef = {
  id: string;
  // Bab number and position, e.g. "3.2".
  number: string;
  description: string;
  cpId: string;
  chapterId: string;
};

export type Fase = "D" | "E" | "F";

export type CurriculumCp = {
  id: string;
  code: string | null;
  // Elemen of the CP, e.g. Bilangan.
  element: string;
  fase: Fase;
  description: string;
  source: "guru" | "resmi";
  officialCpId: string | null;
  position: number;
};

export type CurriculumChapter = {
  id: string;
  number: number;
  name: string;
  notes: string | null;
  // Draft Babs are left out of Pilih TP, question tags and diagnosis (FR-G-023).
  status: "draft" | "final";
  cpIds: string[];
  learningObjectives: { id: string; number: string; cpId: string; description: string; keywords: string[]; position: number }[];
  subchapters: { id: string; name: string; position: number }[];
};

export type CurriculumTree = {
  subjectId: string;
  // Suggested from the class name for the CP import prompt; null when the grade cannot be read.
  suggestedFase: Fase | null;
  cps: CurriculumCp[];
  chapters: CurriculumChapter[];
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
  learningObjectives: LearningObjectiveRef[];
};

export type QuestionPage = {
  items: Question[];
  total: number;
};

// Assessment (PRD 5.4.1–5.4.2).

export type AssessmentType = "pre_test" | "post_test" | "ulangan_harian" | "uts" | "uas" | "remedial";
// What a remedial assessment does for its source (SRS 7.4); the backend uses "official" when none is sent.
export type RemedialKind = "official" | "reassessment";
export type AssessmentMode = "daring" | "luring";
// Derived by the backend from the schedule (SRS 7.2).
export type AssessmentStatus = "draft" | "scheduled" | "ongoing" | "closed";

export type Assessment = {
  id: string;
  subjectId: string;
  title: string;
  // Instructions for students, shown in their list.
  description: string | null;
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
  // Remedial only: the assessment it follows up (BR-08).
  sourceAssessmentId: string | null;
  remedialKind: RemedialKind | null;
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
  // Kisi-kisi per TP: selected TPs first, then TPs reached only through a question's tags.
  blueprint: {
    learningObjective: LearningObjectiveRef;
    // False for a TP reached only through a question's tags, not through Pilih TP.
    selected: boolean;
    questionCount: number;
    questionNumbers: number[];
  }[];
  untaggedQuestionNumbers: number[];
  unreviewedQuestionNumbers: number[];
};

export type AssessmentDetail = Assessment & {
  learningObjectives: LearningObjectiveRef[];
  questions: Question[];
  summary: AssessmentSummary;
};
