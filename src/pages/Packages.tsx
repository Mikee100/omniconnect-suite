import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL as API_BASE } from '@/config';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Camera,
  Clock,
  Image as ImageIcon,
  Shirt,
  Sparkles,
  BookOpen,
  Frame,
  PartyPopper,
  Scissors
} from 'lucide-react';

interface Package {
  id: string;
  name: string;
  type: string;
  price: number;
  deposit: number;
  duration: string;
  images: number;
  makeup: boolean;
  outfits: number;
  styling: boolean;
  photobook: boolean;
  photobookSize?: string;
  mount: boolean;
  balloonBackdrop: boolean;
  wig: boolean;
  notes?: string;
}

const emptyPackage: Partial<Package> = {
  name: '',
  type: 'studio',
  price: 0,
  deposit: 2000,
  duration: '',
  images: 0,
  makeup: false,
  outfits: 0,
  styling: false,
  photobook: false,
  photobookSize: '',
  mount: false,
  balloonBackdrop: false,
  wig: false,
  notes: '',
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [editing, setEditing] = useState<Partial<Package> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/packages`);
      console.log('Fetched packages:', res.data);
      const data = Array.isArray(res.data) ? res.data : [];
      // Sort by price ascending
      data.sort((a: Package, b: Package) => a.price - b.price);
      setPackages(data);
    } catch (err) {
      setPackages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleEdit = (pkg: Package) => {
    setEditing(pkg);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this package?')) return;
    await axios.delete(`${API_BASE}/api/bookings/packages/${id}`);
    fetchPackages();
  };

  const handleAdd = () => {
    setEditing({ ...emptyPackage });
    setIsNew(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === 'checkbox' && 'checked' in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setEditing(editing => ({
      ...editing!,
      [name]: fieldValue,
    }));
  };

  const handleSave = async () => {
    if (!editing) return;
    const payload = {
      ...editing,
      price: editing.price ? Number(editing.price) : 0,
      deposit: editing.deposit ? Number(editing.deposit) : 0,
      images: editing.images ? Number(editing.images) : 0,
      outfits: editing.outfits ? Number(editing.outfits) : 0,
    };
    if (isNew) {
      await axios.post(`${API_BASE}/api/bookings/packages`, payload);
    } else {
      await axios.put(`${API_BASE}/api/bookings/packages/${editing.id}`, payload);
    }
    setEditing(null);
    fetchPackages();
  };

  const FeatureItem = ({ icon: Icon, label, value, included }: { icon: any, label: string, value?: string | number, included?: boolean }) => (
    <div className={`flex items-center gap-3 text-sm ${included === false ? 'text-gray-400' : 'text-gray-700'}`}>
      <div className={`p-1.5 rounded-full ${included === false ? 'bg-gray-100' : 'bg-blue-50 text-blue-600'}`}>
        <Icon size={16} />
      </div>
      <span className="flex-1">{label}</span>
      <span className="font-medium">{value}</span>
      {included !== undefined && (
        included ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-gray-300" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Packages</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your photography packages and offerings</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            <Plus size={20} />
            Add New Package
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900">No packages found</h3>
            <p className="text-gray-500 mt-2">Get started by creating your first package.</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${pkg.type === 'studio' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                        }`}>
                        {pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">{pkg.name}</h3>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-gray-500">KSH</span>
                      <span className="text-3xl font-bold text-gray-900">{pkg.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Deposit: KSH {pkg.deposit.toLocaleString()}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <FeatureItem icon={Clock} label="Duration" value={pkg.duration} />
                    <FeatureItem icon={ImageIcon} label="Images" value={pkg.images} />
                    <FeatureItem icon={Shirt} label="Outfits" value={pkg.outfits} />
                    <FeatureItem icon={Sparkles} label="Makeup" included={pkg.makeup} />
                    <FeatureItem icon={Scissors} label="Styling" included={pkg.styling} />
                    <FeatureItem icon={BookOpen} label="Photobook" included={pkg.photobook} />
                    {pkg.photobook && pkg.photobookSize && (
                      <div className="ml-9 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        Size: {pkg.photobookSize}
                      </div>
                    )}
                    <FeatureItem icon={Frame} label="Mount" included={pkg.mount} />
                    <FeatureItem icon={PartyPopper} label="Balloon Backdrop" included={pkg.balloonBackdrop} />
                    <FeatureItem icon={Scissors} label="Wig" included={pkg.wig} />
                  </div>

                  {pkg.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4">
                      <span className="font-medium text-gray-900 block mb-1">Notes:</span>
                      {pkg.notes}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-red-500 hover:text-red-600 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900">{isNew ? 'Create New Package' : 'Edit Package'}</h2>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                      <input
                        name="name"
                        value={editing.name || ''}
                        onChange={handleChange}
                        placeholder="e.g. Gold Package"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          name="type"
                          value={editing.type || 'studio'}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                        >
                          <option value="studio">Studio</option>
                          <option value="outdoor">Outdoor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input
                          name="duration"
                          value={editing.duration || ''}
                          onChange={handleChange}
                          placeholder="e.g. 2 hrs"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSH)</label>
                        <input
                          name="price"
                          type="number"
                          value={editing.price || 0}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deposit (KSH)</label>
                        <input
                          name="deposit"
                          type="number"
                          value={editing.deposit || 0}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                        <input
                          name="images"
                          type="number"
                          value={editing.images || 0}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Outfits</label>
                        <input
                          name="outfits"
                          type="number"
                          value={editing.outfits || 0}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                      <h3 className="font-semibold text-gray-900">Inclusions</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                          <input name="makeup" type="checkbox" checked={!!editing.makeup} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">Professional Makeup</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                          <input name="styling" type="checkbox" checked={!!editing.styling} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">Styling Included</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                          <input name="photobook" type="checkbox" checked={!!editing.photobook} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">Photobook Included</span>
                        </label>
                        {editing.photobook && (
                          <div className="pl-8">
                            <input
                              name="photobookSize"
                              value={editing.photobookSize || ''}
                              onChange={handleChange}
                              placeholder="Size (e.g. 8x8)"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                            />
                          </div>
                        )}
                        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                          <input name="mount" type="checkbox" checked={!!editing.mount} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">A3 Mount Included</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                          <input name="balloonBackdrop" type="checkbox" checked={!!editing.balloonBackdrop} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">Balloon Backdrop</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                          <input name="wig" type="checkbox" checked={!!editing.wig} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">Styled Wig</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Description</label>
                      <textarea
                        name="notes"
                        value={editing.notes || ''}
                        onChange={handleChange}
                        placeholder="Additional details..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    Save Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
