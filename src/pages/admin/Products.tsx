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
  Import,
  Download,
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
  price: string | number;
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

const API_BASE_URL = "https://srivelkanistore.site/api";

const Products = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([
    { id: Date.now().toString(), quantity: "1", price: "0" }
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchAllSubcategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
      setSubcategoryId("");
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

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

  const uploadImages = async (files: File[]): Promise<ProductImage[]> => {
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
        return data.urls.map((url: string, index: number) => ({
          id: Date.now().toString() + index,
          image_url: url,
          display_order: index.toString()
        }));
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
    setPricePoints([...pricePoints, { id: Date.now().toString(), quantity: "1", price: "0" }]);
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
      return quantity <= 0 || price < 0;
    })) {
      toast.error("Price points must have valid values");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Upload all images at once
      const uploadedImages = await uploadImages(imageFiles);
      
      const productData = {
        action: "add_product",
        category_id: categoryId,
        subcategory_id: subcategoryId,
        name,
        description,
        price_points: pricePoints.map(pp => ({
          quantity: pp.quantity,
          price: typeof pp.price === 'string' ? parseFloat(pp.price).toFixed(2) : pp.price
        })),
        images: uploadedImages,
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
    setPricePoints([{ id: Date.now().toString(), quantity: "1", price: "0" }]);
    setCategoryId("");
    setSubcategoryId("");
  };

  const handleCSVImportClick = () => {
    if (csvInputRef.current) {
      csvInputRef.current.click();
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    try {
      const text = await file.text();
      const productsToImport = parseCSV(text);
      
      let importCount = 0;
      let errorCount = 0;

      for (const product of productsToImport) {
        try {
          const category = categories.find(c => c.name === product.category);
          if (!category) {
            throw new Error(`Category '${product.category}' not found`);
          }

          const subcategory = subcategories.find(
            s => s.name === product.subcategory && s.category_id === category.id
          );
          if (!subcategory) {
            throw new Error(`Subcategory '${product.subcategory}' not found for category '${product.category}'`);
          }

          let pricePoints: PricePoint[] = [];
          if (product.pricePoints) {
            try {
              const ppArray = JSON.parse(product.pricePoints);
              pricePoints = ppArray.map((pp: any) => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                quantity: pp.quantity || "1",
                price: pp.price || "0"
              }));
            } catch (error) {
              throw new Error(`Invalid price points format: ${error.message}`);
            }
          } else {
            pricePoints = [{ id: Date.now().toString(), quantity: "1", price: product.price || "0" }];
          }

          const images = product.imageUrl ? [{
            id: Date.now().toString(),
            image_url: product.imageUrl,
            display_order: "0"
          }] : [];

          const productData = {
            action: "add_product",
            category_id: category.id,
            subcategory_id: subcategory.id,
            name: product.name || 'Unnamed Product',
            description: product.description || '',
            price_points: pricePoints,
            images: images,
          };
          
          const response = await fetch(`${API_BASE_URL}/index.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
          });
          
          const data = await response.json();
          if (data.status !== "success") {
            throw new Error(data.message || "Failed to add product via API");
          }

          importCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error importing product '${product.name}': ${error.message}`);
        }
      }

      if (importCount > 0) {
        toast.success(`Successfully imported ${importCount} products`);
        fetchProducts();
      }
      
      if (errorCount > 0) {
        toast.warning(`Failed to import ${errorCount} products. Check console for details.`);
      }

      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(`Failed to parse CSV: ${error.message}`);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `name,description,category,subcategory,price,imageUrl,pricePoints
"Product 1","This is a sample product","Electronics","Smartphones",599.99,"https://example.com/image1.jpg","[{""quantity"":""1"",""price"":""599.99""},{""quantity"":""5"",""price"":""549.99""}]"
"Product 2","Another sample product","Clothing","T-shirts",24.99,"https://example.com/image2.jpg","[{""quantity"":""1"",""price"":""24.99""},{""quantity"":""3"",""price"":""19.99""}]"`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-products.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Sample CSV file downloaded");
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const currentLine = lines[i].split(',');
      const obj: any = {};
      
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j] ? currentLine[j].trim().replace(/"/g, '') : '';
      }
      
      result.push(obj);
    }
    
    return result;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button onClick={handleCSVImportClick} variant="outline" disabled={isLoading}>
            <Import className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <input 
            type="file" 
            ref={csvInputRef}
            onChange={handleCSVImport}
            accept=".csv" 
            className="hidden" 
          />
          <Button onClick={downloadSampleCSV} variant="secondary" disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>
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
                  <div key={pricePoint.id} className="flex gap-2 items-center">
                    <div className="flex-1">
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
                    
                    <div className="flex-1">
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
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => handleRemovePricePoint(index)}
                        disabled={pricePoints.length === 1 || isLoading}
                        className="flex-shrink-0 mb-[1px]"
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
            <div className="grid gap-4">
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
                                return (
                                  <span key={pp.id} className="text-xs bg-muted px-2 py-1 rounded">
                                    {pp.quantity} units: ₹{typeof price === 'number' ? price.toFixed(2) : price}
                                  </span>
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
          <DialogContent className="max-w-3xl">
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
                      return (
                        <div key={pp.id} className="bg-muted p-3 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">Quantity:</span>
                            <span>{pp.quantity}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="font-medium">Price:</span>
                            <span>₹{typeof price === 'number' ? price.toFixed(2) : price}</span>
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
            
            <div className="flex justify-end">
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