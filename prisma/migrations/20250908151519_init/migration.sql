-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('super_admin', 'admin', 'publisher', 'citizen');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('pending', 'planned', 'ongoing', 'completed');

-- CreateEnum
CREATE TYPE "public"."ProjectCategory" AS ENUM ('infrastructure', 'education', 'healthcare', 'agriculture', 'water', 'electricity', 'roads', 'housing', 'environment', 'social', 'economic', 'other');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('active', 'rejected', 'unsubscribed');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('new', 'in_review', 'resolved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('spam', 'inappropriate', 'misinformation', 'harassment', 'other');

-- CreateTable
CREATE TABLE "public"."lgas" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "lgas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wards" (
    "id" UUID NOT NULL,
    "lga_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."polling_units" (
    "id" UUID NOT NULL,
    "ward_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "polling_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "phone_whatsapp" TEXT,
    "phone_call" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'citizen',
    "lga_id" UUID,
    "ward_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."publisher_passcodes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "lga_id" UUID NOT NULL,
    "ward_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3),
    "max_uses" INTEGER NOT NULL DEFAULT 1,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,

    CONSTRAINT "publisher_passcodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "lga_id" UUID NOT NULL,
    "ward_id" UUID NOT NULL,
    "polling_unit_id" UUID,
    "status" "public"."ProjectStatus" NOT NULL,
    "budget_naira" DECIMAL(65,30),
    "contractor" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "created_by" UUID,
    "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "completion_percentage" INTEGER DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_images" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "storage_path" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_status_history" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "old_status" TEXT,
    "new_status" TEXT NOT NULL,
    "changed_by" UUID NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "lga_id" UUID NOT NULL,
    "ward_id" UUID NOT NULL,
    "polling_unit_id" UUID NOT NULL,
    "address" TEXT,
    "phone_whatsapp" TEXT,
    "phone_call" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "traits" JSONB NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "project_category" "public"."ProjectCategory",
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "author_name" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "created_by" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" UUID,
    "parent_id" UUID,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" UUID NOT NULL,
    "project_id" UUID,
    "reporter_name" TEXT,
    "reporter_email" TEXT,
    "reporter_phone" TEXT,
    "message" TEXT NOT NULL,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "comment_id" UUID,
    "report_type" "public"."ReportType",
    "description" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" UUID,
    "resolution_notes" TEXT,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rate_limits" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "window_starts_at" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lgas_name_key" ON "public"."lgas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "wards_lga_id_name_key" ON "public"."wards"("lga_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "polling_units_ward_id_name_key" ON "public"."polling_units"("ward_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_lga_id_idx" ON "public"."users"("lga_id");

-- CreateIndex
CREATE INDEX "users_ward_id_idx" ON "public"."users"("ward_id");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "public"."users"("created_at");

-- CreateIndex
CREATE INDEX "users_reset_token_idx" ON "public"."users"("reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "publisher_passcodes_code_key" ON "public"."publisher_passcodes"("code");

-- CreateIndex
CREATE INDEX "projects_lga_id_idx" ON "public"."projects"("lga_id");

-- CreateIndex
CREATE INDEX "projects_ward_id_idx" ON "public"."projects"("ward_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "public"."projects"("status");

-- CreateIndex
CREATE INDEX "projects_approval_status_idx" ON "public"."projects"("approval_status");

-- CreateIndex
CREATE INDEX "projects_is_published_idx" ON "public"."projects"("is_published");

-- CreateIndex
CREATE INDEX "projects_created_at_idx" ON "public"."projects"("created_at");

-- CreateIndex
CREATE INDEX "projects_updated_at_idx" ON "public"."projects"("updated_at");

-- CreateIndex
CREATE INDEX "projects_lga_id_ward_id_idx" ON "public"."projects"("lga_id", "ward_id");

-- CreateIndex
CREATE INDEX "projects_status_is_published_idx" ON "public"."projects"("status", "is_published");

-- CreateIndex
CREATE INDEX "project_images_project_id_idx" ON "public"."project_images"("project_id");

-- CreateIndex
CREATE INDEX "project_images_sort_order_idx" ON "public"."project_images"("sort_order");

-- CreateIndex
CREATE INDEX "project_status_history_project_id_idx" ON "public"."project_status_history"("project_id");

-- CreateIndex
CREATE INDEX "project_status_history_changed_by_idx" ON "public"."project_status_history"("changed_by");

-- CreateIndex
CREATE INDEX "project_status_history_changed_at_idx" ON "public"."project_status_history"("changed_at");

-- CreateIndex
CREATE INDEX "subscriptions_lga_id_idx" ON "public"."subscriptions"("lga_id");

-- CreateIndex
CREATE INDEX "subscriptions_ward_id_idx" ON "public"."subscriptions"("ward_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_created_at_idx" ON "public"."subscriptions"("created_at");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "public"."subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_project_category_idx" ON "public"."subscriptions"("project_category");

-- CreateIndex
CREATE INDEX "subscriptions_lga_id_ward_id_idx" ON "public"."subscriptions"("lga_id", "ward_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_email_key" ON "public"."subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_phone_call_key" ON "public"."subscriptions"("phone_call");

-- CreateIndex
CREATE INDEX "comments_project_id_idx" ON "public"."comments"("project_id");

-- CreateIndex
CREATE INDEX "comments_approval_status_idx" ON "public"."comments"("approval_status");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "public"."comments"("created_at");

-- CreateIndex
CREATE INDEX "comments_is_approved_idx" ON "public"."comments"("is_approved");

-- CreateIndex
CREATE INDEX "comments_created_by_idx" ON "public"."comments"("created_by");

-- CreateIndex
CREATE INDEX "comments_project_id_approval_status_idx" ON "public"."comments"("project_id", "approval_status");

-- CreateIndex
CREATE INDEX "reports_project_id_idx" ON "public"."reports"("project_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "public"."reports"("status");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "public"."reports"("created_at");

-- CreateIndex
CREATE INDEX "reports_report_type_idx" ON "public"."reports"("report_type");

-- CreateIndex
CREATE INDEX "reports_created_by_idx" ON "public"."reports"("created_by");

-- CreateIndex
CREATE INDEX "reports_comment_id_idx" ON "public"."reports"("comment_id");

-- CreateIndex
CREATE INDEX "reports_project_id_status_idx" ON "public"."reports"("project_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "public"."audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "public"."audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "rate_limits_key_idx" ON "public"."rate_limits"("key");

-- CreateIndex
CREATE INDEX "rate_limits_window_starts_at_idx" ON "public"."rate_limits"("window_starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_key_window_starts_at_key" ON "public"."rate_limits"("key", "window_starts_at");

-- AddForeignKey
ALTER TABLE "public"."wards" ADD CONSTRAINT "wards_lga_id_fkey" FOREIGN KEY ("lga_id") REFERENCES "public"."lgas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."polling_units" ADD CONSTRAINT "polling_units_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_lga_id_fkey" FOREIGN KEY ("lga_id") REFERENCES "public"."lgas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."publisher_passcodes" ADD CONSTRAINT "publisher_passcodes_lga_id_fkey" FOREIGN KEY ("lga_id") REFERENCES "public"."lgas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."publisher_passcodes" ADD CONSTRAINT "publisher_passcodes_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."publisher_passcodes" ADD CONSTRAINT "publisher_passcodes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_lga_id_fkey" FOREIGN KEY ("lga_id") REFERENCES "public"."lgas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_polling_unit_id_fkey" FOREIGN KEY ("polling_unit_id") REFERENCES "public"."polling_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_images" ADD CONSTRAINT "project_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_status_history" ADD CONSTRAINT "project_status_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_status_history" ADD CONSTRAINT "project_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_lga_id_fkey" FOREIGN KEY ("lga_id") REFERENCES "public"."lgas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_polling_unit_id_fkey" FOREIGN KEY ("polling_unit_id") REFERENCES "public"."polling_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
