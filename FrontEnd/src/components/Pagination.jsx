import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem
}) {
    if (totalItems <= itemsPerPage) return null;

    const nextPage = () => onPageChange(Math.min(currentPage + 1, totalPages));
    const prevPage = () => onPageChange(Math.max(currentPage - 1, 1));

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-rustic-mud border-t border-rustic-moss/10">
            {/* Mobile Steps */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Desktop/Tablet Controls */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    {totalItems !== undefined && (
                        <p className="text-sm text-gray-700 dark:text-gray-400">
                            Viewing items <span className="font-medium">{indexOfFirstItem + 1}</span> - <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="font-medium">{totalItems}</span>
                        </p>
                    )}
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-rustic-deep text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button
                                key={number}
                                onClick={() => onPageChange(number)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number
                                    ? "z-10 bg-rustic-green/10 border-rustic-green text-rustic-green"
                                    : "bg-white dark:bg-rustic-deep border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-rustic-deep text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Pagination;
