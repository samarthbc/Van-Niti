import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddPattaForm from '../components/AddPattaForm';

const AddPattaPage = () => {
  const navigate = useNavigate();

  const handleFormClose = () => {
    navigate('/');
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-y-auto">
        <AddPattaForm onClose={handleFormClose} />
      </div>
    </div>
  );
};

export default AddPattaPage;
