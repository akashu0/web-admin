import { Route, Navigate, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import { CourseList } from '@/pages/Course/CourseList';
import { JobList } from '@/pages/Jobs/JobList';
import { JobViewPage } from '@/pages/Jobs/JobViewPage';
import { UniversityList } from '@/pages/University/UniversityList';
import VisaList from '@/pages/Visa/VisaList';
import { VisaViewPage } from '@/pages/Visa/VisaViewPage';
import EditCourse from '@/pages/Course/EditCourse';
import { FAQPage } from '@/pages/Faq/FAQPage';
import CountryList from '@/pages/Countries/CountryList';
import { EditCountryForm } from '@/pages/Countries/EditCountryForm';
import { CountryViewModal } from '@/pages/Countries/CountryViewModal';
import { EditUniversity } from '@/pages/University/EditUniversity';
import { CourseViewPage } from '@/pages/Course/CourseViewPage';
import { CommissionList } from '@/pages/University/Commission/CommissionList';
import { PopupBannerPage } from '@/pages/PopupBanner/PopupBannerPage';
import { LibraryPage } from '@/pages/Library/LibraryPage';
import { ReviewsPage } from '@/pages/Reviews/ReviewsPage';
import { EgAcademyCourseList } from '@/pages/EgAcademy/EgAcademyCourseList';
import EditEgAcademyCourse from '@/pages/EgAcademy/EditEgAcademyCourse';
import { EgAcademyCourseViewPage } from '@/pages/EgAcademy/EgAcademyCourseViewPage';
import { CenterPageList } from '@/pages/EgAcademy/CenterPageList';
import EditCenterPage from '@/pages/EgAcademy/EditCenterPage';

/*
 * A DATA router, not <BrowserRouter>. `useBlocker` — what stops an employee
 * navigating away from a half-typed form — exists only under a data router;
 * called under BrowserRouter it throws. The route tree itself is unchanged.
 */
export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Course Routes. Create is a modal on the list page, so
                        there is no standalone /courses/new route. */}
                    <Route path="/courses" element={<CourseList />} />
                    {/* view before :slug — otherwise "view" is read as a slug */}
                    <Route path="/courses/view/:slug" element={<CourseViewPage />} />
                    <Route path="/courses/:slug" element={<EditCourse />} />

                    <Route path="/jobs" element={<JobList />} />
                    {/* `view` before `:id`, or "view" is read as a reference. */}
                    <Route path="/jobs/view/:id" element={<JobViewPage />} />

                    {/* University Routes */}
                    <Route path="/universities" element={<UniversityList />} />
                    <Route path="/universities/commission" element={<CommissionList />} />
                    <Route path="/universities/edit/:slug" element={<EditUniversity />} />

                    {/* Visa Routes — create/edit both run through the modal on the list */}
                    <Route path="/visas" element={<VisaList />} />
                    <Route path="/visas/view/:id" element={<VisaViewPage />} />

                    {/* FAQ Routes */}
                    <Route path="/faqs" element={<FAQPage />} />

                    {/* Student reviews — moderation only; staff-written reviews
                        stay on the university editor's Reviews tab. */}
                    <Route path="/reviews" element={<ReviewsPage />} />

                    {/* Country Routes */}
                    <Route path="/countries" element={<CountryList />} />
                    <Route path="/countries/edit/:id" element={<EditCountryForm />} />
                    <Route path="/countries/view/:slug" element={<CountryViewModal />} />

                    {/* Popup Banner Routes */}
                    <Route path="/popup-banners" element={<PopupBannerPage />} />

                    {/* eG Library Routes */}
                    <Route path="/library" element={<LibraryPage />} />

                    {/* eG Academy Routes */}
                    <Route path="/eg-academy/courses" element={<EgAcademyCourseList />} />
                    {/* view before :slug — otherwise "view" is read as a slug */}
                    <Route path="/eg-academy/courses/view/:slug" element={<EgAcademyCourseViewPage />} />
                    <Route path="/eg-academy/courses/:slug" element={<EditEgAcademyCourse />} />

                    {/* Academy centre pages — the /centers pages on the academy site */}
                    <Route path="/eg-academy/centers" element={<CenterPageList />} />
                    <Route path="/eg-academy/centers/:slug" element={<EditCenterPage />} />
                </Route>
            </Route>
        </Route>,
    ),
);
