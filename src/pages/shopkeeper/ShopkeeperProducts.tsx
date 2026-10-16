import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate } from '../../utils/format.ts';
import { ShoppingBag, Plus, Clock, CheckCircle, XCircle, AlertCircle, ShieldAlert, Pencil, Save, X } from 'lucide-react';
import { ImageUploadGallery } from '../../components/common/ImageUploadGallery.tsx';

export const ShopkeeperProducts: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Organic & Food');
  const [costPriceNpr, setCostPriceNpr] = useState('');
  const [proposedSellingPriceNpr, setProposedSellingPriceNpr] = useState('');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Edit Product Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCostPriceNpr, setEditCostPriceNpr] = useState('');
  const [editProposedSellingPriceNpr, setEditProposedSellingPriceNpr] = useState('');
  const [editStockQuantity, setEditStockQuantity] = useState('20');
  const [editSku, setEditSku] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editGalleryImages, setEditGalleryImages] = useState<string[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditDescription(p.description || '');
    setEditCategory(p.category);
    setEditCostPriceNpr(String(p.costPriceNpr));
    setEditProposedSellingPriceNpr(String(p.proposedSellingPriceNpr || p.finalSellingPriceNpr));
    setEditStockQuantity(String(p.stockQuantity));
    setEditSku(p.sku || '');
    setEditImageUrl(p.imageUrl || '');
    setEditGalleryImages(p.galleryImages || []);
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const cost = Number(editCostPriceNpr);
    const proposed = Number(editProposedSellingPriceNpr);
    const stock = Number(editStockQuantity);

    if (isNaN(cost) || cost <= 0 || isNaN(proposed) || proposed <= 0) {
      setEditError('Cost and proposed selling price must be positive numbers');
      return;
    }
    if (proposed < cost) {
      setEditError('Proposed selling price cannot be lower than cost price');
      return;
    }

    const primaryImg = editImageUrl.trim() || (editGalleryImages.length > 0 ? editGalleryImages[0] : '');
    if (!primaryImg) {
      setEditError('Please upload at least one product photo from your device gallery or enter an image URL');
      return;
    }

    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await api.updateProduct(editingProduct.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        category: editCategory.trim(),
        costPriceNpr: cost,
        proposedSellingPriceNpr: proposed,
        finalSellingPriceNpr: editingProduct.status === 'approved' ? (editingProduct.finalSellingPriceNpr || proposed) : proposed,
        stockQuantity: Math.max(0, stock),
        sku: editSku.trim(),
        imageUrl: primaryImg,
        galleryImages: editGalleryImages
      });

      if (res.success && res.product) {
        setSuccess(`Product "${res.product.name}" and photos updated successfully!`);
        setEditModalOpen(false);
        await loadProducts();
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err: any) {
      setEditError(err.message || 'Update failed');
    } finally {
      setEditSubmitting(false);
    }
  };

  const loadProducts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getMySubmissions();
      if (res.success && res.products) setProducts(res.products);
    } catch (err: any) {
      console.warn('Failed to load shopkeeper submissions:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cost = Number(costPriceNpr);
    const proposed = Number(proposedSellingPriceNpr);
    const stock = Number(stockQuantity);

    if (isNaN(cost) || cost <= 0 || isNaN(proposed) || proposed <= 0) {
      setError('Cost and proposed selling price must be positive numbers');
      return;
    }

    if (proposed < cost) {
      setError('Proposed selling price cannot be lower than cost price');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitProduct({
        name: name.trim(),
        description: description.trim(),
        category,
        costPriceNpr: cost,
        proposedSellingPriceNpr: proposed,
        stockQuantity: stock,
        sku: sku.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        galleryImages: galleryImages.length > 0 ? galleryImages : undefined
      });

      if (res.success) {
        setSuccess('Product submitted successfully! It is now pending Admin commission review and approval.');
        setModalOpen(false);
        // Reset form
        setName('');
        setDescription('');
        setCostPriceNpr('');
        setProposedSellingPriceNpr('');
        setStockQuantity('20');
        setSku('');
        setImageUrl('');
        setGalleryImages([]);
        await loadProducts();
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Catalog Submissions
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            Merchant Product Submissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submitted products remain pending until evaluated and commissioned by the Admin.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Product</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading submitted products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No products submitted yet</h3>
            <p className="text-xs text-slate-500 mt-1">Click &quot;Submit Product&quot; to propose your first retail item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Admin Commission Details</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {formatNPR(p.costPriceNpr)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {formatNPR(p.finalSellingPriceNpr || p.proposedSellingPriceNpr)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {p.stockQuantity}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {p.status === 'pending_approval' ? 'Pending Review' : p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      {p.commissionSettings ? (
                        <div className="text-slate-600 space-y-0.5">
                          <p>Cashback: <strong className="text-emerald-700">{p.commissionSettings.customerCashbackType === 'percentage' ? `${p.commissionSettings.customerCashbackValue}%` : formatNPR(p.commissionSettings.customerCashbackValue)}</strong></p>
                          <p>Your Commission: <strong className="text-blue-700">{formatNPR(p.commissionSettings.shopkeeperCommissionValue)}</strong></p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Controlled by Admin upon approval</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs inline-flex items-center space-x-1 transition-colors"
                        title="Edit Product & Photos"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit & Photos</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Submit Product for Listing</h3>
                <p className="text-xs text-slate-500">Provide product specifications and cost details</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Policy Reminder */}
            <div className="px-6 pt-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice: </strong>
                  Shopkeepers cannot set cashback or commission distributions. The Administrator configures sustainable customer cashback and 3-level referral allocations based on your cost and selling price.
                </span>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Dhaulagiri Honey (500g)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Organic & Food">Organic & Food</option>
                    <option value="Snacks & Organic">Snacks & Organic</option>
                    <option value="Apparel & Handicrafts">Apparel & Handicrafts</option>
                    <option value="Handicrafts">Handicrafts</option>
                    <option value="Daily Essentials">Daily Essentials</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. HONEY-500-DHA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Price (NPR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={costPriceNpr}
                    onChange={(e) => setCostPriceNpr(e.target.value)}
                    placeholder="e.g. 400"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proposed Price (NPR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={proposedSellingPriceNpr}
                    onChange={(e) => setProposedSellingPriceNpr(e.target.value)}
                    placeholder="e.g. 650"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <ImageUploadGallery
                  primaryImage={imageUrl}
                  onChangePrimaryImage={setImageUrl}
                  galleryImages={galleryImages}
                  onChangeGalleryImages={setGalleryImages}
                  label="Product Photos (Upload from Gallery or URL)"
                  helpText="Select product photos from your device / phone gallery."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe origin, quality, and usage..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit for Admin Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product & Photo Upload Modal for Shopkeeper */}
      {editModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8">
            <div className="p-6 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Edit Product &amp; Photos</h3>
                <p className="text-xs text-slate-500">Update specifications, stock, and product gallery</p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <ImageUploadGallery
                  primaryImage={editImageUrl}
                  onChangePrimaryImage={setEditImageUrl}
                  galleryImages={editGalleryImages}
                  onChangeGalleryImages={setEditGalleryImages}
                  label="Product Photos & Gallery"
                  helpText="Upload new photos from your phone or device gallery."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Organic Jumla Marsi Rice"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Organic & Food">Organic &amp; Food</option>
                    <option value="Handicrafts & Decor">Handicrafts &amp; Decor</option>
                    <option value="Fashion & Apparel">Fashion &amp; Apparel</option>
                    <option value="Herbal & Wellness">Herbal &amp; Wellness</option>
                    <option value="General Retail">General Retail</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    placeholder="SKU-XXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Price (NPR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editCostPriceNpr}
                    onChange={(e) => setEditCostPriceNpr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proposed Selling Price</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editProposedSellingPriceNpr}
                    onChange={(e) => setEditProposedSellingPriceNpr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editStockQuantity}
                    onChange={(e) => setEditStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe origin, quality, and usage..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editSubmitting ? 'Saving...' : 'Save Product & Photos'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
