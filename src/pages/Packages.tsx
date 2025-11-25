import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/packages`);
      console.log('Fetched packages:', res.data);
      setPackages(Array.isArray(res.data) ? res.data : []);
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
      // Convert numeric fields to numbers
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

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Packages Management</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Add Package
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-lg text-gray-500">Loading...</div>
      ) : packages.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No packages found.</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="flex flex-col bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-all mx-auto w-full max-w-xs"
            >
              <div className="text-xl font-bold text-blue-700 mb-1">{pkg.name}</div>
              <div className="text-sm text-gray-500 mb-2">{pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)} package</div>
              <div className="text-lg font-semibold text-gray-800 mb-1">KSH {pkg.price}</div>
              <div className="text-xs text-gray-400 mb-2">Deposit: KSH {pkg.deposit}</div>
              <div className="flex flex-col gap-1 text-sm text-gray-700 mb-2">
                <div><span className="font-semibold">Duration:</span> {pkg.duration}</div>
                <div><span className="font-semibold">Images:</span> {pkg.images}</div>
                <div><span className="font-semibold">Makeup:</span> {pkg.makeup ? 'Yes' : 'No'}</div>
                <div><span className="font-semibold">Outfits:</span> {pkg.outfits}</div>
                <div><span className="font-semibold">Styling:</span> {pkg.styling ? 'Yes' : 'No'}</div>
                <div><span className="font-semibold">Photobook:</span> {pkg.photobook ? 'Yes' : 'No'}</div>
                <div><span className="font-semibold">Mount:</span> {pkg.mount ? 'Yes' : 'No'}</div>
                <div><span className="font-semibold">Balloon:</span> {pkg.balloonBackdrop ? 'Yes' : 'No'}</div>
                <div><span className="font-semibold">Wig:</span> {pkg.wig ? 'Yes' : 'No'}</div>
                {pkg.photobookSize && <div><span className="font-semibold">Photobook Size:</span> {pkg.photobookSize}</div>}
                {pkg.notes && <div className="text-xs text-gray-500 max-w-xs"><span className="font-semibold">Notes:</span> {pkg.notes}</div>}
              </div>
              <div className="flex flex-row gap-2 mt-2">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                >Edit</button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-4xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setEditing(null)}
              aria-label="Close"
            >×</button>
            <h2 className="text-2xl font-bold mb-6">{isNew ? 'Add New Package' : 'Edit Package'}</h2>
            <form
              className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5"
              onSubmit={e => { e.preventDefault(); handleSave(); }}
            >
              <div className="flex flex-col">
                <label className="font-medium mb-1">Package Name</label>
                <input name="name" value={editing.name || ''} onChange={handleChange} placeholder="Name" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-1">Type</label>
                <select name="type" value={editing.type || 'studio'} onChange={handleChange} className="border p-2 rounded">
                  <option value="studio">Studio</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-1">Price (KSH)</label>
                <input name="price" type="number" value={editing.price || 0} onChange={handleChange} placeholder="Price" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-1">Deposit (KSH)</label>
                <input name="deposit" type="number" value={editing.deposit || 0} onChange={handleChange} placeholder="Deposit" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-1">Session Duration</label>
                <input name="duration" value={editing.duration || ''} onChange={handleChange} placeholder="e.g. 2 hrs 30 mins" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-1">Number of Images</label>
                <input name="images" type="number" value={editing.images || 0} onChange={handleChange} placeholder="Images" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-1">Number of Outfits</label>
                <input name="outfits" type="number" value={editing.outfits || 0} onChange={handleChange} placeholder="Outfits" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-1">Photobook Size (if any)</label>
                <input name="photobookSize" value={editing.photobookSize || ''} onChange={handleChange} placeholder={'e.g. 8x8"'} className="border p-2 rounded" />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2"><input name="makeup" type="checkbox" checked={!!editing.makeup} onChange={handleChange} /> Professional Makeup</label>
                <label className="flex items-center gap-2"><input name="styling" type="checkbox" checked={!!editing.styling} onChange={handleChange} /> Styling Included</label>
                <label className="flex items-center gap-2"><input name="photobook" type="checkbox" checked={!!editing.photobook} onChange={handleChange} /> Photobook Included</label>
                <label className="flex items-center gap-2"><input name="mount" type="checkbox" checked={!!editing.mount} onChange={handleChange} /> A3 Mount Included</label>
                <label className="flex items-center gap-2"><input name="balloonBackdrop" type="checkbox" checked={!!editing.balloonBackdrop} onChange={handleChange} /> Balloon Backdrop</label>
                <label className="flex items-center gap-2"><input name="wig" type="checkbox" checked={!!editing.wig} onChange={handleChange} /> Styled Wig</label>
              </div>
              <div className="md:col-span-3 flex flex-col">
                <label className="font-medium mb-1">Notes / Description</label>
                <textarea name="notes" value={editing.notes || ''} onChange={handleChange} placeholder="Notes" className="border p-2 rounded min-h-[60px]" />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 mt-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow">Save</button>
                <button type="button" onClick={() => setEditing(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
