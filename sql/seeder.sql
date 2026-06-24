-- ==========================================
-- SCRIPT SEED DỮ LIỆU MẪU CHO SUPABASE
-- Hướng dẫn: Copy toàn bộ nội dung file này và dán vào Supabase SQL Editor rồi bấm RUN.
-- LƯU Ý: Chạy script này sẽ tạo ra 5 User và 50 Focus Sessions. Mật khẩu của các user đều là: password123
-- ==========================================

-- Đảm bảo đã bật extension pgcrypto để mã hóa mật khẩu
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    -- Khởi tạo 5 UUID cho 5 User
    uid1 UUID := gen_random_uuid();
    uid2 UUID := gen_random_uuid();
    uid3 UUID := gen_random_uuid();
    uid4 UUID := gen_random_uuid();
    uid5 UUID := gen_random_uuid();
    
    i INT;
    random_days INT;
    random_duration INT;
    is_completed BOOLEAN;
BEGIN
    RAISE NOTICE 'Bắt đầu chèn 5 Users vào bảng auth.users...';

    -- 1. Chèn dữ liệu vào bảng auth.users
    -- Khi chèn vào auth.users, Trigger "on_auth_user_created" sẽ tự động chèn sang public.users
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
        aud, role
    )
    VALUES 
        (uid1, '00000000-0000-0000-0000-000000000000', 'student_sql_1@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'),
        (uid2, '00000000-0000-0000-0000-000000000000', 'student_sql_2@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'),
        (uid3, '00000000-0000-0000-0000-000000000000', 'student_sql_3@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'),
        (uid4, '00000000-0000-0000-0000-000000000000', 'student_sql_4@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'),
        (uid5, '00000000-0000-0000-0000-000000000000', 'student_sql_5@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated');

    RAISE NOTICE 'Bắt đầu chèn 50 Focus Sessions...';

    -- 2. Chèn dữ liệu Focus Sessions (Mỗi user 10 sessions)
    -- User 1
    FOR i IN 1..10 LOOP
        random_days := floor(random() * 30);
        is_completed := random() > 0.3;
        random_duration := CASE WHEN is_completed THEN 25 ELSE floor(random() * 24 + 1) END;
        INSERT INTO public.focus_sessions (user_id, started_at, duration_minutes, completed)
        VALUES (uid1, now() - (random_days || ' days')::interval, random_duration, is_completed);
    END LOOP;

    -- User 2
    FOR i IN 1..10 LOOP
        random_days := floor(random() * 30);
        is_completed := random() > 0.3;
        random_duration := CASE WHEN is_completed THEN 25 ELSE floor(random() * 24 + 1) END;
        INSERT INTO public.focus_sessions (user_id, started_at, duration_minutes, completed)
        VALUES (uid2, now() - (random_days || ' days')::interval, random_duration, is_completed);
    END LOOP;

    -- User 3
    FOR i IN 1..10 LOOP
        random_days := floor(random() * 30);
        is_completed := random() > 0.3;
        random_duration := CASE WHEN is_completed THEN 25 ELSE floor(random() * 24 + 1) END;
        INSERT INTO public.focus_sessions (user_id, started_at, duration_minutes, completed)
        VALUES (uid3, now() - (random_days || ' days')::interval, random_duration, is_completed);
    END LOOP;

    -- User 4
    FOR i IN 1..10 LOOP
        random_days := floor(random() * 30);
        is_completed := random() > 0.3;
        random_duration := CASE WHEN is_completed THEN 25 ELSE floor(random() * 24 + 1) END;
        INSERT INTO public.focus_sessions (user_id, started_at, duration_minutes, completed)
        VALUES (uid4, now() - (random_days || ' days')::interval, random_duration, is_completed);
    END LOOP;

    -- User 5
    FOR i IN 1..10 LOOP
        random_days := floor(random() * 30);
        is_completed := random() > 0.3;
        random_duration := CASE WHEN is_completed THEN 25 ELSE floor(random() * 24 + 1) END;
        INSERT INTO public.focus_sessions (user_id, started_at, duration_minutes, completed)
        VALUES (uid5, now() - (random_days || ' days')::interval, random_duration, is_completed);
    END LOOP;

    RAISE NOTICE 'Seeding hoàn tất!';
END $$;
