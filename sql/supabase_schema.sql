-- Bật extension tạo UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng Users (mở rộng từ auth.users của Supabase)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Subjects
CREATE TABLE public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT,
  color TEXT,
  target_hours INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Tasks
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Focus Sessions
CREATE TABLE public.focus_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  abandon_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- THIẾT LẬP BẢO MẬT BẰNG ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Bật RLS cho tất cả các bảng
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Hàm kiểm tra Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Chính sách cho Users: 
-- 1. Mọi người có thể đọc thông tin của mình. Admin đọc được tất cả.
CREATE POLICY "Users can read own data or admin reads all" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
  
-- 2. User được update tài khoản mình (trừ đổi role).
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Chính sách cho Subjects, Tasks, Focus Sessions:
-- 1. Đọc: Xem data của mình, Admin được xem tất cả
CREATE POLICY "Select policy" ON public.subjects FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Select policy" ON public.tasks FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Select policy" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- 2. Thêm/Sửa/Xóa: User chỉ được thao tác với data của chính mình
CREATE POLICY "Insert policy" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update policy" ON public.subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete policy" ON public.subjects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Insert policy" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update policy" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete policy" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Insert policy" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update policy" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete policy" ON public.focus_sessions FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGER TỰ ĐỘNG TẠO USER KHI ĐĂNG KÝ
-- ==========================================
-- Hàm trigger tự động chèn record vào public.users khi có user đăng ký qua Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
