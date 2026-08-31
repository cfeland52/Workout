import { useApp } from '../../state/AppContext.jsx';

export default function ModalShell({ title, footer, children, onClose }) {
  const { closeModal } = useApp();
  const close = onClose || closeModal;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={close}>&#10005;</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
