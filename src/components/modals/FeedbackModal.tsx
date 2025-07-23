import React, { useState } from 'react';
import * as Yup from 'yup';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  message: Yup.string().min(10, 'Message should be at least 10 characters').required('Message is required'),
});

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackSchema.validate(form, { abortEarly: false });
      setErrors({});
      // TODO: Integrate with backend or email service
      console.log('Feedback submitted:', form);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setForm({ name: '', email: '', message: '' });
      }, 2000);
    } catch (err: any) {
      const errorMap: any = {};
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((e: any) => {
          if (e.path && e.message) errorMap[e.path] = e.message;
        });
      } else if (err.message) {
        errorMap.general = err.message;
      }
      setErrors(errorMap);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-2">
        <h2 className="text-xl font-bold mb-4">Send Feedback</h2>
        {success ? (
          <div className="text-green-600 font-semibold text-center py-4">Thank you for your feedback!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="input w-full"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                spellCheck={true}
                autoCorrect="on"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input w-full"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                spellCheck={false}
                autoCorrect="off"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                className="input w-full min-h-[80px]"
                value={form.message}
                onChange={e => handleChange('message', e.target.value)}
                spellCheck={true}
                autoCorrect="on"
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'Send'}
              </button>
            </div>
            {errors.general && <p className="text-red-500 text-xs mt-2 text-center">{errors.general}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal; 