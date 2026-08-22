import React, { useState } from 'react';
import { Search, Layers, Filter, ArrowUpDown, X, Check, ChevronDown } from 'lucide-react';

export default function TopBar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  groupByOptions = [],
  selectedGroupBy = '',
  onGroupByChange,
  filterOptions = [],
  selectedFilters = {},
  onFilterChange,
  sortOptions = [],
  selectedSort = '',
  onSortChange,
  actionButton = null,
  title = '',
  subtitle = ''
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const activeFilterCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-6 space-y-4">
      {/* Title & Actions Row (if provided) */}
      {(title || actionButton) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            {title && <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>
      )}

      {/* Control Bar: Search + Group By + Filter + Sort By */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Group By Dropdown */}
        {groupByOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => { setGroupOpen(!groupOpen); setFilterOpen(false); setSortOpen(false); }}
              className={`flex items-center space-x-2 px-3.5 py-2 border rounded-xl text-sm font-medium transition-all ${
                selectedGroupBy
                  ? 'bg-brand-50 border-brand-200 text-brand-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>{selectedGroupBy ? `Group: ${groupByOptions.find(g => g.value === selectedGroupBy)?.label || selectedGroupBy}` : 'Group by'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {groupOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => { onGroupByChange && onGroupByChange(''); setGroupOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <span>No Grouping</span>
                  {!selectedGroupBy && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </button>
                {groupByOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onGroupByChange && onGroupByChange(opt.value); setGroupOpen(false); }}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <span>{opt.label}</span>
                    {selectedGroupBy === opt.value && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filter Button & Popover */}
        {filterOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => { setFilterOpen(!filterOpen); setGroupOpen(false); setSortOpen(false); }}
              className={`flex items-center space-x-2 px-3.5 py-2 border rounded-xl text-sm font-medium transition-all ${
                activeFilterCount > 0
                  ? 'bg-brand-50 border-brand-200 text-brand-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4 text-slate-500" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 sm:left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-40 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Criteria</h4>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => onFilterChange && onFilterChange({})}
                      className="text-xs text-brand-600 hover:underline font-semibold"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {filterOptions.map((filter) => (
                    <div key={filter.key} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">{filter.label}</label>
                      <select
                        value={selectedFilters[filter.key] || ''}
                        onChange={(e) => onFilterChange && onFilterChange({ ...selectedFilters, [filter.key]: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="">All {filter.label}s</option>
                        {filter.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sort By Dropdown */}
        {sortOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => { setSortOpen(!sortOpen); setGroupOpen(false); setFilterOpen(false); }}
              className={`flex items-center space-x-2 px-3.5 py-2 border rounded-xl text-sm font-medium transition-all ${
                selectedSort
                  ? 'bg-brand-50 border-brand-200 text-brand-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ArrowUpDown className="w-4 h-4 text-slate-500" />
              <span>{selectedSort ? `Sort: ${sortOptions.find(s => s.value === selectedSort)?.label || selectedSort}` : 'Sort by...'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {sortOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in slide-in-from-top-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onSortChange && onSortChange(opt.value); setSortOpen(false); }}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <span>{opt.label}</span>
                    {selectedSort === opt.value && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
