import { useEffect, useState } from "react";
import { usePersonnelSearch } from "../../../@core";

interface AutocompleteSelectProps<T> {
  label?: string;
  value: T | null;
  onChange: (selected: T) => void;
  results?: T[];
  loading?: boolean;
  placeholder?: string;
}

export default function AutocompleteSelect<
  T extends {
    id?: number | string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    maternal_name?: string;
  },
>({ label, value, onChange }: AutocompleteSelectProps<T>) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const getFullName = (person: T | null) => {
    if (!person) return "";
    const parts = [
      person.last_name,
      person.maternal_name,
      person.first_name,
      person.middle_name,
    ].filter(Boolean);
    return parts.join(" ");
  };

  useEffect(() => {
    if (value) setQuery(getFullName(value));
  }, [value]);

  const { results, loading, searchPersonnel } = usePersonnelSearch();

  useEffect(() => {
    if (query.length >= 2) searchPersonnel(query);
  }, [query]);

  return (
    <div className="relative w-full">
      <label className="text-sm text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <input
        type="text"
        value={query || ""}
        placeholder="Buscar personal..."
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className="w-full p-2 mt-1 border rounded-lg bg-white dark:bg-gray-900 dark:text-gray-200"
      />

      {open && (
        <div className="absolute z-20 w-full max-h-60 overflow-y-auto mt-1 bg-white border rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          {loading ? (
            <div className="p-3 text-gray-500">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-gray-500">Sin resultados</div>
          ) : (
            results.map((p: any, index: number) => (
              <div
                key={p.id ?? index}
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                  onChange(p);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="font-medium">
                  {p.last_name} {p.maternal_name} {p.first_name} {p.middle_name}
                </div>
                <div className="text-xs text-gray-500">
                  {p.grade_data?.grade_abbr}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
