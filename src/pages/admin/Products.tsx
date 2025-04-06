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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Minus,
  Upload,
  Trash,
  ShoppingBag,
  Import,
  Download,
  FileText,
} from "lucide-react";
import { useDataStore, PricePoint } from "@/stores/dataStore";
import { toast } from "sonner";
import { parseCSV } from "@/utils/csvUtils";
import SqlDocumentation from "@/components/SqlDocumentation";

const Products = () => {
  const { 
    categories, 
    subcategories, 
    products,
    addProduct, 
    getSubcategoriesByCategoryId, 
    getCategoryById 
  } = useDataStore();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [pricePoints, setPricePoints] = useState<Omit<PricePoint, "id">[]>([
    { quantity: 1, price: 0 }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState(subcategories);

  useEffect(() => {
    if (categoryId) {
      setFilteredSubcategories(getSubcategoriesByCategoryId(categoryId));
      setSubcategoryId("");
    } else {
      setFilteredSubcategories([]);
    }
  }, [categoryId, getSubcategoriesByCategoryId]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...newFiles]);
      
      // Generate preview URLs for the new files
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
    // Release object URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);
    
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
  };
  
  const handleAddPricePoint = () => {
    setPricePoints([...pricePoints, { quantity: 1, price: 0 }]);
  };
  
  const handleChangePricePoint = (
    index: number,
    field: keyof Omit<PricePoint, "id">,
    value: number
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
    
    if (pricePoints.some(pp => pp.quantity <= 0 || pp.price < 0)) {
      toast.error("Price points must have valid values");
      return;
    }
    
    // In a real application, we would upload the images to a server or storage service
    // For now, we'll just use the object URLs as placeholders
    
    addProduct({
      name,
      description,
      images: imageUrls,
      categoryId,
      subcategoryId,
      pricePoints: pricePoints.map(pp => ({
        ...pp,
        id: crypto.randomUUID(),
      })),
    });
    
    // Reset form
    setName("");
    setDescription("");
    // Release all object URLs to prevent memory leaks
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImageUrls([]);
    setPricePoints([{ quantity: 1, price: 0 }]);
    
    toast.success("Product added successfully");
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
      const products = parseCSV(text);
      
      let importCount = 0;
      let errorCount = 0;

      products.forEach(product => {
        try {
          // Check if category exists
          const category = categories.find(c => c.name === product.category);
          if (!category) {
            throw new Error(`Category '${product.category}' not found`);
          }

          // Check if subcategory exists
          const subcategory = subcategories.find(
            s => s.name === product.subcategory && s.categoryId === category.id
          );
          if (!subcategory) {
            throw new Error(`Subcategory '${product.subcategory}' not found for category '${product.category}'`);
          }

          // Parse price points
          let pricePoints: Omit<PricePoint, "id">[] = [];
          if (product.pricePoints) {
            try {
              const ppArray = JSON.parse(product.pricePoints);
              pricePoints = ppArray.map((pp: any) => ({
                quantity: parseInt(pp.quantity) || 1,
                price: parseFloat(pp.price) || 0
              }));
            } catch (error) {
              throw new Error(`Invalid price points format: ${error.message}`);
            }
          } else {
            // Default price point if not provided
            pricePoints = [{ quantity: 1, price: parseFloat(product.price) || 0 }];
          }

          // Add the product
          addProduct({
            name: product.name || 'Unnamed Product',
            description: product.description || '',
            images: product.imageUrl ? [product.imageUrl] : [],
            categoryId: category.id,
            subcategoryId: subcategory.id,
            pricePoints: pricePoints.map(pp => ({
              ...pp,
              id: crypto.randomUUID(),
            })),
          });

          importCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error importing product '${product.name}': ${error.message}`);
        }
      });

      if (importCount > 0) {
        toast.success(`Successfully imported ${importCount} products`);
      }
      
      if (errorCount > 0) {
        toast.warning(`Failed to import ${errorCount} products. Check console for details.`);
      }

      // Reset file input
      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(`Failed to parse CSV: ${error.message}`);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `name,description,category,subcategory,price,imageUrl,pricePoints
"Product 1","This is a sample product","Electronics","Smartphones",599.99,"https://example.com/image1.jpg","[{""quantity"":1,""price"":599.99},{""quantity"":5,""price"":549.99}]"
"Product 2","Another sample product","Clothing","T-shirts",24.99,"https://example.com/image2.jpg","[{""quantity"":1,""price"":24.99},{""quantity"":3,""price"":19.99}]"`;
    
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button onClick={handleCSVImportClick} variant="outline">
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
          <Button onClick={downloadSampleCSV} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download Sample CSV
          </Button>
          
          {/* Documentation Menu Trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                SQL Schema
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[800px] max-w-[90vw]" align="end">
              <SqlDocumentation 
                title="Product Database Schema" 
                sqlSchema={sqlSchema} 
              />
            </PopoverContent>
          </Popover>
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
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <SelectItem value="no-categories" disabled>
                          No categories available
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
                    disabled={!categoryId || filteredSubcategories.length === 0}
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
                      ) : filteredSubcategories.length === 0 ? (
                        <SelectItem value="no-subcategories" disabled>
                          No subcategories available
                        </SelectItem>
                      ) : (
                        filteredSubcategories.map((subcategory) => (
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
                  />
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-32 flex flex-col items-center justify-center gap-2"
                    onClick={handleUploadClick}
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
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Price Point
                  </Button>
                </div>
                
                {pricePoints.map((pricePoint, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        value={pricePoint.quantity}
                        onChange={(e) => handleChangePricePoint(
                          index, 
                          'quantity',
                          parseInt(e.target.value) || 0
                        )}
                        required
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={pricePoint.price}
                        onChange={(e) => handleChangePricePoint(
                          index, 
                          'price',
                          parseFloat(e.target.value) || 0
                        )}
                        required
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => handleRemovePricePoint(index)}
                        disabled={pricePoints.length === 1}
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
                disabled={!categoryId || !subcategoryId || categories.length === 0 || filteredSubcategories.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              
              {(categories.length === 0 || filteredSubcategories.length === 0) && (
                <p className="text-sm text-center text-muted-foreground">
                  {categories.length === 0 
                    ? "Please add categories first"
                    : "Please add subcategories for the selected category"}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
        
        {/* Products List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Products</h2>
          
          {products.length === 0 ? (
            <p className="text-muted-foreground">No products added yet.</p>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => {
                const category = getCategoryById(product.categoryId);
                const subcategory = filteredSubcategories.find(
                  (s) => s.id === product.subcategoryId
                );
                
                return (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-border">
                          {product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
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
                          <h3 className="font-medium">{product.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1 mb-2">
                            {category && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {category.name}
                              </span>
                            )}
                            {subcategory && (
                              <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                                {subcategory.name}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </div>
                          
                          <div className="mt-3">
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Price Points:</h4>
                            <div className="flex flex-wrap gap-2">
                              {product.pricePoints.map((pp, idx) => (
                                <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                  {pp.quantity} units: ${pp.price.toFixed(2)}
                                </span>
                              ))}
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
      
      {/* Remove the SQL Schema Documentation section as we've moved it to a popover */}
    </div>
  );
};

export default Products;
