import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestEditor from './pages/TestEditor';
import ImportStudents from './pages/ImportStudents';
import GroupsList from './pages/GroupsList';
import GroupDetails from './pages/GroupDetails';
import { api } from './services/api';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    useEffect(() => {
        api.get('/v1/auth/me')
            .then(() => setIsAuth(true))
            .catch(() => setIsAuth(false));
    }, []);

    if (isAuth === null) return <div>Загрузка...</div>;
    return isAuth ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />

                <Route path="/edit-test/:id" element={
                    <ProtectedRoute><TestEditor /></ProtectedRoute>
                } />

                <Route path="/import-students" element={
                    <ProtectedRoute><ImportStudents /></ProtectedRoute>
                } />

                <Route path="/groups" element={
                    <ProtectedRoute><GroupsList /></ProtectedRoute>
                    } />

                <Route path="/groups/:groupName" element=
                {<ProtectedRoute><GroupDetails /></ProtectedRoute>
                    } />

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;