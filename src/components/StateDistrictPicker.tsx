import { useState } from "react";
import { ChevronDown, Search, MapPin, Building2 } from "lucide-react";
import { ALL_STATES, INDIA_STATES } from "@/data/indiaData";
import { useTranslation } from "@/hooks/useTranslation";
import type { AppLang } from "@/pages/Index";

interface Props {
  lang: AppLang;
  selectedState: string;
  selectedDistrict: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
}

const LABELS = {
  en: {
    selectState: "Select State",
    selectDistrict: "Select District",
    searchState: "Search state...",
    searchDistrict: "Search district...",
    placeholder: "Please select a state first.",
    stateLabel: "State",
    districtLabel: "District",
  },
  hi: {
    selectState: "राज्य चुनें",
    selectDistrict: "जिला चुनें",
    searchState: "राज्य खोजें...",
    searchDistrict: "जिला खोजें...",
    placeholder: "कृपया पहले राज्य चुनें।",
    stateLabel: "राज्य",
    districtLabel: "जिला",
  },
};

export default function StateDistrictPicker({ lang, selectedState, selectedDistrict, onStateChange, onDistrictChange }: Props) {
  const { t } = useTranslation(lang);
  const isHi = lang === "hi";
  const L = isHi ? LABELS.hi : LABELS.en;

  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [stateOpen, setStateOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);

  const filteredStates = ALL_STATES.filter(s =>
    stateSearch ? s.toLowerCase().includes(stateSearch.toLowerCase()) : true
  );

  const districts = selectedState ? (INDIA_STATES[selectedState] ?? []) : [];
  const filteredDistricts = districts.filter(d =>
    districtSearch ? d.toLowerCase().includes(districtSearch.toLowerCase()) : true
  );

  const handleStateSelect = (state: string) => {
    onStateChange(state);
    onDistrictChange(""); // reset district
    setStateOpen(false);
    setStateSearch("");
    setDistrictSearch("");
  };

  const handleDistrictSelect = (district: string) => {
    onDistrictChange(district);
    setDistrictOpen(false);
    setDistrictSearch("");
  };

  return (
    <div className="space-y-4">
      {/* State Picker */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
          <MapPin size={12} /> {L.stateLabel}
        </label>

        {/* State trigger button */}
        <button
          type="button"
          onClick={() => { setStateOpen(o => !o); setDistrictOpen(false); }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-all"
          style={{
            borderColor: selectedState ? "#16a34a" : "#e5e7eb",
            background: selectedState ? "#f0fdf4" : "white",
            color: selectedState ? "#15803d" : "#9ca3af",
          }}
        >
          <span>{selectedState ? t(selectedState) : L.selectState}</span>
          <ChevronDown size={16} className={`transition-transform ${stateOpen ? "rotate-180" : ""}`} style={{ color: "#9ca3af" }} />
        </button>

        {/* State dropdown */}
        {stateOpen && (
          <div className="mt-1 rounded-2xl border-2 border-gray-100 bg-white shadow-xl overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={stateSearch}
                  onChange={e => setStateSearch(e.target.value)}
                  placeholder={L.searchState}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:border-green-400 bg-gray-50"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-2 grid grid-cols-2 gap-1">
              {filteredStates.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStateSelect(s)}
                  className="text-left px-3 py-2 rounded-xl text-xs font-bold transition-all hover:bg-green-50"
                  style={{
                    background: selectedState === s ? "#f0fdf4" : "transparent",
                    color: selectedState === s ? "#16a34a" : "#374151",
                    border: selectedState === s ? "1px solid #bbf7d0" : "1px solid transparent",
                  }}
                >
                  {t(s)}
                </button>
              ))}
              {filteredStates.length === 0 && (
                <p className="col-span-2 text-center text-xs text-gray-400 py-4">No results</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* District Picker */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
          <Building2 size={12} /> {L.districtLabel}
          {selectedState && <span className="text-green-600 normal-case font-bold">— {t(selectedState)}</span>}
        </label>

        {!selectedState ? (
          /* Placeholder when no state selected */
          <div className="w-full px-4 py-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400 font-bold text-center">
            {L.placeholder}
          </div>
        ) : (
          <>
            {/* District trigger button */}
            <button
              type="button"
              onClick={() => { setDistrictOpen(o => !o); setStateOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-all"
              style={{
                borderColor: selectedDistrict ? "#16a34a" : "#e5e7eb",
                background: selectedDistrict ? "#f0fdf4" : "white",
                color: selectedDistrict ? "#15803d" : "#9ca3af",
              }}
            >
              <span>{selectedDistrict ? t(selectedDistrict) : L.selectDistrict}</span>
              <ChevronDown size={16} className={`transition-transform ${districtOpen ? "rotate-180" : ""}`} style={{ color: "#9ca3af" }} />
            </button>

            {/* District dropdown */}
            {districtOpen && (
              <div className="mt-1 rounded-2xl border-2 border-gray-100 bg-white shadow-xl overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      autoFocus
                      value={districtSearch}
                      onChange={e => setDistrictSearch(e.target.value)}
                      placeholder={L.searchDistrict}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:border-green-400 bg-gray-50"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-2 grid grid-cols-2 gap-1">
                  {filteredDistricts.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDistrictSelect(d)}
                      className="text-left px-3 py-2 rounded-xl text-xs font-bold transition-all hover:bg-green-50"
                      style={{
                        background: selectedDistrict === d ? "#f0fdf4" : "transparent",
                        color: selectedDistrict === d ? "#16a34a" : "#374151",
                        border: selectedDistrict === d ? "1px solid #bbf7d0" : "1px solid transparent",
                      }}
                    >
                      {t(d)}
                    </button>
                  ))}
                  {filteredDistricts.length === 0 && (
                    <p className="col-span-2 text-center text-xs text-gray-400 py-4">No results</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
