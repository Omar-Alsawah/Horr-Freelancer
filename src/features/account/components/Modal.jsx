const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-2xl" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
