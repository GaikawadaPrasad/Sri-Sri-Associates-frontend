import React from "react";
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/SignUp";
import ClientDashboard from "./pages/Client/ClientDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLeadTable from "./components/AdminLeadTable";
import ClientManagement from "./components/ClientManagement";
import EMICalculator from "./components/EMICalculator";
import LeadHistory from "./components/LeadHistory";
import LeadDetailsView from "./components/LeadDetailsView";
import LandingPage from "./pages/Public/LandingPage";


// const Layout = ({ children }) => (
//   <div className="flex bg-gray-50 min-h-screen">
//     <Sidebar />
//     <main className="flex-1 ml-64 p-8">{children}</main>
//   </div>
// );

// function App() {
// // const { user } = useContext(AuthContext);
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//       <Toaster 
//           position="top-right" 
//           toastOptions={{
//             duration: 4000,
//             style: {
//               background: '#333',
//               color: '#fff',
//               borderRadius: '10px',
//               fontSize: '14px'
//             },
//             success: {
//               iconTheme: { primary: '#10B981', secondary: '#fff' },
//             },
//             error: {
//               iconTheme: { primary: '#EF4444', secondary: '#fff' },
//             }
//           }} 
//         />
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           {/* / */}
//           <Route
//             path="/client/leads"
//             element={
//               <ProtectedRoute role="CLIENT">
//                 <Layout>
//                   <LeadHistory />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/admin/lead/:id" element={<LeadDetailsView />} />
//           <Route
//             path="/client/emi-calculator"
//             element={
//               <ProtectedRoute role="CLIENT">
//                 <Layout>
//                   <EMICalculator />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           {/* Client Routes */}
//           <Route
//             path="/client/dashboard"
//             element={
//               <ProtectedRoute role="CLIENT">
//                 <Layout>
//                   <ClientDashboard />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           {/* Admin Routes */}
//           <Route
//             path="/admin/dashboard"
//             element={
//               <ProtectedRoute role="ADMIN">
//                 <Layout>
//                   <AdminDashboard />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/leads"
//             element={
//               <ProtectedRoute role="ADMIN">
//                 <Layout>
//                   <AdminLeadTable />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/agents"
//             element={
//               <ProtectedRoute role="ADMIN">
//                 <Layout>
//                   <ClientManagement />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           {/* Redirects */}
//           <Route path="/" element={<Navigate to="/login" />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;




// ... keep imports the same

const Layout = ({ children }) => (
  <div className="flex bg-gray-50 min-h-screen">
    {/* Sidebar: Hidden on mobile, block on large screens */}
    <div className="hidden lg:block">
      <Sidebar />
    </div>
    
    {/* Main: No margin on mobile (ml-0), left margin on desktop (lg:ml-64) */}
    <main className="flex-1 ml-0 lg:ml-64 p-0 lg:p-8">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '14px'
            }
          }} 
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route
            path="/client/leads"
            element={
              <ProtectedRoute role="CLIENT">
                <Layout>
                  <LeadHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/lead/:id" element={<LeadDetailsView />} />
          
          <Route
            path="/client/emi-calculator"
            element={
              <ProtectedRoute role="CLIENT">
                <Layout>
                  <EMICalculator />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute role="CLIENT">
                <Layout>
                  <ClientDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/leads"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <AdminLeadTable />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/agents"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <ClientManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/emi-calculator"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <EMICalculator adminMode />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;