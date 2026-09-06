import "../css/UserModal.css";

function UserModal({ user, onClose }) {

  if (!user) return null;

  return (
    <div className="modal-overlay">

      <div className="user-modal">

        <div className="modal-header">

          <h2>User Details</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        <div className="modal-body">

          <div className="detail-row">
            <span>👤 Full Name</span>
            <p>{user.full_name}</p>
          </div>

          <div className="detail-row">
            <span>📧 Email</span>
            <p>{user.email}</p>
          </div>

          <div className="detail-row">
            <span>🎭 Role</span>
            <p>{user.role}</p>
          </div>

          <div className="detail-row">
            <span>🟢 Status</span>
            <p>Active</p>
          </div>

          <div className="detail-row">
            <span>🆔 User ID</span>
            <p>{user.id}</p>
          </div>

        </div>

        <div className="modal-footer">

          <button
            className="close-button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default UserModal;