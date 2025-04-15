import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Eye,
  Trash,
  Search,
  Edit,
  X,
  ShoppingBag,
  Plus,
  Minus,
  BadgePercent,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface PricePoint {
  id: string;
  quantity: string | number;
  type: string;
  price: string | number;
  mrp: string | number;
  stock: string | number;
  discount_percent: number;
}

interface ProductImage {
  id: string;
  image_url: string;
  display_order: string;
}

interface Product {
  id: string;
  category_id: string;
  subcategory_id: string;
  name: string;
  description: string;
  images: ProductImage[];
  price_points: PricePoint[];
  created_at: string;
  updated_at: string;
  offer: string | null;
}

interface PricePointType {
  types: string;
}

const API_BASE_URL = "https://srivelkanistore.site/api";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatingOffer, setUpdatingOffer] = useState<string | null>(null);
  const [pricePointTypes, setPricePointTypes] = useState<PricePointType[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchAllSubcategories();
    fetchPricePointTypes();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const fetchPricePointTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/types.php`);
      const data = await response.json();
      if (data.status === "success") {
        setPricePointTypes(data.data);
      } else {
        toast.error("Failed to fetch price point types");
      }
    } catch (error) {
      toast.error("Error fetching price point types");
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/index.php?action=get_categories`);
      const data = await response.json();
      if (data.status === "success") {
        setCategories(data.data);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      toast.error("Error fetching categories");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllSubcategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/index.php?action=get_all_subcategories`);
      const data = await response.json();
      if (data.status === "success") {
        setAllSubcategories(data.data);
      } else {
        console.log("Could not fetch all subcategories at once");
      }
    } catch (error) {
      console.error("Error fetching all subcategories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/index.php?action=get_products`);
      const data = await response.json();
      if (data.status === "success") {
        setProducts(data.data);
        setFilteredProducts(data.data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      toast.error("Error fetching products");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = allSubcategories.find(s => s.id === subcategoryId) || 
                       subcategories.find(s => s.id === subcategoryId);
    return subcategory ? subcategory.name : "Unknown";
  };

  const handlePreviewProduct = (product: Product) => {
    setPreviewProduct(product);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`${API_BASE_URL}/index.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete_product",
          id: productId
        }),
      });
      
      const data = await response.json();
      if (data.status === "success") {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error("Error deleting product");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(product))); // Deep copy
    setIsEditing(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/index.php`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_product",
          id: editingProduct.id,
          name: editingProduct.name,
          description: editingProduct.description,
          price_points: editingProduct.price_points.map(pp => ({
            quantity: pp.quantity,
            type: pp.type,
            price: pp.price,
            mrp: pp.mrp,
            stock: pp.stock,
            discount_percent: pp.discount_percent
          })),
          images: editingProduct.images.map(img => ({
            image_url: img.image_url,
            display_order: img.display_order
          }))
        }),
      });
      
      const data = await response.json();
      if (data.status === "success") {
        toast.success("Product updated successfully");
        fetchProducts();
        setIsEditing(false);
      } else {
        toast.error(data.message || "Failed to update product");
      }
    } catch (error) {
      toast.error("Error updating product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = (index: number, field: 'quantity' | 'price' | 'mrp' | 'discount_percent' | 'type' | 'stock', value: string) => {
    if (!editingProduct) return;
    
    const updatedPricePoints = [...editingProduct.price_points];
    updatedPricePoints[index] = {
      ...updatedPricePoints[index],
      [field]: field === 'price' || field === 'mrp' ? 
                parseFloat(value) || 0 : 
                field === 'discount_percent' || field === 'stock' ? 
                parseInt(value) || 0 : 
                field === 'type' ?
                value :
                parseInt(value) || 1
    };
    
    setEditingProduct({
      ...editingProduct,
      price_points: updatedPricePoints
    });
  };

  const handleAddPricePoint = () => {
    if (!editingProduct) return;
    
    setEditingProduct({
      ...editingProduct,
      price_points: [
        ...editingProduct.price_points,
        { 
          id: Date.now().toString(), 
          quantity: 1, 
          type: "",
          price: 0,
          mrp: 0,
          stock: 0,
          discount_percent: 0
        }
      ]
    });
  };

  const handleRemovePricePoint = (index: number) => {
    if (!editingProduct || editingProduct.price_points.length <= 1) return;
    
    const updatedPricePoints = [...editingProduct.price_points];
    updatedPricePoints.splice(index, 1);
    
    setEditingProduct({
      ...editingProduct,
      price_points: updatedPricePoints
    });
  };

  const handleImageUrlChange = (index: number, value: string) => {
    if (!editingProduct) return;
    
    const updatedImages = [...editingProduct.images];
    updatedImages[index] = {
      ...updatedImages[index],
      image_url: value
    };
    
    setEditingProduct({
      ...editingProduct,
      images: updatedImages
    });
  };

  const handleAddImage = () => {
    if (!editingProduct) return;
    
    setEditingProduct({
      ...editingProduct,
      images: [
        ...editingProduct.images,
        { id: Date.now().toString(), image_url: "", display_order: editingProduct.images.length.toString() }
      ]
    });
  };

  const handleRemoveImage = (index: number) => {
    if (!editingProduct || editingProduct.images.length <= 1) return;
    
    const updatedImages = [...editingProduct.images];
    updatedImages.splice(index, 1);
    
    setEditingProduct({
      ...editingProduct,
      images: updatedImages
    });
  };

  const toggleOfferStatus = async (productId: string, currentStatus: string | null) => {
    const isCurrentlyInOffer = currentStatus === "1";
    const action = isCurrentlyInOffer ? "remove_from_offers" : "add_to_offers";
    
    try {
      setUpdatingOffer(productId);
      const response = await fetch(`${API_BASE_URL}/index.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          product_id: productId
        }),
      });
      
      const data = await response.json();
      if (data.status === "success") {
        toast.success(`Product ${isCurrentlyInOffer ? "removed from" : "added to"} offers`);
        fetchProducts();
      } else {
        toast.error(data.message || `Failed to ${isCurrentlyInOffer ? "remove from" : "add to"} offers`);
      }
    } catch (error) {
      toast.error(`Error ${isCurrentlyInOffer ? "removing from" : "adding to"} offers`);
      console.error(error);
    } finally {
      setUpdatingOffer(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        {isLoading && filteredProducts.length === 0 ? (
          <p className="text-muted-foreground">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-muted-foreground">
            {searchTerm ? "No products match your search" : "No products available"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const category = categories.find(c => c.id === product.category_id);
              const primaryImage = product.images && product.images.length > 0 
                ? product.images[0].image_url 
                : null;
              const isInOffer = product.offer === "1";
              
              return (
                <Card key={product.id} className="relative">
                  {isInOffer && (
                    <div className="absolute top-2 right-2 z-10">
                      <BadgePercent className="h-6 w-6 text-yellow-500 bg-white rounded-full p-1 shadow-sm" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex-shrink-0 w-full aspect-square rounded-md overflow-hidden border border-border">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Error";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{product.name}</h3>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handlePreviewProduct(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={isDeleting}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1 mb-2">
                          {category && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {category.name}
                            </span>
                          )}
                          <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                              {getSubcategoryName(product.subcategory_id)}
                            </span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </div>
                        
                        <div className="mt-3">
                          <h4 className="text-xs font-medium text-muted-foreground mb-1">Price Points:</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.price_points && product.price_points.map((pp) => {
                              const price = typeof pp.price === 'string' ? parseFloat(pp.price) : pp.price;
                              const mrp = typeof pp.mrp === 'string' ? parseFloat(pp.mrp) : pp.mrp;
                              const stock = typeof pp.stock === 'string' ? parseInt(pp.stock) : pp.stock;
                              return (
                                <span key={pp.id} className="text-xs bg-muted px-2 py-1 rounded">
                                  {pp.quantity} {pp.type ? `(${pp.type})` : ''}: ₹{typeof price === 'number' ? price.toFixed(2) : price}
                                  {mrp > price && (
                                    <span className="line-through text-muted-foreground ml-1">₹{mrp.toFixed(2)}</span>
                                  )}
                                  <span className="ml-1 text-muted-foreground">| Stock: {stock}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <Label htmlFor={`offer-toggle-${product.id}`} className="flex items-center gap-2">
                            <BadgePercent className="h-4 w-4" />
                            <span>Offer</span>
                          </Label>
                          <Switch
                            id={`offer-toggle-${product.id}`}
                            checked={isInOffer}
                            onCheckedChange={() => toggleOfferStatus(product.id, product.offer)}
                            disabled={updatingOffer === product.id}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Preview Dialog */}
      <Dialog open={!!previewProduct} onOpenChange={(open) => !open && setPreviewProduct(null)}>
        {previewProduct && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pt-6">
              <DialogTitle className="text-xl">{previewProduct.name}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6 py-4 px-6">
              {/* Product Images */}
              {previewProduct.images && previewProduct.images.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {previewProduct.images
                    .sort((a, b) => parseInt(a.display_order) - parseInt(b.display_order))
                    .map((image) => (
                      <div key={image.id} className="border rounded-md overflow-hidden aspect-square">
                        <img 
                          src={image.image_url} 
                          alt={`${previewProduct.name} - image`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Error";
                          }}
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-md bg-muted h-48 flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Category</h3>
                  <div className="flex gap-2">
                    {categories.find(c => c.id === previewProduct.category_id) && (
                      <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {categories.find(c => c.id === previewProduct.category_id)?.name}
                      </span>
                    )}
                    <span className="text-sm bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                      {getSubcategoryName(previewProduct.subcategory_id)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm">{previewProduct.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Price Points</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewProduct.price_points && previewProduct.price_points.map((pp) => {
                      const price = typeof pp.price === 'string' ? parseFloat(pp.price) : pp.price;
                      const mrp = typeof pp.mrp === 'string' ? parseFloat(pp.mrp) : pp.mrp;
                      const stock = typeof pp.stock === 'string' ? parseInt(pp.stock) : pp.stock;
                      return (
                        <div key={pp.id} className="bg-muted p-4 rounded-md">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">Quantity:</span>
                                <span>{pp.quantity} {pp.type ? `(${pp.type})` : ''}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Price:</span>
                                <span>₹{typeof price === 'number' ? price.toFixed(2) : price}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {mrp > price && (
                                <div className="flex justify-between">
                                  <span className="font-medium">MRP:</span>
                                  <span className="line-through">₹{mrp.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="font-medium">Stock:</span>
                                <span className={stock <= 0 ? "text-red-500" : ""}>
                                  {stock} {stock <= 0 ? "(Out of Stock)" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between">
                              <span className="font-medium">Discount:</span>
                              <span className="text-green-600">{pp.discount_percent}% off</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="py-4 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Offer Status</h3>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={previewProduct.offer === "1"}
                      onCheckedChange={() => toggleOfferStatus(previewProduct.id, previewProduct.offer)}
                      disabled={updatingOffer === previewProduct.id}
                    />
                    <span className="text-sm">{previewProduct.offer === "1" ? "Currently in Offers" : "Not in Offers"}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Created</h3>
                    <p className="text-sm">
                      {new Date(previewProduct.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  {previewProduct.updated_at !== previewProduct.created_at && (
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Last Updated</h3>
                      <p className="text-sm">
                        {new Date(previewProduct.updated_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="sticky bottom-0 bg-background border-t p-4">
              <Button variant="outline" onClick={() => setPreviewProduct(null)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        {editingProduct && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mt-4">
              <DialogTitle className="text-xl">Edit Product</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6 py-4 px-6">
              <div className="space-y-3">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Price Points</Label>
                  <Button variant="outline" size="sm" onClick={handleAddPricePoint}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Price Point
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {editingProduct.price_points.map((pp, index) => (
                    <div key={pp.id || index} className="grid grid-cols-6 gap-3 items-end">
                      <div className="space-y-2">
                        <Label className="text-sm">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={pp.quantity}
                          onChange={(e) => handlePriceChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Type</Label>
                        <Select
                          value={pp.type}
                          onValueChange={(value) => handlePriceChange(index, 'type', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {pricePointTypes.map((type) => (
                              <SelectItem key={type.types} value={type.types}>
                                {type.types}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">MRP (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={pp.mrp}
                          onChange={(e) => handlePriceChange(index, 'mrp', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Price (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={pp.price}
                          onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Stock</Label>
                        <Input
                          type="number"
                          min="0"
                          value={pp.stock}
                          onChange={(e) => handlePriceChange(index, 'stock', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 mb-[0.35rem]"
                        onClick={() => handleRemovePricePoint(index)}
                        disabled={editingProduct.price_points.length <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Images</Label>
                  <Button variant="outline" size="sm" onClick={handleAddImage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {editingProduct.images.map((img, index) => (
                    <div key={img.id || index} className="space-y-3">
                      <div className="flex gap-3 items-end">
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm">Image URL {index + 1}</Label>
                          <Input
                            value={img.image_url}
                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 mb-[0.35rem]"
                          onClick={() => handleRemoveImage(index)}
                          disabled={editingProduct.images.length <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      {img.image_url && (
                        <div className="mt-1 w-32 h-32 border rounded-md overflow-hidden">
                          <img
                            src={img.image_url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Error";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t">
                <Label className="flex items-center gap-2">
                  <BadgePercent className="h-4 w-4" />
                  <span>Add to Offers</span>
                </Label>
                <Switch
                  checked={editingProduct.offer === "1"}
                  onCheckedChange={(checked) => {
                    setEditingProduct({
                      ...editingProduct,
                      offer: checked ? "1" : "0"
                    });
                  }}
                />
              </div>
            </div>
            
            <DialogFooter className="sticky bottom-0 bg-background border-t p-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProduct} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Products;