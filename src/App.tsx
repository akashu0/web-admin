import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

import { CourseList } from './pages/Course/CourseList';
import { UniversityList } from './pages/University/UniversityList';
import { UniversityForm } from './pages/University/UniversityForm';
import { VisaForm } from './pages/Visa/VisaForm';
import VisaList from './pages/Visa/VisaList';
import LearningCenterList from './pages/LearningCenter/LearningCenterList';
import CreateLearningCenter from './pages/LearningCenter/CreateLearningCenter';
import { AddCourseModal } from './pages/Course/AddCourseModal';
import EditCourse from './pages/Course/EditCourse';
import { FAQPage } from './pages/Faq/FAQPage';
import { CountryList } from './pages/Countries/CountryList';

function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Course Routes */}
                        <Route path="/courses" element={<CourseList />} />
                        <Route path="/courses/new" element={<AddCourseModal open={true} onOpenChange={() => { }} onSuccess={() => { }} />} />
                        <Route path="/courses/:slug" element={<EditCourse />} />

                        {/* University Routes */}
                        <Route path="/universities" element={<UniversityList />} />
                        <Route path="/universities/new" element={<UniversityForm />} />
                        <Route path="/universities/:id" element={<UniversityForm />} />

                        {/* Visa Routes */}
                        <Route path="/visas" element={<VisaList />} />
                        <Route path="/visas/new" element={<VisaForm />} />
                        <Route path="/visas/:id" element={<VisaForm />} />

                        {/* Learning Center Routes */}
                        <Route path="/learning-centers" element={<LearningCenterList />} />
                        <Route path="/learning-centers/new" element={<CreateLearningCenter />} />
                        <Route path="/learning-centers/edit/:id" element={<CreateLearningCenter />} />

                        {/* FAQ Routes */}
                        <Route path="/faqs" element={<FAQPage />} />
                        {/* <Route path="/faqs/new" element={<FAQFormDialog />} />
                        <Route path="/faqs/:id" element={<FAQFormDialog />} /> */}

                        {/* Country Routes */}
                        <Route path="/countries" element={<CountryList />} />
                        {/* <Route path="/countries/new" element={<CountryForm />} />
                        <Route path="/countries/:id" element={<CountryForm />} /> */}



                    </Route>
                </Route>
            </Routes>
            <Toaster
                position="top-right"
                richColors
                expand={false}
                duration={4000}
            />
        </>
    );
}

export default App;
