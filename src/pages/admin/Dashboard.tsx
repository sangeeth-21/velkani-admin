
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, FolderTree, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Categories",
      value: "Manage",
      icon: <Layers className="h-8 w-8 text-blue-500" />,
      path: "/admin/categories",
      description: "Add and manage product categories"
    },
    {
      title: "Subcategories",
      value: "Manage",
      icon: <FolderTree className="h-8 w-8 text-green-500" />,
      path: "/admin/subcategories",
      description: "Add and manage product subcategories"
    },
    {
      title: "Products",
      value: "Manage",
      icon: <ShoppingBag className="h-8 w-8 text-purple-500" />,
      path: "/admin/products",
      description: "Add and manage your product inventory"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Manage your products, categories, and subcategories.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => navigate(stat.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
              <div className="text-2xl font-bold mt-2">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
