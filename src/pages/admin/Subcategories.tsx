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
import { Plus, Image as ImageIcon, Upload, X, Trash2 } from "lucide-react";
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
  name: string;
  description: string;
  image_url: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

const Subcategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://api.specd.in/velkani/index.php?action=get_categories"
      );
      const data = await response.json();
      if (data.status === "success") {
        setCategories(data.data);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      toast.error("Error fetching categories");
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subcategories from API
  const fetchSubcategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://api.specd.in/velkani/index.php?action=get_subcategories"
      );
      const data = await response.json();
      if (data.status === "success") {
        setSubcategories(data.data);
      } else {
        toast.error("Failed to fetch subcategories");
      }
    } catch (error) {
      toast.error("Error fetching subcategories");
      console.error("Error fetching subcategories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("https://api.specd.in/velkani/upload.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.status === "success") {
        return data.url;
      } else {
        toast.error("Failed to upload image");
        return null;
      }
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Error uploading image:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !imageFile || !categoryId) {
      toast.error("Please fill all fields and select an image");
      return;
    }

    try {
      setIsLoading(true);
      
      // First upload the image
      const imageUrl = await uploadImage(imageFile);
      if (!imageUrl) return;

      // Then create the subcategory with the image URL
      const response = await fetch(
        "https://api.specd.in/velkani/index.php?action=add_subcategory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category_id: categoryId,
            name,
            description,
            image_url: imageUrl,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Subcategory added successfully");
        setName("");
        setDescription("");
        removeImage();
        // Refresh the subcategories list
        await fetchSubcategories();
      } else {
        toast.error(data.message || "Failed to add subcategory");
      }
    } catch (error) {
      toast.error("Error adding subcategory");
      console.error("Error adding subcategory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      setIsDeleteLoading(true);
      const response = await fetch(
        "https://api.specd.in/velkani/index.php?action=delete_subcategory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: subcategoryId,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Subcategory deleted successfully");
        setSelectedSubcategory(null);
        await fetchSubcategories();
      } else {
        toast.error(data.message || "Failed to delete subcategory");
      }
    } catch (error) {
      toast.error("Error deleting subcategory");
      console.error("Error deleting subcategory:", error);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Subcategories</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Add Subcategory Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add New Subcategory</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Parent Category</Label>
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Subcategory name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? "Uploading..." : "Select Image"}
                    </Button>
                    <Input
                      id="image"
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeImage}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-2 rounded-md overflow-hidden border border-border w-20 h-20">
                      <img
                        src={imagePreview}
                        alt="Subcategory preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Subcategory description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isUploading || categories.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isLoading ? "Adding..." : "Add Subcategory"}
              </Button>
              
              {categories.length === 0 && (
                <p className="text-sm text-center text-muted-foreground">
                  Please add categories first before adding subcategories
                </p>
              )}
            </form>
          </CardContent>
        </Card>
        
        {/* Subcategories List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Subcategories</h2>
          
          {isLoading && subcategories.length === 0 ? (
            <p className="text-muted-foreground">Loading subcategories...</p>
          ) : subcategories.length === 0 ? (
            <p className="text-muted-foreground">No subcategories added yet.</p>
          ) : (
            <div className="grid gap-4">
              {subcategories.map((subcategory) => {
                const parentCategory = getCategoryById(subcategory.category_id);
                
                return (
                  <Card 
                    key={subcategory.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedSubcategory(subcategory)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-border">
                        {subcategory.image_url ? (
                          <img
                            src={subcategory.image_url}
                            alt={subcategory.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "httpss://placehold.co/200x200?text=Error";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{subcategory.name}</h3>
                          {parentCategory && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {parentCategory.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {subcategory.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subcategory Details Dialog */}
      <Dialog
        open={!!selectedSubcategory}
        onOpenChange={(open) => !open && setSelectedSubcategory(null)}
      >
        <DialogContent className="sm:max-w-[625px]">
          {selectedSubcategory && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSubcategory.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full h-64 rounded-md overflow-hidden border border-border">
                    {selectedSubcategory.image_url ? (
                      <img
                        src={selectedSubcategory.image_url}
                        alt={selectedSubcategory.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "httpss://placehold.co/600x400?text=Image+Not+Found";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="w-full space-y-2">
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="mt-1">{selectedSubcategory.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="text-muted-foreground">Parent Category</Label>
                        <p className="mt-1">
                          {getCategoryById(selectedSubcategory.category_id)?.name || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Created At</Label>
                        <p className="mt-1">
                          {new Date(selectedSubcategory.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteSubcategory(selectedSubcategory.id)}
                  disabled={isDeleteLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleteLoading ? "Deleting..." : "Delete Subcategory"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubcategory(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subcategories;