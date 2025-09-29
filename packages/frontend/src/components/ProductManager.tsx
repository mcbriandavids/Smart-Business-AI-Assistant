import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Fab,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  AttachMoney as PriceIcon,
} from "@mui/icons-material";
import apiClient from "../lib/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  createdAt: string;
}

interface ProductManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function ProductManager({ open, onClose }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
  });

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await apiClient.getProducts()) as Product[];
      setProducts(data);
    } catch (error) {
      setError("Failed to load products");
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || newProduct.price <= 0) {
      setError("Please fill in all required fields with valid values");
      return;
    }

    try {
      const product = (await apiClient.createProduct(newProduct)) as Product;
      setProducts((prev) => [...prev, product]);
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
      });
      setAddDialogOpen(false);
      setError(null);
    } catch (error) {
      setError("Failed to add product");
      console.error("Error adding product:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await apiClient.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      setError("Failed to delete product");
      console.error("Error deleting product:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Product Inventory</Typography>
            <Typography variant="body2" color="text.secondary">
              {products.length} products
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Typography>Loading products...</Typography>
          ) : products.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No products yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add your first product to get started
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="between"
                        alignItems="start"
                      >
                        <Typography variant="h6" gutterBottom>
                          {product.name}
                        </Typography>
                        <Box>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {product.description}
                      </Typography>

                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          icon={<PriceIcon />}
                          label={`$${product.price.toFixed(2)}`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          icon={<InventoryIcon />}
                          label={`Stock: ${product.stock}`}
                          color={
                            product.stock > 10
                              ? "success"
                              : product.stock > 0
                                ? "warning"
                                : "error"
                          }
                          size="small"
                        />
                      </Box>

                      {product.category && (
                        <Chip
                          label={product.category}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Fab
            color="primary"
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            onClick={() => setAddDialogOpen(true)}
          >
            <AddIcon />
          </Fab>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            fullWidth
            variant="outlined"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Price ($)"
                type="number"
                fullWidth
                variant="outlined"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Stock Quantity"
                type="number"
                fullWidth
                variant="outlined"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="Category (optional)"
            fullWidth
            variant="outlined"
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct((prev) => ({ ...prev, category: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProduct} variant="contained">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
