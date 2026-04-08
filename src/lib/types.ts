export type MemberRole =
  | "system_admin"
  | "office_staff"
  | "editor"
  | "member";

export type MemberStatus = "active" | "inactive" | "suspended" | "withdrawn";

export type MemberType =
  | "regular"
  | "associate"
  | "family"
  | "student"
  | "supporting"
  | "honorary";

export type ApplicationStatus =
  | "unreviewed"
  | "reviewing"
  | "awaiting_documents"
  | "under_examination"
  | "staff_approved"
  | "approved"
  | "rejected";

export type SeminarStatus = "draft" | "published" | "closed" | "cancelled";

export type ContactCategory =
  | "general"
  | "membership"
  | "seminar"
  | "complaint"
  | "other";

export type NewsCategory =
  | "notice"
  | "important"
  | "seminar_info"
  | "member_only";

export interface Member {
  id: string;
  auth_id: string | null;
  member_number: string;
  name: string;
  name_kana: string;
  email: string;
  phone: string;
  postal_code: string;
  address: string;
  clinic_name: string | null;
  member_type: MemberType;
  role: MemberRole;
  status: MemberStatus;
  qualifications: string | null;
  practice_years: number | null;
  is_public: boolean;
  business_hours: string | null;
  service_area: string | null;
  description: string | null;
  prefecture: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

export interface Application {
  id: string;
  name: string;
  name_kana: string;
  birth_date: string;
  gender: string;
  postal_code: string;
  address: string;
  phone: string;
  email: string;
  clinic_name: string | null;
  qualifications: string | null;
  practice_years: number | null;
  desired_member_type: MemberType;
  remarks: string | null;
  attachment_url: string | null;
  referrer_name: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: NewsCategory;
  is_published: boolean;
  is_member_only: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
}

export interface Seminar {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  instructor: string | null;
  capacity: number;
  fee: number;
  deadline: string | null;
  status: SeminarStatus;
  current_participants: number;
  created_at: string;
  updated_at: string;
}

export interface SeminarRegistration {
  id: string;
  seminar_id: string;
  member_id: string;
  created_at: string;
  seminar?: Seminar;
  member?: Member;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_name: string;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  category: ContactCategory;
  message: string;
  is_read: boolean;
  admin_notes: string | null;
  created_at: string;
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  updated_at: string;
}

export type ColumnCategory =
  | "general"
  | "technique"
  | "health"
  | "interview"
  | "report";

export interface Column {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  category: ColumnCategory;
  tags: string[];
  author_id: string | null;
  author_name: string | null;
  is_published: boolean;
  is_member_only: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  no_index: boolean;
}
