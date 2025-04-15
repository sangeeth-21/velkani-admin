import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Minus,
  Upload,
  Trash,
  ShoppingBag,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

interface PricePointType {
  types: string;
}

const API_BASE_URL = "https://srivelkanistore.site/api";

const Products = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([
    { 
      id: Date.now().toString(), 
      quantity: "1", 
      type: "", 
      price: "0", 
      mrp: "0",
      stock: "0"
    }
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pricePointTypes, setPricePointTypes] = useState<PricePointType[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchAllSubcategories();
    fetchPricePointTypes();
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
      setSubcategoryId("");
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

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

  const fetchSubcategories = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/index.php?action=get_subcategories&category_id=${categoryId}`
      );
      const data = await response.json();
      if (data.status === "success") {
        setSubcategories(data.data);
      } else {
        toast.error("Failed to fetch subcategories");
      }
    } catch (error) {
      toast.error("Error fetching subcategories");
      console.error(error);
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

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("images[]", file);
    });
  
    try {
      const response = await fetch(`${API_BASE_URL}/multi-upload.php`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.status === "success") {
        return data.urls;
      }
      throw new Error(data.message || "Failed to upload images");
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...newFiles]);
      
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setImageUrls([...imageUrls, ...newUrls]);
    }
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    
    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);
    
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
  };
  
  const handleAddPricePoint = () => {
    setPricePoints([...pricePoints, { 
      id: Date.now().toString(), 
      quantity: "1", 
      type: "", 
      price: "0", 
      mrp: "0",
      stock: "0"
    }]);
  };
  
  const handleChangePricePoint = (
    index: number,
    field: keyof PricePoint,
    value: string
  ) => {
    const newPricePoints = [...pricePoints];
    newPricePoints[index] = {
      ...newPricePoints[index],
      [field]: value,
    };
    setPricePoints(newPricePoints);
  };
  
  const handleRemovePricePoint = (index: number) => {
    if (pricePoints.length > 1) {
      const newPricePoints = [...pricePoints];
      newPricePoints.splice(index, 1);
      setPricePoints(newPricePoints);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || !categoryId || !subcategoryId) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    
    if (pricePoints.some(pp => {
      const quantity = typeof pp.quantity === 'string' ? parseInt(pp.quantity) : pp.quantity;
      const price = typeof pp.price === 'string' ? parseFloat(pp.price) : pp.price;
      const mrp = typeof pp.mrp === 'string' ? parseFloat(pp.mrp) : pp.mrp;
      const stock = typeof pp.stock === 'string' ? parseInt(pp.stock) : pp.stock;
      return quantity <= 0 || price < 0 || mrp < 0 || price > mrp || stock < 0;
    })) {
      toast.error("Price points must have valid values (Price should be ≤ MRP, Stock ≥ 0)");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Upload all images at once
      const uploadedImageUrls = await uploadImages(imageFiles);
      
      const productData = {
        action: "add_product",
        category_id: categoryId,
        subcategory_id: subcategoryId,
        name,
        description,
        price_points: pricePoints.map(pp => ({
          quantity: pp.quantity,
          type: pp.type,
          price: typeof pp.price === 'string' ? parseFloat(pp.price).toFixed(2) : pp.price,
          mrp: typeof pp.mrp === 'string' ? parseFloat(pp.mrp).toFixed(2) : pp.mrp,
          stock: typeof pp.stock === 'string' ? parseInt(pp.stock) : pp.stock
        })),
        images: uploadedImageUrls,
      };
      
      const response = await fetch(`${API_BASE_URL}/index.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      if (data.status === "success") {
        toast.success("Product added successfully");
        fetchProducts();
        resetForm();
      } else {
        toast.error(data.message || "Failed to add product");
      }
    } catch (error) {
      toast.error("Error adding product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImageUrls([]);
    setPricePoints([{ 
      id: Date.now().toString(), 
      quantity: "1", 
      type: "", 
      price: "0", 
      mrp: "0",
      stock: "0"
    }]);
    setCategoryId("");
    setSubcategoryId("");
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

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Product Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    required
                    disabled={isLoading || categories.length === 0}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <SelectItem value="no-categories" disabled>
                          {isLoading ? "Loading categories..." : "No categories available"}
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={subcategoryId}
                    onValueChange={setSubcategoryId}
                    disabled={isLoading || !categoryId || subcategories.length === 0}
                    required
                  >
                    <SelectTrigger id="subcategory">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {!categoryId ? (
                        <SelectItem value="select-category" disabled>
                          Select a category first
                        </SelectItem>
                      ) : subcategories.length === 0 ? (
                        <SelectItem value="no-subcategories" disabled>
                          {isLoading ? "Loading subcategories..." : "No subcategories available"}
                        </SelectItem>
                      ) : (
                        subcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed border-border rounded-md p-4 text-center">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    disabled={isLoading}
                  />
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-32 flex flex-col items-center justify-center gap-2"
                    onClick={handleUploadClick}
                    disabled={isLoading}
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload product images
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </Button>
                </div>
                
                {imageUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden border border-border aspect-square">
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={() => handleRemoveImage(index)}
                          disabled={isLoading}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Price Points</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddPricePoint}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Price Point
                  </Button>
                </div>
                
                {pricePoints.map((pricePoint, index) => (
                  <div key={pricePoint.id} className="grid grid-cols-5 gap-2 items-center">
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Quantity"
                        value={pricePoint.quantity}
                        onChange={(e) => handleChangePricePoint(
                          index, 
                          'quantity',
                          e.target.value
                        )}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={pricePoint.type}
                        onValueChange={(value) => handleChangePricePoint(index, 'type', value)}
                        disabled={isLoading}
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
                    
                    <div>
                      <Label className="text-xs">Price (₹)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Price"
                        value={pricePoint.price}
                        onChange={(e) => handleChangePricePoint(
                          index, 
                          'price',
                          e.target.value
                        )}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">MRP (₹)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="MRP"
                        value={pricePoint.mrp}
                        onChange={(e) => handleChangePricePoint(
                          index, 
                          'mrp',
                          e.target.value
                        )}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Stock"
                        value={pricePoint.stock}
                        onChange={(e) => handleChangePricePoint(
                          index, 
                          'stock',
                          e.target.value
                        )}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="col-span-5 flex justify-end">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => handleRemovePricePoint(index)}
                        disabled={pricePoints.length === 1 || isLoading}
                        className="flex-shrink-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !categoryId || !subcategoryId || categories.length === 0 || subcategories.length === 0}
              >
                {isLoading ? (
                  <span>Adding Product...</span>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </>
                )}
              </Button>
              
              {(categories.length === 0 || subcategories.length === 0) && (
                <p className="text-sm text-center text-muted-foreground">
                  {categories.length === 0 
                    ? "No categories available"
                    : "Please select a category to see subcategories"}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
        
        {/* Products List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Products</h2>
          
          {isLoading && products.length === 0 ? (
            <p className="text-muted-foreground">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground">No products added yet.</p>
          ) : (
            <div className="grid gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pb-4">
              {products.map((product) => {
                const category = categories.find(c => c.id === product.category_id);
                const primaryImage = product.images && product.images.length > 0 
                  ? product.images[0].image_url 
                  : null;
                
                return (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-border">
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
                                  <div key={pp.id} className="text-xs bg-muted px-2 py-1 rounded">
                                    {pp.quantity} {pp.type ? `(${pp.type})` : ''}: 
                                    <span className="font-medium"> ₹{typeof price === 'number' ? price.toFixed(2) : price}</span>
                                    {mrp > price && (
                                      <span className="ml-1 line-through text-muted-foreground">₹{typeof mrp === 'number' ? mrp.toFixed(2) : mrp}</span>
                                    )}
                                    <span className="ml-1 text-muted-foreground">| Stock: {stock}</span>
                                  </div>
                                );
                              })}
                            </div>
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
      </div>
      
      {/* Product Preview Dialog */}
      <Dialog open={!!previewProduct} onOpenChange={(open) => !open && setPreviewProduct(null)}>
        {previewProduct && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{previewProduct.name}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Product Images */}
              {previewProduct.images && previewProduct.images.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
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
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Category</h3>
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
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
                  <p className="text-sm">{previewProduct.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Price Points</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {previewProduct.price_points && previewProduct.price_points.map((pp) => {
                      const price = typeof pp.price === 'string' ? parseFloat(pp.price) : pp.price;
                      const mrp = typeof pp.mrp === 'string' ? parseFloat(pp.mrp) : pp.mrp;
                      const stock = typeof pp.stock === 'string' ? parseInt(pp.stock) : pp.stock;
                      return (
                        <div key={pp.id} className="bg-muted p-3 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">Quantity:</span>
                            <span>{pp.quantity} {pp.type ? `(${pp.type})` : ''}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="font-medium">Price:</span>
                            <span>₹{typeof price === 'number' ? price.toFixed(2) : price}</span>
                          </div>
                          {mrp > price && (
                            <div className="flex justify-between mt-1">
                              <span className="font-medium">MRP:</span>
                              <span className="line-through">₹{typeof mrp === 'number' ? mrp.toFixed(2) : mrp}</span>
                            </div>
                          )}
                          {mrp > price && (
                            <div className="flex justify-between mt-1 text-green-600">
                              <span className="font-medium">Discount:</span>
                              <span>{Math.round(((mrp - price) / mrp) * 100)}% off</span>
                            </div>
                          )}
                          <div className="flex justify-between mt-1">
                            <span className="font-medium">Stock:</span>
                            <span className={stock <= 0 ? "text-red-500" : ""}>
                              {stock} {stock <= 0 ? "(Out of Stock)" : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Created</h3>
                  <p className="text-sm">
                    {new Date(previewProduct.created_at).toLocaleString()}
                  </p>
                </div>
                
                {previewProduct.updated_at !== previewProduct.created_at && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Last Updated</h3>
                    <p className="text-sm">
                      {new Date(previewProduct.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end sticky bottom-0 bg-background pt-4 pb-2">
              <Button variant="outline" onClick={() => setPreviewProduct(null)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Products;