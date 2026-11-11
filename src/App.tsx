/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RoomDatabase, UserEntity } from './db/room';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav, AppPage } from './components/AndroidBottomNav';
import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { RoomInspectorModal } from './components/RoomInspectorModal';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { MealPage } from './pages/MealPage';
import { ActivityPage } from './pages/ActivityPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(() =>
    RoomDatabase.auth.getCurrentUser()
  );
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [targetActivityDate, setTargetActivityDate] = useState<string | undefined>(undefined);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [dbVersion, setDbVersion] = useState<number>(0);

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(RoomDatabase.auth.getCurrentUser());
      setDbVersion((v) => v + 1);
    };
    window.addEventListener('room_db_update', handleUpdate);
    return () => window.removeEventListener('room_db_update', handleUpdate);
  }, []);

  const handleLoginSuccess = () => {
    setCurrentUser(RoomDatabase.auth.getCurrentUser());
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    RoomDatabase.auth.logout();
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: AppPage, targetDate?: string) => {
    if (page === 'activity' && targetDate) {
      setTargetActivityDate(targetDate);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'M&W Dashboard';
      case 'activity':
        return 'Daily Activity';
      case 'workout':
        return 'Workout Table';
      case 'meal':
        return 'Meal Table';
      default:
        return 'M&W Tracker';
    }
  };

  const hasBackAction = currentPage !== 'dashboard';
  const handleBack = hasBackAction ? () => setCurrentPage('dashboard') : undefined;

  return (
    <div className="dark min-h-screen bg-[#090b0e] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <AndroidDeviceFrame
        isPhoneFrame={isPhoneFrame}
        header={
          <AndroidHeader
            title={currentUser ? getPageTitle() : 'M&W Tracker'}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenInspector={() => setIsInspectorOpen(true)}
            isPhoneFrame={isPhoneFrame}
            onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
            backAction={currentUser ? handleBack : undefined}
          />
        }
        bottomNav={
          currentUser ? (
            <AndroidBottomNav
              currentPage={currentPage}
              onNavigate={(page) => handleNavigate(page)}
            />
          ) : undefined
        }
      >
        {/* Content Body */}
        <main className="py-1">
          {!currentUser ? (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <DashboardPage onNavigate={handleNavigate} />
              )}
              {currentPage === 'activity' && (
                <ActivityPage
                  key={targetActivityDate || 'current_date'}
                  initialDate={targetActivityDate}
                />
              )}
              {currentPage === 'workout' && <WorkoutPage />}
              {currentPage === 'meal' && <MealPage />}
            </>
          )}
        </main>

        {/* Android Room SQLite Inspector Modal */}
        <RoomInspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onDataReset={() => {
            setDbVersion((v) => v + 1);
          }}
        />
      </AndroidDeviceFrame>
    </div>
  );
}
