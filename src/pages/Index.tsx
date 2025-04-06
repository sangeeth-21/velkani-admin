
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      navigate("/admin");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            SriVelkani Store
          </h1>
          <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Manage your categories, subcategories, and products
          </p>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={() => navigate("/login")} 
            className="w-full"
            size="lg"
          >
            Login to Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
