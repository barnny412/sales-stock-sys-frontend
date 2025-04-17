import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import { fetchProducts } from "../api/productsAPI";
import "../assets/styles/products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products");
      }
    };
    getProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        />
        <Link to="/add-product" className="add-product-btn">
          + Add Product
        </Link>
      </div>

      <table className="products-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Cost Price (K)</th>
            <th>Selling Price (K)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product, index) => (
            <tr key={product.id}>
              <td>{indexOfFirstProduct + index + 1}</td>
              <td>{product.name}</td>
              <td>{product.cost_price}</td>
              <td>{product.selling_price}</td>
              <td>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastProduct >= filteredProducts.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Products;
