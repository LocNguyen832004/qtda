-- ==========================================
-- StudyCommit — SQL Patch v2
-- Chạy script này SAU KHI đã chạy supabase_schema.sql
-- Bổ sung: user_profiles, schedule_slots, RPC update_user_role, triggers & RLS
-- ==========================================

-- ─── 1. Bảng USER_PROFILES ────────────────────────────────────────────────────
-- Lưu điểm tích lũy và nhạc đã mở khóa của từng user
-- Dùng UUID vì liên kết trực tiếp với auth.users của Supabase
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id             UUID        REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  total_points   INTEGER     NOT NULL DEFAULT 130,
  unlocked_music_ids TEXT[]  NOT NULL DEFAULT ARRAY['m_lofi'],
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Bảng SCHEDULE_SLOTS ───────────────────────────────────────────────────
-- Lưu thời khóa biểu của từng user
-- Dùng TEXT id vì app tạo id dạng 'sc_<timestamp>' (không phải UUID chuẩn)
CREATE TABLE IF NOT EXISTS public.schedule_slots (
  id           TEXT        PRIMARY KEY,
  user_id      UUID        REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subject_id   TEXT        NOT NULL,
  day_of_week  SMALLINT    NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TEXT        NOT NULL,
  end_time     TEXT        NOT NULL,
  room         TEXT,
  type         TEXT        NOT NULL DEFAULT 'lecture'
                           CHECK (type IN ('lecture', 'lab', 'tutorial', 'self_study', 'group_study')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Bật RLS cho các bảng mới ─────────────────────────────────────────────
ALTER TABLE public.user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;

-- ─── 4. RLS Policies — user_profiles ─────────────────────────────────────────
-- User chỉ xem và sửa profile của chính mình; Admin xem tất cả
CREATE POLICY "user_profiles: select own or admin"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "user_profiles: insert own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles: update own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ─── 5. RLS Policies — schedule_slots ────────────────────────────────────────
CREATE POLICY "schedule_slots: select own or admin"
  ON public.schedule_slots FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "schedule_slots: insert own"
  ON public.schedule_slots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schedule_slots: update own"
  ON public.schedule_slots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "schedule_slots: delete own"
  ON public.schedule_slots FOR DELETE
  USING (auth.uid() = user_id);

-- ─── 6. TRIGGER: Tự động tạo user_profile khi user đăng ký ──────────────────
-- Đảm bảo mọi user mới đều có hàng profile với điểm khởi đầu và nhạc mặc định
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, total_points, unlocked_music_ids)
  VALUES (new.id, 130, ARRAY['m_lofi'])
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_profile ON public.users;
CREATE TRIGGER on_user_created_profile
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();

-- ─── 7. Tạo profile cho các user đã có sẵn (chạy 1 lần) ─────────────────────
INSERT INTO public.user_profiles (id, total_points, unlocked_music_ids)
SELECT id, 130, ARRAY['m_lofi']
FROM public.users
ON CONFLICT (id) DO NOTHING;

-- ─── 8. FIX ADMIN RLS: RPC update_user_role ──────────────────────────────────
-- Vấn đề: Policy UPDATE hiện tại chỉ cho phép user sửa record của chính mình,
--         khiến Admin không thể đổi role của người khác dù dùng supabase client.
-- Giải pháp: RPC function chạy với SECURITY DEFINER (bypass RLS),
--            nhưng chỉ cho phép caller có role = 'admin' gọi được.

CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role        TEXT
)
RETURNS void AS $$
BEGIN
  -- Kiểm tra caller phải là admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied: chỉ Admin mới có thể thay đổi quyền';
  END IF;

  -- Ngăn Admin tự hạ cấp chính mình
  IF target_user_id = auth.uid() AND new_role != 'admin' THEN
    RAISE EXCEPTION 'Admin không thể tự hạ cấp quyền của mình';
  END IF;

  -- Chỉ chấp nhận 2 giá trị role hợp lệ
  IF new_role NOT IN ('student', 'admin') THEN
    RAISE EXCEPTION 'Role không hợp lệ. Chỉ chấp nhận: student, admin';
  END IF;

  -- Thực hiện cập nhật (bypass RLS nhờ SECURITY DEFINER)
  UPDATE public.users
  SET role = new_role
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Chỉ cấp quyền gọi function cho authenticated users (không public)
REVOKE ALL ON FUNCTION public.update_user_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, TEXT) TO authenticated;
