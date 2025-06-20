import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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

  useEffect(() => {
    fetchCategories();
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

      const response = await fetch("https://ghost.a1h.in/api/upload.php", {
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

    if (!name || !description || !imageFile) {
      toast.error("Please fill all fields and select an image");
      return;
    }

    try {
      setIsLoading(true);
      
      // First upload the image
      const imageUrl = await uploadImage(imageFile);
      if (!imageUrl) return;

      // Then create the category with the image URL
      const response = await fetch(
        "https://api.specd.in/velkani/index.php?action=add_category",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            image_url: imageUrl,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Category added successfully");
        setName("");
        setDescription("");
        removeImage();
        // Refresh the categories list
        await fetchCategories();
      } else {
        toast.error(data.message || "Failed to add category");
      }
    } catch (error) {
      toast.error("Error adding category");
      console.error("Error adding category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsDeleteLoading(true);
      
      const response = await fetch(
        "https://api.specd.in/velkani/index.php?action=delete_category",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: categoryId,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Category deleted successfully");
        setSelectedCategory(null);
        await fetchCategories();
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Error deleting category");
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add Category Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Category name"
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
                    <div className="mt-2 rounded-md overflow-hidden border border-border w-full max-w-xs">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Category description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isUploading}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isLoading ? "Adding..." : "Add Category"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Categories</h2>

          {isLoading && categories.length === 0 ? (
            <p className="text-muted-foreground">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground">No categories added yet.</p>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card 
                  key={category.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-border">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "httpss://placehold.co/200x200?text=Error";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Details Dialog */}
      <Dialog
        open={!!selectedCategory}
        onOpenChange={(open) => !open && setSelectedCategory(null)}
      >
        <DialogContent className="sm:max-w-[625px]">
          {selectedCategory && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCategory.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full h-64 rounded-md overflow-hidden border border-border">
                    {selectedCategory.image_url ? (
                      <img
                        src={selectedCategory.image_url}
                        alt={selectedCategory.name}
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
                      <p className="mt-1">{selectedCategory.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="text-muted-foreground">Created At</Label>
                        <p className="mt-1">
                          {new Date(selectedCategory.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Updated At</Label>
                        <p className="mt-1">
                          {new Date(selectedCategory.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteCategory(selectedCategory.id)}
                  disabled={isDeleteLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleteLoading ? "Deleting..." : "Delete Category"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory(null)}
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

export default Categories;