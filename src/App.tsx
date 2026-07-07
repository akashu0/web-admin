import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

import { CourseList } from './pages/Course/CourseList';
import { UniversityList } from './pages/University/UniversityList';
import { VisaForm } from './pages/Visa/VisaForm';
import VisaList from './pages/Visa/VisaList';
import LearningCenterList from './pages/LearningCenter/LearningCenterList';
import CreateLearningCenter from './pages/LearningCenter/CreateLearningCenter';
import { AddCourseModal } from './pages/Course/AddCourseModal';
import EditCourse from './pages/Course/EditCourse';
import { FAQPage } from './pages/Faq/FAQPage';
import CountryList from './pages/Countries/CountryList';
import { EditCountryForm } from './pages/Countries/EditCountryForm';
import { CountryViewModal } from './pages/Countries/CountryViewModal';
import { EditUniversity } from './pages/University/EditUniversity';
import EnquiryList from './pages/Enquiry/EnquiryList';
import { CommissionList } from './pages/University/Commission/CommissionList';
import PropertyViewsTable from './pages/PropertyViewsTable';
import { PopupBannerPage } from './pages/PopupBanner/PopupBannerPage';
import { LibraryPage } from './pages/Library/LibraryPage';
import { EgAcademyCourseList } from './pages/EgAcademy/EgAcademyCourseList';
import EditEgAcademyCourse from './pages/EgAcademy/EditEgAcademyCourse';
import AgentList from './pages/Agent/AgentList';
import AgentDetail from './pages/Agent/AgentDetail';

function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/ip-view" element={<PropertyViewsTable />} />

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
                        <Route path="/universities/commission" element={<CommissionList />} />
                        {/* <Route path="/universities/new" element={<AddUniversityModal open={true} onOpenChange={() => { }} onSuccess={() => { }} />} /> */}
                        <Route path="/universities/edit/:slug" element={<EditUniversity />} />

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
                        <Route path="/countries/edit/:id" element={<EditCountryForm />} />
                        <Route path="/countries/view/:slug" element={<CountryViewModal />} />

                        {/* Enquiry Routes */}
                        <Route path="/enquiries" element={<EnquiryList />} />

                        {/* Popup Banner Routes */}
                        <Route path="/popup-banners" element={<PopupBannerPage />} />

                        {/* eG Library Routes */}
                        <Route path="/library" element={<LibraryPage />} />

                        {/* eG Academy Routes */}
                        <Route path="/eg-academy/courses" element={<EgAcademyCourseList />} />
                        <Route path="/eg-academy/courses/:slug" element={<EditEgAcademyCourse />} />

                        {/* Agent Routes */}
                        <Route path="/agents" element={<AgentList />} />
                        <Route path="/agents/:id" element={<AgentDetail />} />





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
