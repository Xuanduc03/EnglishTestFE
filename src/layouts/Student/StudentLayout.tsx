import React from "react";
import { Layout } from "antd";
import Header from "./Header/Header";
import { useLocation } from "react-router-dom";

const { Content } = Layout;

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const location = useLocation();
  const noLayoutPaths = [
    "/login",
    "/register",
    "/forgot",
    "/checkout",
    "/reset-password",
    "FullTestPage",
    "/practice/toeic/listening/part1", // Thêm đường dẫn của QuestionPart1
  ];
  const isNoLayout = noLayoutPaths.some(path => 
    location.pathname.startsWith(path) // Dùng startsWith để match cả các sub-routes
  );

  if (isNoLayout) {
    return <>{children}</>;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />
      <Content 
        style={{ 
          marginTop: "70px",
          minHeight: "calc(100vh - 70px)",
          padding: "24px",
          backgroundColor: "#f8fafc"
        }}
        className="site-layout-content"
      >
        <div 
          style={{ 
            maxWidth: "1400px", 
            margin: "0 auto",
            width: "100%"
          }}
        >
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default StudentLayout;