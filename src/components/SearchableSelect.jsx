import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder = 'தேர்ந்தெடுக்கவும்...', icon, emptyMessage = 'No results found' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Focus search on open
    useEffect(() => {
        if (isOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen]);

    const filtered = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={containerRef} className="searchable-select">
            {/* Trigger */}
            <button
                type="button"
                className="ss-trigger"
                onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
            >
                <div className="ss-trigger-content">
                    {icon && <span className="ss-icon">{icon}</span>}
                    <span className={`ss-value ${!selectedOption ? 'ss-placeholder' : ''}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown size={14} className={`ss-chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="ss-dropdown">
                    {/* Search Input */}
                    <div className="ss-search-wrap">
                        <Search size={14} className="ss-search-icon" />
                        <input
                            ref={searchRef}
                            type="text"
                            className="ss-search"
                            placeholder="தேடு (Search)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                className="ss-clear"
                                onClick={() => setSearch('')}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <div className="ss-options">
                        {filtered.length === 0 ? (
                            <div className="ss-empty">{emptyMessage}</div>
                        ) : (
                            filtered.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`ss-option ${opt.value === value ? 'selected' : ''}`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    <span className="ss-option-label">{opt.label}</span>
                                    {opt.value === value && <Check size={14} className="ss-check" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
