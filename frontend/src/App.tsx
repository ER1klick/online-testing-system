import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import TestEditor from './pages/TestEditor';
import ImportStudents from './pages/ImportStudents';
import AddTeacher from './pages/AddTeacher';
import TakeTest from './pages/TakeTest';
import GroupsList from './pages/GroupsList';
import GroupDetails from './pages/GroupDetails';

export default function App() {
    const [user, setUser] = useState<{ email: string, role: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/v1/auth/me')
            .then(res => {
                if (res.data.role === 'GUEST') {
                    setUser(null);
                } else {
                    setUser(res.data);
                }
            })
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;

    return (
        <BrowserRouter>
            <Routes>
                {/* Страница логина открыта ВСЕМ. Но если ты УЖЕ залогинен - кидаем на дашборд */}
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

                {/* Если залогинен - показываем дашборд по роли, если нет - на логин */}
                <Route path="/dashboard" element={
                    user ? (user.role === 'STUDENT' ? <StudentDashboard /> : <Dashboard />) : <Navigate to="/login" />
                } />

                {/* Маршруты для ПРЕПОДАВАТЕЛЯ и АДМИНА */}
                <Route path="/edit-test/:id" element={user?.role !== 'STUDENT' ? <TestEditor /> : <Navigate to="/dashboard" />} />
                <Route path="/import-students" element={user?.role !== 'STUDENT' ? <ImportStudents /> : <Navigate to="/dashboard" />} />
                <Route path="/groups" element={user?.role !== 'STUDENT' ? <GroupsList /> : <Navigate to="/dashboard" />} />
                <Route path="/groups/:groupName" element={user?.role !== 'STUDENT' ? <GroupDetails /> : <Navigate to="/dashboard" />} />
                <Route path="/add-teacher" element={user?.role === 'ADMIN' ? <AddTeacher /> : <Navigate to="/dashboard" />} />

                {/* Маршруты для СТУДЕНТА */}
                <Route path="/take-test/:id" element={user?.role === 'STUDENT' ? <TakeTest /> : <Navigate to="/dashboard" />} />

                {/* Редирект с корня на дашборд */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </BrowserRouter>
    );
}