import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import Fuse from 'fuse.js';
import { supabase } from '../src/lib/supabase';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, SHADOW } from '../src/utils/theme';

export default function AdminScreen() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalFocusSessions, setTotalFocusSessions] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [abandonedSessions, setAbandonedSessions] = useState(0);

  const [users, setUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchKPIs();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setUsers(data);
    }
  };

  const handleUpdateRole = (userId: string, currentRole: string) => {
    if (userId === currentUserId && currentRole === 'admin') {
      import('react-native').then(({ Alert }) => {
        Alert.alert('Bảo mật', 'Bạn không thể tự xóa quyền Admin của chính mình!');
      });
      return;
    }

    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    import('react-native').then(({ Alert }) => {
      Alert.alert(
        'Xác nhận đổi quyền',
        `Bạn muốn cấp quyền ${newRole.toUpperCase()} cho người dùng này?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đồng ý',
            onPress: async () => {
              const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);
              
              if (error) {
                Alert.alert('Lỗi', error.message);
              } else {
                fetchUsers();
              }
            }
          }
        ]
      );
    });
  };

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      // Fetch users count (Cần có quyền admin ở DB thì mới lấy được hết)
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch sessions (Cần quyền admin để thấy session của tất cả mọi người)
      const { data: sessions, error: sessionsError } = await supabase
        .from('focus_sessions')
        .select('completed');

      if (!sessionsError && sessions) {
        const completed = sessions.filter(s => s.completed).length;
        const abandoned = sessions.filter(s => !s.completed).length;
        
        setTotalFocusSessions(sessions.length);
        setCompletedSessions(completed);
        setAbandonedSessions(abandoned);
      }
      
      if (!usersError && usersCount !== null) {
        setTotalUsers(usersCount);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    const fuse = new Fuse(users, {
      keys: ['email', 'id'],
      threshold: 0.4,
    });
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, users]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const completionRate = totalFocusSessions > 0 
    ? Math.round((completedSessions / totalFocusSessions) * 100) 
    : 0;


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Tổng quan hệ thống (KPIs)</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Người dùng</Text>
        <Text style={styles.cardValue}>{totalUsers}</Text>
        <Text style={styles.cardLabel}>Tổng số tài khoản</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Phiên Tập trung (Focus)</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.cardValue}>{totalFocusSessions}</Text>
            <Text style={styles.cardLabel}>Tổng</Text>
          </View>
          <View style={styles.col}>
            <Text style={[styles.cardValue, { color: COLORS.success }]}>{completedSessions}</Text>
            <Text style={styles.cardLabel}>Hoàn thành</Text>
          </View>
          <View style={styles.col}>
            <Text style={[styles.cardValue, { color: COLORS.danger }]}>{abandonedSessions}</Text>
            <Text style={styles.cardLabel}>Bỏ dở</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.cardValue}>{completionRate}%</Text>
          <Text style={styles.cardLabel}>Tỉ lệ hoàn thành phiên</Text>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Quản lý Người dùng</Text>
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm theo email..."
        placeholderTextColor={COLORS.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.userListContainer}>
        {filteredUsers.map((u) => (
          <View key={u.id} style={styles.userRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail} numberOfLines={1}>{u.email || u.id.substring(0,8)}</Text>
              <Text style={styles.userRoleBadge}>{u.role}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.btnChangeRole, u.role === 'admin' ? styles.btnDemote : styles.btnPromote]}
              onPress={() => handleUpdateRole(u.id, u.role)}
            >
              <Text style={styles.btnChangeRoleText}>
                {u.role === 'admin' ? 'Giáng cấp' : 'Lên Admin'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 60,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  cardLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  userListContainer: {
    gap: 10,
    paddingBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOW.sm,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  userRoleBadge: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  btnChangeRole: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    marginLeft: 10,
  },
  btnPromote: {
    backgroundColor: COLORS.primary + '20',
  },
  btnDemote: {
    backgroundColor: COLORS.danger + '20',
  },
  btnChangeRoleText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  }
});
