import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];
const CONDITIONS = ['Like New', 'Excellent', 'Good', 'Fair'];

export default function AddItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    type: '',
    size: '',
    condition: CONDITIONS[0],
    tags: '',
    pointsCost: '25',
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews(list.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!files.length) {
      setError('Please add at least one photo.');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images', f));
      const { message } = await api.createItem(fd);
      navigate('/dashboard', { state: { flash: message } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page narrow">
      <header className="page-header">
        <h1>List an item</h1>
        <p>Upload clear, well-lit photos — they appear in full quality across the site.</p>
      </header>

      <form onSubmit={handleSubmit} className="form-stack listing-form">
        {error && <p className="alert alert-error">{error}</p>}

        <label className="file-drop">
          <span>Photos (up to 8)</span>
          <input type="file" accept="image/*" multiple onChange={onFiles} required />
        </label>
        {previews.length > 0 && (
          <div className="preview-grid">
            {previews.map((src) => (
              <img key={src} src={src} alt="Upload preview" />
            ))}
          </div>
        )}

        <label>
          Title
          <input name="title" value={form.title} onChange={onChange} required />
        </label>
        <label>
          Description
          <textarea
            name="description"
            rows={5}
            value={form.description}
            onChange={onChange}
            required
          />
        </label>
        <div className="form-row">
          <label>
            Category
            <select name="category" value={form.category} onChange={onChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type
            <input name="type" value={form.type} onChange={onChange} placeholder="e.g. Hoodie" required />
          </label>
        </div>
        <div className="form-row">
          <label>
            Size
            <input name="size" value={form.size} onChange={onChange} required />
          </label>
          <label>
            Condition
            <select name="condition" value={form.condition} onChange={onChange}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Tags (comma-separated)
          <input name="tags" value={form.tags} onChange={onChange} placeholder="vintage, cotton" />
        </label>
        <label>
          Points to redeem
          <input
            type="number"
            name="pointsCost"
            min={5}
            max={200}
            value={form.pointsCost}
            onChange={onChange}
          />
        </label>

        <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}
