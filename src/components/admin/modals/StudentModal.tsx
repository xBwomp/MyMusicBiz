import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { studentService } from '../../../services/programService';
import { familyService } from '../../../services/adminService';
import { Family } from '../../../types/admin';
import { Student } from '../../../types/program';

interface StudentModalProps {
  student?: Student;
  onClose: () => void;
  onSaved: () => void;
}

const StudentModal: React.FC<StudentModalProps> = ({ student, onClose, onSaved }) => {
  const [firstName, setFirstName] = useState(student?.firstName || '');
  const [lastName, setLastName] = useState(student?.lastName || '');
  const [email, setEmail] = useState(student?.email || '');
  const [familyId, setFamilyId] = useState(student?.familyId || '');
  const [families, setFamilies] = useState<Family[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setFirstName(student.firstName);
      setLastName(student.lastName);
      setEmail(student.email);
      setFamilyId(student.familyId || '');
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setFamilyId('');
    }
  }, [student]);

  useEffect(() => {
    const loadFamilies = async () => {
      try {
        const data = await familyService.getFamilies();
        setFamilies(data);
      } catch (error) {
        console.error('Error loading families:', error);
      }
    };
    loadFamilies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (student) {
        await studentService.updateStudent(student.id, {
          firstName,
          lastName,
          email,
          familyId: familyId || undefined,
        });

        if (student.familyId !== familyId) {
          if (student.familyId) {
            const oldFamily = families.find(f => f.id === student.familyId);
            await familyService.updateFamily(student.familyId, {
              students: (oldFamily?.students || []).filter(id => id !== student.id),
            });
          }
          if (familyId) {
            const newFamily = families.find(f => f.id === familyId);
            await familyService.updateFamily(familyId, {
              students: [...(newFamily?.students || []), student.id],
            });
          }
        }
      } else {
        const studentId = await studentService.createStudent({
          firstName,
          lastName,
          email,
          familyId: familyId || undefined,
          enrolledOfferings: [],
          isActive: true,
        });
        if (familyId) {
          const family = families.find(f => f.id === familyId);
          await familyService.updateFamily(familyId, {
            students: [...(family?.students || []), studentId],
          });
        }
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{student ? 'Edit Student' : 'Add Student'}</h3>
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
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family</label>
            <select
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">No family</option>
              {families.map(f => (
                <option key={f.id} value={f.id}>{f.familyName} Family</option>
              ))}
            </select>
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
              {saving ? 'Saving...' : student ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
