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
  const [secondaryContactName, setSecondaryContactName] = useState(family?.secondaryContactName || '');
  const [secondaryContactEmail, setSecondaryContactEmail] = useState(family?.secondaryContactEmail || '');
  const [secondaryContactPhone, setSecondaryContactPhone] = useState(family?.secondaryContactPhone || '');
  const [notes, setNotes] = useState(family?.notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (family) {
      setFamilyName(family.familyName);
      setPrimaryContactName(family.primaryContactName);
      setPrimaryContactEmail(family.primaryContactEmail);
      setPrimaryContactPhone(family.primaryContactPhone || '');
      setSecondaryContactName(family.secondaryContactName || '');
      setSecondaryContactEmail(family.secondaryContactEmail || '');
      setSecondaryContactPhone(family.secondaryContactPhone || '');
      setNotes(family.notes || '');
    } else {
      setFamilyName('');
      setPrimaryContactName('');
      setPrimaryContactEmail('');
      setPrimaryContactPhone('');
      setSecondaryContactName('');
      setSecondaryContactEmail('');
      setSecondaryContactPhone('');
      setNotes('');
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
          secondaryContactName: secondaryContactName || undefined,
          secondaryContactEmail: secondaryContactEmail || undefined,
          secondaryContactPhone: secondaryContactPhone || undefined,
          notes: notes || undefined,
        });
      } else {
        await familyService.createFamily({
          familyName,
          primaryContactName,
          primaryContactEmail,
          primaryContactPhone: primaryContactPhone || undefined,
          secondaryContactName: secondaryContactName || undefined,
          secondaryContactEmail: secondaryContactEmail || undefined,
          secondaryContactPhone: secondaryContactPhone || undefined,
          notes: notes || undefined,
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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{family ? 'Edit Family' : 'Add Family'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
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
          
          {/* Primary Contact Section */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Primary Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={primaryContactName}
                  onChange={(e) => setPrimaryContactName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={primaryContactEmail}
                  onChange={(e) => setPrimaryContactEmail(e.target.value)}
                  placeholder="email@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={primaryContactPhone}
                  onChange={(e) => setPrimaryContactPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Secondary Contact Section */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Secondary Contact (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={secondaryContactName}
                  onChange={(e) => setSecondaryContactName(e.target.value)}
                  placeholder="Secondary contact name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={secondaryContactEmail}
                  onChange={(e) => setSecondaryContactEmail(e.target.value)}
                  placeholder="secondary@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={secondaryContactPhone}
                  onChange={(e) => setSecondaryContactPhone(e.target.value)}
                  placeholder="(555) 987-6543"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes about the family..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
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
              {saving ? 'Saving...' : family ? 'Save Changes' : 'Create Family'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyModal;
