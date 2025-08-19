import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Mail, Phone, MapPin, Users, Plus } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { familyService, studentService } from '../../../services/adminService';
import { Family } from '../../../types/admin';
import { Student } from '../../../types/program';

const FamilyProfile = () => {
  const { userProfile } = useAdmin();
  const [family, setFamily] = useState<Family | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    familyName: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    secondaryContactName: '',
    secondaryContactEmail: '',
    secondaryContactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    notes: ''
  });

  useEffect(() => {
    loadFamilyData();
  }, [userProfile]);

  const loadFamilyData = async () => {
    if (!userProfile?.email) return;

    try {
      setLoading(true);
      
      // Find family by email
      const families = await familyService.getFamilies();
      const userFamily = families.find(f => 
        f.primaryContactEmail === userProfile.email || 
        f.secondaryContactEmail === userProfile.email
      );

      if (userFamily) {
        setFamily(userFamily);
        setEditForm({
          familyName: userFamily.familyName,
          primaryContactName: userFamily.primaryContactName,
          primaryContactEmail: userFamily.primaryContactEmail,
          primaryContactPhone: userFamily.primaryContactPhone || '',
          secondaryContactName: userFamily.secondaryContactName || '',
          secondaryContactEmail: userFamily.secondaryContactEmail || '',
          secondaryContactPhone: userFamily.secondaryContactPhone || '',
          address: userFamily.address || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          notes: userFamily.notes || ''
        });
        
        // Load students for this family
        const allStudents = await studentService.getStudents();
        const familyStudents = allStudents.filter(s => s.familyId === userFamily.id);
        setStudents(familyStudents);
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!family) return;

    setSaving(true);
    try {
      await familyService.updateFamily(family.id, {
        familyName: editForm.familyName,
        primaryContactName: editForm.primaryContactName,
        primaryContactEmail: editForm.primaryContactEmail,
        primaryContactPhone: editForm.primaryContactPhone || undefined,
        secondaryContactName: editForm.secondaryContactName || undefined,
        secondaryContactEmail: editForm.secondaryContactEmail || undefined,
        secondaryContactPhone: editForm.secondaryContactPhone || undefined,
        address: editForm.address.street ? editForm.address : undefined,
        notes: editForm.notes || undefined,
      });

      await loadFamilyData();
      setEditing(false);
    } catch (error) {
      console.error('Error updating family:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (family) {
      setEditForm({
        familyName: family.familyName,
        primaryContactName: family.primaryContactName,
        primaryContactEmail: family.primaryContactEmail,
        primaryContactPhone: family.primaryContactPhone || '',
        secondaryContactName: family.secondaryContactName || '',
        secondaryContactEmail: family.secondaryContactEmail || '',
        secondaryContactPhone: family.secondaryContactPhone || '',
        address: family.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        notes: family.notes || ''
      });
    }
    setEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Family Profile Not Found</h3>
        <p className="text-gray-600">
          Please contact support to set up your family profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Family Profile</h1>
          <p className="text-gray-600">Manage your family information and student details</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Family Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h2>
        
        {editing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Family Name</label>
              <input
                type="text"
                value={editForm.familyName}
                onChange={(e) => setEditForm({ ...editForm, familyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Primary Contact */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Primary Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.primaryContactName}
                    onChange={(e) => setEditForm({ ...editForm, primaryContactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.primaryContactEmail}
                    onChange={(e) => setEditForm({ ...editForm, primaryContactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.primaryContactPhone}
                    onChange={(e) => setEditForm({ ...editForm, primaryContactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Contact */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Secondary Contact (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.secondaryContactName}
                    onChange={(e) => setEditForm({ ...editForm, secondaryContactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.secondaryContactEmail}
                    onChange={(e) => setEditForm({ ...editForm, secondaryContactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.secondaryContactPhone}
                    onChange={(e) => setEditForm({ ...editForm, secondaryContactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Address</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={editForm.address.street}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      address: { ...editForm.address, street: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={editForm.address.city}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        address: { ...editForm.address, city: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={editForm.address.state}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        address: { ...editForm.address, state: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={editForm.address.zipCode}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        address: { ...editForm.address, zipCode: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Family Notes</label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{family.familyName} Family</h3>
            </div>

            {/* Primary Contact Display */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Primary Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="text-sm text-gray-600">{family.primaryContactName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${family.primaryContactEmail}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    {family.primaryContactEmail}
                  </a>
                </div>
                {family.primaryContactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${family.primaryContactPhone}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      {family.primaryContactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Contact Display */}
            {(family.secondaryContactName || family.secondaryContactEmail || family.secondaryContactPhone) && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Secondary Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {family.secondaryContactName && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Name:</span>
                      <span className="text-sm text-gray-600">{family.secondaryContactName}</span>
                    </div>
                  )}
                  {family.secondaryContactEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${family.secondaryContactEmail}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {family.secondaryContactEmail}
                      </a>
                    </div>
                  )}
                  {family.secondaryContactPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${family.secondaryContactPhone}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {family.secondaryContactPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Address Display */}
            {family.address && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Address</h4>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <div>{family.address.street}</div>
                    <div>{family.address.city}, {family.address.state} {family.address.zipCode}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Display */}
            {family.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Family Notes</h4>
                <p className="text-sm text-gray-600">{family.notes}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
              Profile created: {formatDate(family.createdAt)}
            </div>
          </div>
        )}
      </div>

      {/* Students Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Students</h2>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>

        {students.length > 0 ? (
          <div className="grid gap-4">
            {students.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {student.firstName[0]}{student.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {student.grade && `Grade ${student.grade} • `}
                        {student.enrolledOfferings.length} enrollment{student.enrolledOfferings.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students found for your family.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyProfile;