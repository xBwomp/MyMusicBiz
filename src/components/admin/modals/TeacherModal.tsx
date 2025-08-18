import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { teacherService } from '../../../services/adminService';
import { Teacher } from '../../../types/admin';

interface TeacherModalProps {
  teacher?: Teacher;
  onClose: () => void;
  onSaved: () => void;
}

const TeacherModal: React.FC<TeacherModalProps> = ({ teacher, onClose, onSaved }) => {
  const [firstName, setFirstName] = useState(teacher?.firstName || '');
  const [lastName, setLastName] = useState(teacher?.lastName || '');
  const [email, setEmail] = useState(teacher?.email || '');
  const [phone, setPhone] = useState(teacher?.phone || '');
  const [specialties, setSpecialties] = useState(teacher ? teacher.specialties.join(', ') : '');
  const [bio, setBio] = useState(teacher?.bio || '');
  const [hourlyRate, setHourlyRate] = useState(teacher?.hourlyRate?.toString() || '');
  const [isActive, setIsActive] = useState(teacher?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFirstName(teacher.firstName);
      setLastName(teacher.lastName);
      setEmail(teacher.email);
      setPhone(teacher.phone || '');
      setSpecialties(teacher.specialties.join(', '));
      setBio(teacher.bio || '');
      setHourlyRate(teacher.hourlyRate?.toString() || '');
      setIsActive(teacher.isActive);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setSpecialties('');
      setBio('');
      setHourlyRate('');
      setIsActive(true);
    }
  }, [teacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const teacherData = {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        specialties: specialties
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        bio: bio || undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        isActive,
      };

      if (teacher) {
        await teacherService.updateTeacher(teacher.id, teacherData);
      } else {
        await teacherService.createTeacher({
          userId: '',
          ...teacherData,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving teacher:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{teacher ? 'Edit Teacher' : 'Add Teacher'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialties (comma separated)</label>
            <input
              type="text"
              value={specialties}
              onChange={e => setSpecialties(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="teacher-active"
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="teacher-active" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
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
              {saving ? 'Saving...' : teacher ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherModal;

