import React from 'react';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

/**
 * Reusable Pagination component with per-page selector.
 *
 * @param {object} paginator  - Laravel paginator object (data, links, from, to, total, current_page, last_page)
 * @param {object} filters    - Current active filters (search, status, etc.) to preserve on page change
 * @param {string} routeName  - The named route for this page (e.g. 'admin.suppliers.index')
 * @param {string} entityName - Human-readable entity name (e.g. 'supplier', 'produk')
 */
export default function Pagination({ paginator, filters = {}, routeName, entityName = 'data' }) {
  if (!paginator) return null;

  const perPage = parseInt(filters.per_page || 10);

  const goToPage = (url) => {
    if (!url) return;
    // Extract page number from URL and rebuild with current filters
    const urlObj = new URL(url);
    const page = urlObj.searchParams.get('page');
    router.get(route(routeName), { ...filters, per_page: perPage, page }, {
      preserveState: true,
      replace: true,
    });
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    router.get(route(routeName), { ...filters, per_page: newPerPage, page: 1 }, {
      preserveState: true,
      replace: true,
    });
  };

  const { from, to, total, current_page, last_page, links } = paginator;

  // Filter out the "prev" and "next" links to get just the numbered pages
  const pageLinks = links ? links.slice(1, -1) : [];
  const prevLink = links ? links[0] : null;
  const nextLink = links ? links[links.length - 1] : null;

  return (
    <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
      {/* Left: Result info + per-page selector */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-slate-500 font-medium">
          {from && to ? (
            <>Menampilkan <span className="font-bold text-slate-700">{from}–{to}</span> dari <span className="font-bold text-slate-700">{total}</span> {entityName}</>
          ) : (
            <>Total: <span className="font-bold text-slate-700">{total ?? 0}</span> {entityName}</>
          )}
        </span>

        <div className="h-3.5 w-px bg-slate-200" />

        <label className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          Tampilkan
          <select
            value={perPage}
            onChange={handlePerPageChange}
            className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            {PER_PAGE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          per halaman
        </label>
      </div>

      {/* Right: Page navigation */}
      {last_page > 1 && (
        <div className="flex items-center gap-1">
          {/* Prev button */}
          <button
            onClick={() => goToPage(prevLink?.url)}
            disabled={!prevLink?.url}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page number buttons */}
          {pageLinks.map((link, idx) => {
            if (link.label === '...') {
              return (
                <span key={idx} className="w-7 h-7 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                  …
                </span>
              );
            }
            return (
              <button
                key={idx}
                onClick={() => goToPage(link.url)}
                disabled={!link.url}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  link.active
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } disabled:opacity-40`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            );
          })}

          {/* Next button */}
          <button
            onClick={() => goToPage(nextLink?.url)}
            disabled={!nextLink?.url}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
