import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddPattaForm from '../components/AddPattaForm';
import './AddPattaPage.css';

const AddPattaPage = () => {
  const navigate = useNavigate();

  const handleFormClose = () => {
    navigate('/');
  };

  // Prevent scrolling when the form is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="patta-page-container">
      <div className="patta-page-content">
        <AddPattaForm onClose={handleFormClose} />
      </div>
    </div>
  );
};

export default AddPattaPage;
