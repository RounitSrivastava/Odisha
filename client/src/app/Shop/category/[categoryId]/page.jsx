"use client";

import React, { useState, useEffect } from "react";
import { Star, Star as StarFilled } from "lucide-react";
import { Range } from "react-range";
import Navbar from "../../../(components)/Navbar";
import axios from "axios";
import ProductCard from "../../../(components)/ProductCard";
import { useParams } from "next/navigation";

const getPriceRange = (products) => {
  if (!products || products.length === 0) return [0, 1000];
  const prices = products.map((product) => product.price);
  const minPrice = Math.floor(Math.min(...prices));
  const maxPrice = Math.ceil(Math.max(...prices));
  return [minPrice, maxPrice];
};

export default function CategoryPage() {
  const params = useParams();
  const [selectedRating, setSelectedRating] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [defaultPriceRange, setDefaultPriceRange] = useState([0, 1000]);
  const [sortByPopularity, setSortByPopularity] = useState(false);
  const [sortByPrice, setSortByPrice] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handlers
  const addToCart = (id) => setCart((prev) => [...prev, id]);
  const toggleWishlist = (id) =>
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

  // Fetch products for the specific category and set dynamic price range
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/category/${params.categoryId}`
        );
        if (response.data.success) {
          const products = response.data.products;
          setData(products);
          setError(null);
          
          // Set dynamic price range based on fetched products
          const [minPrice, maxPrice] = getPriceRange(products);
          setDefaultPriceRange([minPrice, maxPrice]);
          setPriceRange([minPrice, maxPrice]);
        } else {
          setError("No products found for this category");
          setData(null);
        }
      } catch (err) {
        setError("Failed to fetch products");
        setData(null);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params.categoryId]);

  // Filter and sort products
  const filteredProducts = data
    ?.filter((product) =>
      selectedRating ? product.ratings.average >= selectedRating : true
    )
    .filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    .sort((a, b) => {
      if (sortByPopularity) return b.ratings.average - a.ratings.average;
      if (sortByPrice) return a.price - b.price;
      return 0;
    });

  // Get dynamic min and max for the slider
  const [minPrice, maxPrice] = data ? defaultPriceRange : [0, 1000];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-white p-6 shadow-lg md:sticky md:top-0 md:h-screen">
          <h2 className="text-2xl font-bold text-[#d99527] mb-6">Filters</h2>

          {/* Star Rating Chooser */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#eca72f] mb-3">Minimum Rating</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star === selectedRating ? null : star)}
                  className="focus:outline-none"
                  aria-label={`Filter by ${star} stars`}
                >
                  {star <= (selectedRating || 0) ? (
                    <StarFilled size={24} fill="#d99527" className="text-[#d99527]" />
                  ) : (
                    <Star size={24} className="text-[#eca72f]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Two-Pointer Price Slider */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#eca72f] mb-3">Price Range</h3>
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            {loading ? (
              <div className="text-gray-600 text-sm">Loading price range...</div>
            ) : (
              <Range
                values={priceRange}
                step={1}
                min={minPrice}
                max={maxPrice}
                onChange={(values) => setPriceRange([values[0], values[1]])}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    className="h-2 bg-gray-200 rounded-full"
                    style={{ ...props.style }}
                  >
                    <div
                      className="h-2 bg-[#d99527] rounded-full"
                      style={{
                        width: `${((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100}%`,
                        marginLeft: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                      }}
                    />
                    {children}
                  </div>
                )}
                renderThumb={({ props, index }) => (
                  <div
                    {...props}
                    key={index}
                    className="h-5 w-5 bg-[#d99527] rounded-full focus:outline-none shadow"
                    style={{ ...props.style }}
                  />
                )}
              />
            )}
          </div>

          {/* Sorting Checkboxes */}
          <div>
            <h3 className="text-lg font-semibold text-[#eca72f] mb-3">Sort By</h3>
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={sortByPopularity}
                onChange={() => {
                  setSortByPopularity(!sortByPopularity);
                  setSortByPrice(false);
                }}
                className="w-4 h-4 text-[#d99527] border-gray-300 rounded focus:ring-[#eca72f]"
              />
              <span className="ml-2 text-gray-700">Popularity</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sortByPrice}
                onChange={() => {
                  setSortByPrice(!sortByPrice);
                  setSortByPopularity(false);
                }}
                className="w-4 h-4 text-[#d99527] border-gray-300 rounded focus:ring-[#eca72f]"
              />
              <span className="ml-2 text-gray-700">Price (Low to High)</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-[#d99527] mb-6">
            {params.categoryId.charAt(0).toUpperCase() + params.categoryId.slice(1)} Products
          </h1>
          {loading ? (
            <p className="text-gray-600">Loading products...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : !data ? (
            <p className="text-gray-600">No products available</p>
          ) : filteredProducts?.length === 0 ? (
            <p className="text-gray-600">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts?.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  cart={cart}
                  wishlist={wishlist}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}