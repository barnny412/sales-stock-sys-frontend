import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStocks, deleteProduct } from "../api/productsAPI";
import "../assets/styles/products.css";

const Products = () => {
  const [products, setProducts] = useState([]); // Initially an empty array
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const productsPerPage = 5;

  const fetchProductsData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchStocks();
      // Ensure data is an array; fallback to empty array if not
      const fetchedProducts = Array.isArray(data) ? data : [];
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to fetch products. Please try again later.");
      setProducts([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  const handleDeletePrompt = (product) => {
    setProductToDelete(product);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      // Refetch products to ensure data consistency
      await fetchProductsData();
      setShowModal(false);
      setProductToDelete(null);
    } catch (error) {
      setError(error.message || "Failed to delete product. Please try again.");
      console.error("Delete Product Error:", error);
      setShowModal(false);
      setProductToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setProductToDelete(null);
    setError("");
  };

  // Filter products based on search term, ensuring products is an array
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div className="products-container">
      <div className="header">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          aria-label="Search products"
        />
        <Link to="/add-product" className="add-product-btn" aria-label="Add a new product">
          + Add Product
        </Link>
      </div>

      {loading && <p className="loading-message">Loading products...</p>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && (
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Cost Price (K)</th>
                <th scope="col">Selling Price (K)</th>
                <th scope="col">Low Stock Alert</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>{indexOfFirstProduct + index + 1}</td>
                    <td>{product.name}</td>
                    <td>{Number(product.cost_price).toFixed(2)}</td>
                    <td>{Number(product.selling_price).toFixed(2)}</td>
                    <td>{product.low_stock_alert ?? "N/A"}</td>
                    <td>
                      <Link to={`/edit-product/${product.id}`}>
                        <button className="edit-btn" aria-label={`Edit ${product.name}`}>
                          Edit
                        </button>
                      </Link>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeletePrompt(product)}
                        aria-label={`Delete ${product.name}`}
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-products-message">
                    No products available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
              aria-label="Previous page"
            >
              Prev
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastProduct >= filteredProducts.length}
              className="pagination-btn"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the product "{productToDelete?.name}"?
            </p>
            <div className="modal-actions">
              <button
                className="modal-confirm-btn"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Confirm deletion"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                className="modal-cancel-btn"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;