import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { familyService } from '../../../services/adminService';
import { Family } from '../../../types/admin';

interface FamilyModalProps {
  family?: Family;
  onClose: () => void;
  onSaved: () => void;
}

const FamilyModal: React.FC<FamilyModalProps> = ({ family, onClose, onSaved }) => {
  const [familyName, setFamilyName] = useState(family?.familyName || '');
  const [primaryContactName, setPrimaryContactName] = useState(family?.primaryContactName || '');
  const [primaryContactEmail, setPrimaryContactEmail] = useState(family?.primaryContactEmail || '');
  const [primaryContactPhone, setPrimaryContactPhone] = useState(family?.primaryContactPhone || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (family) {
      setFamilyName(family.familyName);
      setPrimaryContactName(family.primaryContactName);
      setPrimaryContactEmail(family.primaryContactEmail);
      setPrimaryContactPhone(family.primaryContactPhone || '');
    } else {
      setFamilyName('');
      setPrimaryContactName('');
      setPrimaryContactEmail('');
      setPrimaryContactPhone('');
    }
  }, [family]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (family) {
        await familyService.updateFamily(family.id, {
          familyName,
          primaryContactName,
          primaryContactEmail,
          primaryContactPhone: primaryContactPhone || undefined,
        });
      } else {
        await familyService.createFamily({
          familyName,
          primaryContactName,
          primaryContactEmail,
          primaryContactPhone: primaryContactPhone || undefined,
          students: [],
        });
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving family:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{family ? 'Edit Family' : 'Add Family'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Name</label>
            <input
              type="text"
              value={primaryContactName}
              onChange={(e) => setPrimaryContactName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Email</label>
            <input
              type="email"
              value={primaryContactEmail}
              onChange={(e) => setPrimaryContactEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Phone</label>
            <input
              type="tel"
              value={primaryContactPhone}
              onChange={(e) => setPrimaryContactPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : family ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyModal;
