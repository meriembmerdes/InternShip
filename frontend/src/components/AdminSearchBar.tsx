
interface AdminSearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  onSearch: () => void | Promise<void>;
  placeholder?: string;
}

export default function AdminSearchBar({
  search,
  setSearch,
  onSearch,
  placeholder = 'Rechercher...',
}: AdminSearchBarProps) {
  return (
    <div className="admin-search-bar">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            void onSearch();
          }
        }}
        placeholder={placeholder}
        className="admin-search-input"
      />

      <button
        type="button"
        onClick={() => void onSearch()}
        className="admin-search-button"
      >
        Rechercher
      </button>
    </div>
  );
}