import React, { useRef, useState, useEffect } from 'react';
import {
  NavigationContainer,
  NavigationState,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Alert, AppState, AppStateStatus } from 'react-native';

import TodayScreen from './screens/TodayScreen';
import TasksScreen from './screens/TasksScreen';
import TimetableScreen from './screens/TimetableScreen';
import FocusScreen from './screens/FocusScreen';
import ProfileScreen from './screens/ProfileScreen';
import StatsScreen from './screens/StatsScreen';

import { COLORS, FONT_SIZE, FONT_WEIGHT } from './src/utils/theme';
import { PomodoroActiveBanner } from './src/components/focus/PomodoroActiveBanner';
import { useFocusStore, useScheduleStore } from './src/store';
import { OnboardingStartScreen } from './src/components/onboarding/OnboardingStartScreen';
import { NewUserGuideScreen } from './src/components/onboarding/NewUserGuideScreen';
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import AuthScreen from './screens/AuthScreen';
import AdminScreen from './screens/AdminScreen';

const Tab = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef<any>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: {
  name: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
  component: React.ComponentType;
}[] = [
  { name: 'Today', label: 'Hôm nay', icon: 'home-outline', iconActive: 'home', component: TodayScreen },
  { name: 'Tasks', label: 'Việc', icon: 'checkbox-outline', iconActive: 'checkbox', component: TasksScreen },
  { name: 'Timetable', label: 'Lịch', icon: 'calendar-outline', iconActive: 'calendar', component: TimetableScreen },
  { name: 'Focus', label: 'Tập trung', icon: 'timer-outline', iconActive: 'timer', component: FocusScreen },
  { name: 'Stats', label: 'Thống kê', icon: 'bar-chart-outline', iconActive: 'bar-chart', component: StatsScreen },
  { name: 'Profile', label: 'Hồ sơ', icon: 'person-outline', iconActive: 'person', component: ProfileScreen },
];

// ─── Inner app wrapper (đọc store hooks bên trong SafeAreaProvider) ─────────
function AppInner() {
  const insets = useSafeAreaInsets();
  const {
    activeSession,
    logAbandon,
    setActiveSession,
    addPoints,
    hasCompletedOnboarding,
    hasSeenNewUserGuidePrompt,
    completedTutorialTabs,
    tutorialActiveTab,
    completeOnboarding,
    markNewUserGuideSeen,
    skipNewUserGuide,
    startTutorial,
    syncOnboardingForUser,
  } = useFocusStore();
  const [currentTab, setCurrentTab] = useState('Today');
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const prevTabRef = useRef('Today');
  const hasLoggedSwitchRef = useRef(false);
  const hasAbandonedInBackgroundRef = useRef(false);
  const backgroundTimeRef = useRef<number | null>(null);

  const handleStartApp = () => {
    completeOnboarding();
  };

  const handleStartNewUserGuide = () => {
    markNewUserGuideSeen();
    setCurrentTab('Timetable');
    requestAnimationFrame(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Timetable');
      }
      startTutorial('Timetable');
    });
  };

  // Lưu activeSession vào ref để dùng trong AppState listener không bị closure cũ
  const activeSessionRef = useRef(activeSession);
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  // Lắng nghe trạng thái ứng dụng để phạt điểm khi ở nền quá 60s (Grace Period)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        const session = activeSessionRef.current;
        if (session) {
          backgroundTimeRef.current = Date.now();
        }
      } else if (nextAppState === 'active') {
        const session = activeSessionRef.current;
        if (backgroundTimeRef.current && session) {
          const elapsedSeconds = (Date.now() - backgroundTimeRef.current) / 1000;
          if (elapsedSeconds > 60) {
            // Quá 60 giây -> Phạt hủy phiên
            logAbandon({
              timestamp: new Date().toISOString(),
              date: new Date().toISOString().split('T')[0],
              subjectId: session.subjectId,
              taskId: session.taskId,
              mode: session.mode,
              timeLeftSeconds: session.timeLeft,
              elapsedSeconds: session.totalSeconds - session.timeLeft,
              totalSeconds: session.totalSeconds,
              reason: 'app_background',
            });

            addPoints({
              id: `p_${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              points: -5,
              reason: 'abandon_penalty',
              description: `Trừ điểm do thoát app quá 60 giây khi đang học`,
            });

            setActiveSession(null);
            hasAbandonedInBackgroundRef.current = true;
          } else {
            // Dưới 60 giây -> Cho phép học tiếp, trừ hao thời gian trôi qua thực tế
            const elapsed = Math.round(elapsedSeconds);
            const nextTimeLeft = Math.max(0, session.timeLeft - elapsed);
            setActiveSession({
              ...session,
              timeLeft: nextTimeLeft,
            });
          }
        }
        backgroundTimeRef.current = null;

        // Hiển thị thông báo nếu bị hủy trong nền
        if (hasAbandonedInBackgroundRef.current) {
          hasAbandonedInBackgroundRef.current = false;
          Alert.alert(
            'Phiên tập trung đã dừng',
            'Bạn rời ứng dụng quá 60 giây khi phiên đang chạy. Phiên này bị tính bỏ dở và trừ 5 điểm.',
            [
              {
                text: 'Đồng ý',
                onPress: () => {
                  if (navigationRef.isReady()) {
                    navigationRef.navigate('Focus');
                  }
                },
              },
            ]
          );
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [logAbandon, addPoints, setActiveSession]);

  // Detect chuyển tab → log abandon nếu đang chạy Pomodoro
  const handleTabChange = (state: NavigationState | undefined) => {
    if (!state) return;
    const activeRoute = state.routes[state.index].name;
    const prevRoute = prevTabRef.current;
    prevTabRef.current = activeRoute;
    setCurrentTab(activeRoute);

    // Đóng hướng dẫn đang mở khi người dùng chuyển sang tab khác.
    const store = useFocusStore.getState();
    if (store.tutorialActiveTab && store.tutorialActiveTab !== activeRoute) {
      store.skipTutorial();
    }
    const nextStore = useFocusStore.getState();
    if (
      activeSessionRef.current === null &&
      !nextStore.tutorialActiveTab &&
      !nextStore.completedTutorialTabs.includes(activeRoute)
    ) {
      nextStore.startTutorial(activeRoute);
    }

    if (prevRoute === 'Focus' && activeRoute !== 'Focus' && activeSession !== null) {
      if (!hasLoggedSwitchRef.current) {
        hasLoggedSwitchRef.current = true;
        
        // 1. Ghi log abandon
        logAbandon({
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          subjectId: activeSession.subjectId,
          taskId: activeSession.taskId,
          mode: activeSession.mode,
          timeLeftSeconds: activeSession.timeLeft,
          elapsedSeconds: activeSession.totalSeconds - activeSession.timeLeft,
          totalSeconds: activeSession.totalSeconds,
          reason: 'tab_switch',
        });

        // 2. Trừ 5 điểm do chuyển tab bỏ học
        addPoints({
          id: `p_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          points: -5,
          reason: 'abandon_penalty',
          description: `Trừ điểm do chuyển màn hình khi đang học`,
        });

        setActiveSession(null);

        Alert.alert(
          'Phiên tập trung đã dừng',
          'Bạn chuyển màn hình khi phiên đang chạy. Phiên này bị tính bỏ dở và trừ 5 điểm.',
          [
            {
              text: 'Đồng ý',
              onPress: () => {
                if (navigationRef.isReady()) {
                  navigationRef.navigate('Focus');
                }
              },
            },
          ]
        );
      }
    } else if (activeRoute === 'Focus') {
      hasLoggedSwitchRef.current = false;
    }
  };

  useEffect(() => {
    if (!activeSession) hasLoggedSwitchRef.current = false;
  }, [activeSession]);

  useEffect(() => {
    if (userRole === 'admin' || !hasSeenNewUserGuidePrompt || tutorialActiveTab) return;

    if (completedTutorialTabs.includes('Timetable') && !completedTutorialTabs.includes('Tasks')) {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Tasks');
      }
      startTutorial('Tasks');
    } else if (completedTutorialTabs.includes('Tasks') && !completedTutorialTabs.includes('Focus')) {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Focus');
      }
      startTutorial('Focus');
    }
  }, [completedTutorialTabs, hasSeenNewUserGuidePrompt, startTutorial, tutorialActiveTab, userRole]);


  // App startup effects
  useEffect(() => {
    const fetchSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      syncOnboardingForUser(session?.user.id ?? null);
      if (session) {
        const { data } = await supabase.from('users').select('role').eq('id', session.user.id).single();
        if (data) setUserRole(data.role);
        // Tải dữ liệu cloud khi đăng nhập
        useScheduleStore.getState().loadSlotsFromCloud(session.user.id);
        useFocusStore.getState().loadUserProfileFromCloud(session.user.id);
      }
    };
    
    fetchSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      syncOnboardingForUser(session?.user.id ?? null);
      if (session) {
        const { data } = await supabase.from('users').select('role').eq('id', session.user.id).single();
        if (data) setUserRole(data.role);
        // Tải dữ liệu cloud sau khi đăng nhập
        useScheduleStore.getState().loadSlotsFromCloud(session.user.id);
        useFocusStore.getState().loadUserProfileFromCloud(session.user.id);
      } else {
        setUserRole('student');
      }
    });

    return () => subscription.unsubscribe();
  }, [syncOnboardingForUser]);

  const showBanner = activeSession !== null && currentTab !== 'Focus';

  if (!hasCompletedOnboarding) {
    return <OnboardingStartScreen onStart={handleStartApp} />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (userRole !== 'admin' && !hasSeenNewUserGuidePrompt) {
    return (
      <NewUserGuideScreen
        onStartGuide={handleStartNewUserGuide}
        onSkipGuide={skipNewUserGuide}
      />
    );
  }

  const activeTabs = userRole === 'admin'
    ? [
        { name: 'Admin', label: 'Quản trị', icon: 'shield-outline' as const, iconActive: 'shield' as const, component: AdminScreen },
        { name: 'Profile', label: 'Hồ sơ', icon: 'person-outline' as const, iconActive: 'person' as const, component: ProfileScreen },
      ]
    : TAB_CONFIG;

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={handleTabChange}
      >
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => {
            const config = activeTabs.find((t) => t.name === route.name);
            return {
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? (config?.iconActive ?? 'home') : (config?.icon ?? 'home-outline')}
                  size={size}
                  color={color}
                />
              ),
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.tabInactive,
              tabBarLabel: config?.label ?? route.name,
              tabBarStyle: {
                backgroundColor: '#fff',
                borderTopWidth: 0,
                elevation: 20,
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                height: Platform.OS === 'ios' ? 88 : 64 + Math.max(insets.bottom, 8),
                paddingBottom: Platform.OS === 'ios' ? 24 : Math.max(insets.bottom, 8),
                paddingTop: 8,
              },
              tabBarLabelStyle: {
                fontSize: FONT_SIZE.xs,
                fontWeight: FONT_WEIGHT.medium,
              },
            };
          }}
        >
          {activeTabs.map((tab) => (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              component={tab.component}
            />
          ))}
        </Tab.Navigator>
      </NavigationContainer>

      {/* Global banner — hiện khi đang Pomodoro ở tab khác */}
      {showBanner && activeSession && (
        <PomodoroActiveBanner
          timeLeft={activeSession.timeLeft}
          isRunning={true}
          mode={activeSession.mode}
          onPress={() => {
            // Navigate về tab Focus → FocusScreen sẽ tự mở lại FocusLockScreen
            if (navigationRef.isReady()) {
              navigationRef.navigate('Focus');
            }
          }}
        />
      )}


    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}
