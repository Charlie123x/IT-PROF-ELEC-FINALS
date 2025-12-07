import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    emoji: "☕",
    price: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      alert("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        emoji: item.emoji,
        price: item.price.toString(),
        description: item.description || "",
        image_url: item.image_url || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        emoji: "☕",
        price: "",
        description: "",
        image_url: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      emoji: "☕",
      price: "",
      description: "",
      image_url: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from("menu_items")
          .update({
            name: formData.name,
            emoji: formData.emoji,
            price: parseFloat(formData.price),
            description: formData.description,
            image_url: formData.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        alert("✅ Item updated successfully!");
      } else {
        // Add new item
        const { error } = await supabase.from("menu_items").insert([
          {
            name: formData.name,
            emoji: formData.emoji,
            price: parseFloat(formData.price),
            description: formData.description,
            image_url: formData.image_url,
            is_active: true,
          },
        ]);

        if (error) throw error;
        alert("✅ Item added successfully!");
      }

      await fetchMenuItems();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Failed to save menu item: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      setLoading(true);
      const { error } = await supabase.from("menu_items").delete().eq("id", id);

      if (error) throw error;
      alert("✅ Item deleted successfully!");
      await fetchMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("Failed to delete menu item");
    } finally {
      setLoading(false);
    }
  };

  if (loading && menuItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Menu Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden hover:shadow-xl transition"
          >
            {/* Item Image */}
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-amber-100 flex items-center justify-center text-6xl">
                {item.emoji}
              </div>
            )}

            {/* Item Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 mt-4">
                <span className="text-2xl font-bold text-amber-900">
                  ₱{parseFloat(item.price).toFixed(2)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border-4 border-amber-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingId ? "Edit Item" : "Add New Item"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                  placeholder="e.g., Caramel Latte"
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Emoji
                </label>
                <input
                  type="text"
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleInputChange}
                  maxLength="2"
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400 text-center text-2xl"
                  placeholder="☕"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Price (₱) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                  placeholder="5.50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                  placeholder="Brief description of the item"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
