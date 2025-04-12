import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Layers, 
  FolderTree, 
  ShoppingBag, 
  ShoppingCart,
  Users,
  BadgePercent,
  ArrowUp,
  ArrowDown,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    products: 0,
    orders: 0,
    users: 0,
    offers: 0,
    revenue: 0,
    orderGrowth: 0
  });

  useEffect(() => {
    // Simulate API fetch
    const fetchStats = async () => {
      try {
        // In a real app, you would fetch these from your API
        setTimeout(() => {
          setStats({
            categories: 12,
            subcategories: 45,
            products: 156,
            orders: 324,
            users: 89,
            offers: 8,
            revenue: 125000,
            orderGrowth: 12.5
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardCards = [
    {
      title: "Categories",
      value: stats.categories,
      icon: <Layers className="h-6 w-6 text-blue-500" />,
      path: "/admin/categories",
      description: "Product categories",
      change: 0
    },
    {
      title: "Subcategories",
      value: stats.subcategories,
      icon: <FolderTree className="h-6 w-6 text-green-500" />,
      path: "/admin/subcategories",
      description: "Product subcategories",
      change: 0
    },
    {
      title: "Products",
      value: stats.products,
      icon: <ShoppingBag className="h-6 w-6 text-purple-500" />,
      path: "/admin/products",
      description: "Products in inventory",
      change: 0
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: <ShoppingCart className="h-6 w-6 text-orange-500" />,
      path: "/admin/orders",
      description: "Total orders",
      change: stats.orderGrowth
    },
    {
      title: "Users",
      value: stats.users,
      icon: <Users className="h-6 w-6 text-cyan-500" />,
      path: "/admin/users",
      description: "Registered users",
      change: 0
    },
    {
      title: "Offers",
      value: stats.offers,
      icon: <BadgePercent className="h-6 w-6 text-red-500" />,
      path: "/admin/offers",
      description: "Active offers",
      change: 0
    },
    {
      title: "Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: <TrendingUp className="h-6 w-6 text-emerald-500" />,
      path: "/admin/orders",
      description: "Total revenue",
      change: stats.orderGrowth
    }
  ];

  const formatChange = (value: number) => {
    if (value > 0) {
      return (
        <span className="text-green-500 flex items-center">
          <ArrowUp className="h-4 w-4 mr-1" />
          {value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="text-red-500 flex items-center">
          <ArrowDown className="h-4 w-4 mr-1" />
          {Math.abs(value)}%
        </span>
      );
    }
    return <span className="text-gray-500">0%</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.slice(0, 4).map((stat) => (
          <Card 
            key={stat.title} 
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => navigate(stat.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="h-6 w-6 text-muted-foreground group-hover:text-current">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                {stat.change !== 0 && (
                  <div className="text-xs">
                    {formatChange(stat.change)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.slice(4).map((stat) => (
          <Card 
            key={stat.title} 
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => navigate(stat.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="h-6 w-6 text-muted-foreground group-hover:text-current">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                {stat.change !== 0 && (
                  <div className="text-xs">
                    {formatChange(stat.change)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">New order received</p>
                  <p className="text-sm text-muted-foreground">Order #ORD-1234 for ₹2,499</p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  2 min ago
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-sm text-muted-foreground">user@example.com</p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  15 min ago
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Product added</p>
                  <p className="text-sm text-muted-foreground">"Premium Headphones" added to inventory</p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  1 hour ago
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;