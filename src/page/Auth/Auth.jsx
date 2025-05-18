import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import "./Auth.css";
import ForgotPasswordForm from "./ForgotPasswordForm";
import SigninForm from "./SigninForm";
import SignupForm from "./SignupForm";
import { useAuth } from "@/lib/AuthContext";

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, authLoading } = useAuth();
    
    // 如果用户已登录，重定向到首页
    if (isLoggedIn && !authLoading) {
      return <Navigate to="/" replace />;
    }

    // 根据路径显示不同表单
    const getForm = () => {
      const path = location.pathname;
      
      if (path === "/signup") {
        return (
          <section>
            <SignupForm /> 
            <div className="flex items-center justify-center mt-4">
              <span className="mr-2">Already have an account?</span>
              <Button onClick={() => navigate("/signin")} variant="ghost">
                Sign in
              </Button>
            </div>
          </section>
        );
      } else if (path === "/forgot-password") {
        return (
          <section>
            <ForgotPasswordForm/>
            <div className="flex items-center justify-center mt-4">
              <span className="mr-2">Back to login?</span>
              <Button onClick={() => navigate("/signin")} variant="ghost">
                Sign in
              </Button>
            </div>
          </section>
        );
      } else {
        // 默认显示登录表单
        return (
          <section>
            <SigninForm/>
            <div className="flex items-center justify-center mt-4">
              <span className="mr-2">Don't have an account?</span>
              <Button onClick={() => navigate("/signup")} variant="ghost">
                Sign up
              </Button>
            </div>
            <div className="flex items-center justify-center mt-4">
              <Button 
                className="w-full py-6"
                onClick={() => navigate("/forgot-password")} variant="outline">
                Forgot Password
              </Button>
            </div>
          </section>
        );
      }
    };

    return (
      <div className='h-screen relative authContainer'>
        <div className='absolute top-0 right-0 left-0 bottom-0 bg-white bg-opacity-50'>
          <div className='bgBlure absolute top-1/2 left-1/2 transform 
          -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center 
          h-[35rem] w-[30rem] rounded-md z-50 bg-white bg-opacity-50 shadow-2xl shadow-white'>
            <h1 className="text-6xl font-bold pb-9">Crypto Trackr</h1>
            {authLoading ? (
              <div className="text-center">Loading...</div>
            ) : (
              getForm()
            )}
          </div>
        </div>
      </div>
    );
};

export default Auth;


