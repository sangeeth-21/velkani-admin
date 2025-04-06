
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  image: string;
  description: string;
}

export interface PricePoint {
  id: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  images: string[];
  description: string;
  pricePoints: PricePoint[];
}

interface DataStore {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (subcategory: Omit<Subcategory, "id">) => void;
  updateSubcategory: (id: string, subcategory: Partial<Subcategory>) => void;
  deleteSubcategory: (id: string) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getSubcategoriesByCategoryId: (categoryId: string) => Subcategory[];
  getProductsBySubcategoryId: (subcategoryId: string) => Product[];
  getProductsByCategoryId: (categoryId: string) => Product[];
}

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      categories: [],
      subcategories: [],
      products: [],
      
      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },
      
      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }));
      },
      
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          // Also remove related subcategories and products
          subcategories: state.subcategories.filter((s) => s.categoryId !== id),
          products: state.products.filter((p) => p.categoryId !== id),
        }));
      },
      
      addSubcategory: (subcategory) => {
        const newSubcategory: Subcategory = {
          ...subcategory,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          subcategories: [...state.subcategories, newSubcategory],
        }));
      },
      
      updateSubcategory: (id, subcategory) => {
        set((state) => ({
          subcategories: state.subcategories.map((s) =>
            s.id === id ? { ...s, ...subcategory } : s
          ),
        }));
      },
      
      deleteSubcategory: (id) => {
        set((state) => ({
          subcategories: state.subcategories.filter((s) => s.id !== id),
          // Also remove related products
          products: state.products.filter((p) => p.subcategoryId !== id),
        }));
      },
      
      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },
      
      updateProduct: (id, product) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...product } : p
          ),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },
      
      getCategoryById: (id) => {
        return get().categories.find((category) => category.id === id);
      },
      
      getSubcategoriesByCategoryId: (categoryId) => {
        return get().subcategories.filter(
          (subcategory) => subcategory.categoryId === categoryId
        );
      },
      
      getProductsBySubcategoryId: (subcategoryId) => {
        return get().products.filter(
          (product) => product.subcategoryId === subcategoryId
        );
      },
      
      getProductsByCategoryId: (categoryId) => {
        return get().products.filter(
          (product) => product.categoryId === categoryId
        );
      },
    }),
    {
      name: "admin-data-store",
    }
  )
);
