


type AccountCardProps = {
  username?: string;
  email?: string;
  onEdit: () => void;
};

export function AccountCard({ username, email, onEdit }: AccountCardProps) {
  return (
    <div className="section-card fade-up fade-up-1">
      <div className="section-card-header">
        <h3>Account</h3>
        <button className="btn btn-ghost btn-sm" onClick={onEdit}>
          Edit →
        </button>
      </div>
      <div className="data-row">
        <span className="data-label">Username</span>
        <span className="data-value">{username}</span>
      </div>
      <div className="data-row">
        <span className="data-label">Email</span>
        <span className="data-value">{email}</span>
      </div>
    </div>
  );
}
